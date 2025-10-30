import React, { useState } from "react";
import Header from "../components/Header"; // ✅ правильный путь к Header
import { generateStory } from "./utils/audio"; // если файл audio.ts есть в src/utils

function App() {
  const [storyText, setStoryText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleCreateStory = async () => {
    setIsLoading(true);
    setAudioUrl(null);

    try {
      const story = await generateStory(); // функция, создающая аудиосказку
      setStoryText(story.text);
      setAudioUrl(story.audioUrl);
    } catch (error) {
      console.error("Ошибка при создании сказки:", error);
      alert("Не удалось создать сказку. Проверьте настройки или ключ API.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Header />

      <main style={{ textAlign: "center", padding: "2rem" }}>
        <h1>🎧 AI-да-сказки</h1>
        <p>Создай волшебную аудиосказку с помощью искусственного интеллекта!</p>

        <button
          onClick={handleCreateStory}
          disabled={isLoading}
          style={{
            padding: "1rem 2rem",
            fontSize: "1rem",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          {isLoading ? "Создаём сказку..." : "Создать сказку"}
        </button>

        {storyText && (
          <div style={{ marginTop: "2rem" }}>
            <h2>✨ Твоя сказка:</h2>
            <p style={{ whiteSpace: "pre-line" }}>{storyText}</p>
          </div>
        )}

        {audioUrl && (
          <div style={{ marginTop: "2rem" }}>
            <h2>🔊 Слушай сказку:</h2>
            <audio controls src={audioUrl}></audio>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
