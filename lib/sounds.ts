import * as Tone from 'tone';

let soundEnabled: boolean | null = null;

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  try { localStorage.setItem('waya_sound_enabled', String(enabled)); } catch {}
}

export function isSoundEnabled(): boolean {
  if (soundEnabled === null) {
    try { soundEnabled = localStorage.getItem('waya_sound_enabled') !== 'false'; } catch { soundEnabled = true; }
  }
  return soundEnabled;
}

export async function playMessageSent() {
  if (!isSoundEnabled()) return;
  await Tone.start();
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.002, decay: 0.04, sustain: 0, release: 0.04 },
  }).toDestination();
  const now = Tone.now();
  synth.triggerAttackRelease('C6', '64n', now);
  setTimeout(() => synth.dispose(), 200);
}

export async function playXPChime() {
  if (!isSoundEnabled()) return;
  await Tone.start();
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
  }).toDestination();
  synth.triggerAttackRelease('A5', '64n');
  setTimeout(() => synth.dispose(), 500);
}

export async function playTicking() {
  if (!isSoundEnabled()) return;
  await Tone.start();
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.03 },
  }).toDestination();
  const now = Tone.now();
  synth.triggerAttackRelease('E5', '32n', now);
  setTimeout(() => synth.dispose(), 150);
}

export async function playLevelUp() {
  if (!isSoundEnabled()) return;
  await Tone.start();
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.3 },
  }).toDestination();
  const now = Tone.now();
  synth.triggerAttackRelease('C5', '8n', now);
  synth.triggerAttackRelease('E5', '8n', now + 0.1);
  synth.triggerAttackRelease('G5', '8n', now + 0.2);
  setTimeout(() => synth.dispose(), 1500);
}

export async function playStreakSound() {
  if (!isSoundEnabled()) return;
  await Tone.start();
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0, release: 0.2 },
  }).toDestination();
  const now = Tone.now();
  synth.triggerAttackRelease('A4', '8n', now);
  synth.triggerAttackRelease('D5', '8n', now + 0.15);
  setTimeout(() => synth.dispose(), 1000);
}
