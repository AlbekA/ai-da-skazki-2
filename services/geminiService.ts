// Frontend service: calls serverless functions on Netlify
import { StoryFormData } from "../components/StoryForm";

export async function generateStoryPart(formData: StoryFormData, storyHistory: string, isFirstPart: boolean) {
  const resp = await fetch('/.netlify/functions/generate-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formData, storyHistory, isFirstPart })
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error('Server error: ' + resp.status + ' ' + text);
  }
  return await resp.json(); // { storyPart, choices }
}

export async function generateAudio(text: string, voiceId: string) {
  const resp = await fetch('/.netlify/functions/generate-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voiceId })
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error('Server error: ' + resp.status + ' ' + text);
  }
  return await resp.json(); // { base64Audio }
}
