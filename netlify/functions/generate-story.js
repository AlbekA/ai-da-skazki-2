
// netlify/functions/generate-story.js
const { GoogleGenAI } = require("@google/genai");

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const body = JSON.parse(event.body || '{}');
    const { formData, storyHistory, isFirstPart } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return { statusCode: 500, body: 'Server misconfiguration: missing API key' };
    }

    const client = new GoogleGenAI({ apiKey });

    // Example text generation request — adapt prompts to your needs
    const prompt = `Сгенерируй часть аудиосказки для ребёнка. Данные: ${JSON.stringify(formData)}. История: ${storyHistory || ''}`;

    const response = await client.generateText({
      model: 'models/text-bison-001',
      input: prompt,
      // Add other options if needed
    });

    // Try to extract text output in different SDK shapes
    let storyPart = '';
    if (response.output && typeof response.output === 'string') {
      storyPart = response.output;
    } else if (Array.isArray(response.output) && response.output.length) {
      storyPart = response.output.map(o => o.content?.[0]?.text || '').join('\\n');
    } else if (response?.candidates?.[0]?.output) {
      storyPart = response.candidates[0].output;
    } else if (response?.text) {
      storyPart = response.text;
    } else {
      storyPart = JSON.stringify(response).slice(0, 1000);
    }

    // For interactive choices — very simple extraction or static choices
    const choices = ["Пойти направо", "Пойти налево"];

    return {
      statusCode: 200,
      body: JSON.stringify({ storyPart, choices })
    };
  } catch (err) {
    console.error('generate-story error', err);
    return { statusCode: 500, body: 'Generation error: ' + (err.message || String(err)) };
  }
};
