// src/utils/audio.ts
// Низкоуровневые утилиты (сохранил твою реализацию)
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Helper: convert base64 string to Blob
 * @param base64 - строка base64 (без data:... префикса)
 * @param mime - MIME-тип, например "audio/wav" или "audio/mpeg"
 */
export function base64ToBlob(base64: string, mime = "audio/wav"): Blob {
  const bytes = atob(base64);
  const len = bytes.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = bytes.charCodeAt(i);
  }
  return new Blob([buffer.buffer], { type: mime });
}

/**
 * High-level helper: запрашивает на сервере сгенерированную часть сказки,
 * затем (опционально) получает аудио и возвращает text + audioUrl (object URL).
 *
 * Возвращает:
 * { text: string, audioUrl: string | null }
 *
 * Примечания:
 * - Ожидается, что у тебя есть Netlify Functions:
 *   /.netlify/functions/generate-story  (возвращает { storyPart: string, choices: string[] })
 *   /.netlify/functions/generate-audio  (принимает { text, voiceId } и возвращает { base64Audio })
 * - Если твоё backend API возвращает другие поля, подкорректируй соответствующие строки.
 */
export async function generateStory(): Promise<{ text: string; audioUrl: string | null }> {
  // 1) Запрос текста сказки
  const storyResp = await fetch("/.netlify/functions/generate-story", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ /* можно передать дополнительные данные при необходимости */ }),
  });

  if (!storyResp.ok) {
    const text = await storyResp.text().catch(() => "");
    throw new Error("Ошибка генерации текста сказки: " + storyResp.status + " " + text);
  }

  const storyJson = await storyResp.json().catch(() => ({} as any));
  const text: string = storyJson.storyPart || storyJson.text || "";

  // 2) Запрос аудио (если нужен)
  // Если ты не используешь отдельную функцию генерации аудио — можно пропустить этот блок.
  let audioUrl: string | null = null;
  try {
    const audioResp = await fetch("/.netlify/functions/generate-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voiceId: "alloy" }), // укажи voiceId по своему API
    });

    if (audioResp.ok) {
      const audioJson = await audioResp.json().catch(() => ({} as any));
      const base64Audio = audioJson.base64Audio || audioJson.audio || null;

      if (base64Audio && typeof base64Audio === "string") {
        const blob = base64ToBlob(base64Audio, "audio/wav");
        audioUrl = URL.createObjectURL(blob);
        // Замечание: URL нужно освобождать через URL.revokeObjectURL(url) когда он больше не нужен.
      }
    } else {
      // не фатальная ошибка: текст есть, но аудио не получилось
      console.warn("Генерация аудио вернула статус", audioResp.status);
    }
  } catch (err) {
    console.warn("Ошибка при попытке получить аудио:", err);
    // не бросаем ошибку, чтобы UI мог показать текст сказки
  }

  return { text, audioUrl };
}
