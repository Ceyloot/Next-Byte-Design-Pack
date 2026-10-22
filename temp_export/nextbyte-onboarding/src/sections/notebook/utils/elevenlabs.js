const VOICES = {
  presenter1: 'pNInz6obpgDQGcFmaJgB',  // Adam — deep male
  presenter2: 'EXAVITQu4vr4xnSDxMaL',  // Bella — female
};

export async function generateSpeech(apiKey, text, voiceId = VOICES.presenter1) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`ElevenLabs error ${res.status}: ${err}`);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function generatePodcast(apiKey, exchanges) {
  const segments = [];
  for (const ex of exchanges) {
    const voiceId = ex.speaker.includes('1') ? VOICES.presenter1 : VOICES.presenter2;
    const url = await generateSpeech(apiKey, ex.text, voiceId);
    segments.push({ ...ex, audioUrl: url });
  }
  return segments;
}

export { VOICES };
