
// netlify/functions/generate-audio.js
const { GoogleGenAI } = require("@google/genai");

exports.handler = async function(event, context) {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
    const body = JSON.parse(event.body || '{}');
    const { text, voiceId } = body;

    const apiKey = process.env.GEMINI_API_KEY || process.env.GENAI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return { statusCode: 500, body: 'Server misconfiguration: missing API key' };
    }

    const client = new GoogleGenAI({ apiKey });

    // This is an illustrative TTS call — adjust to actual SDK method names and response structure
    const response = await client.generateAudio({
      model: 'models/audio-bison-001',
      input: text,
      voice: voiceId || 'alloy',
      audioConfig: { format: 'wav', sampleRateHertz: 24000 }
    });

    const base64Audio = response?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      // try alternative fields
      const alt = response?.audio || response?.data || null;
      if (alt && typeof alt === 'string') {
        return { statusCode: 200, body: JSON.stringify({ base64Audio: alt }) };
      }
      console.error('No audio in response', JSON.stringify(response).slice(0,500));
      return { statusCode: 500, body: 'No audio returned from API' };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ base64Audio })
    };
  } catch (err) {
    console.error('generate-audio error', err);
    return { statusCode: 500, body: 'Audio generation error: ' + (err.message || String(err)) };
  }
};
