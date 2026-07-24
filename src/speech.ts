import * as Speech from 'expo-speech';
import { getProfileValue } from './db';

type Voice = Awaited<ReturnType<typeof Speech.getAvailableVoicesAsync>>[number];

let cachedVoice: string | null | undefined;

function scoreVoice(voice: Voice) {
  const name = `${voice.name} ${voice.identifier}`.toLowerCase();
  let score = 0;
  if (voice.language?.toLowerCase() === 'ja-jp') score += 20;
  if (voice.language?.toLowerCase().startsWith('ja')) score += 10;
  if (voice.quality === Speech.VoiceQuality.Enhanced) score += 12;
  if (name.includes('google')) score += 8;
  if (name.includes('network')) score += 5;
  if (name.includes('female')) score += 2;
  if (name.includes('male')) score += 1;
  return score;
}

export async function listJapaneseVoices() {
  const voices = await Speech.getAvailableVoicesAsync();
  return voices
    .filter((voice) => voice.language?.toLowerCase().startsWith('ja'))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

async function getJapaneseVoice() {
  const selected = getProfileValue('ttsVoiceId');
  if (selected) return selected;
  if (cachedVoice !== undefined) return cachedVoice;
  const japanese = await listJapaneseVoices();
  cachedVoice = japanese[0]?.identifier ?? null;
  return cachedVoice;
}

export function clearVoiceCache() {
  cachedVoice = undefined;
}

export async function speakJapanese(text: string) {
  const value = text.trim();
  if (!value) return;
  const voice = await getJapaneseVoice();
  Speech.stop();
  Speech.speak(value, {
    language: 'ja-JP',
    voice: voice ?? undefined,
    rate: 0.9,
    pitch: 1.0
  });
}

export async function hasJapaneseVoice() {
  return !!(await getJapaneseVoice());
}
