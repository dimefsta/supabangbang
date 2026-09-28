/**
 * SupaBangBang Arcade Hub Interactivity
 * Handles Web Audio synth sounds, keyboard shortcuts, and hash navigation
 */

class HubAudio {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('supa_hub_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.init();
    this.muted = !this.muted;
    localStorage.setItem('supa_hub_muted', this.muted.toString());
    return this.muted;
  }

  playSelect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Ignore audio failure
    }
  }

  playLaunch() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.001, now + idx * 0.05 + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.14);
      });
    } catch {
      // Ignore audio failure
    }
  }
}

const audio = new HubAudio();

// UI Elements
const audioBtn = document.getElementById('btnAudioToggle');
const audioIcon = document.getElementById('audioIcon');
const audioText = document.getElementById('audioText');
const cardV1 = document.getElementById('cardV1');
const cardV2 = document.getElementById('cardV2');

function updateAudioUI() {
  if (audio.muted) {
    if (audioIcon) audioIcon.textContent = '🔇';
    if (audioText) audioText.textContent = 'MUTED';
    if (audioBtn) audioBtn.setAttribute('title', 'Unmute Sound (M)');
  } else {
    if (audioIcon) audioIcon.textContent = '🔊';
    if (audioText) audioText.textContent = 'SOUND ON';
    if (audioBtn) audioBtn.setAttribute('title', 'Mute Sound (M)');
  }
}

updateAudioUI();

if (audioBtn) {
  audioBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isMuted = audio.toggleMute();
    updateAudioUI();
    if (!isMuted) audio.playSelect();
  });
}

function launchMode(targetUrl) {
  audio.playLaunch();
  setTimeout(() => {
    window.location.href = targetUrl;
  }, 120);
}

if (cardV1) {
  cardV1.addEventListener('mouseenter', () => audio.playSelect());
  cardV1.addEventListener('click', (e) => {
    e.preventDefault();
    launchMode('./v1/index.html');
  });
}

if (cardV2) {
  cardV2.addEventListener('mouseenter', () => audio.playSelect());
  cardV2.addEventListener('click', (e) => {
    e.preventDefault();
    launchMode('./v2/index.html');
  });
}

// Global Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

  if (e.key === '1') {
    launchMode('./v1/index.html');
  } else if (e.key === '2') {
    launchMode('./v2/index.html');
  } else if (e.key.toLowerCase() === 'm') {
    audio.toggleMute();
    updateAudioUI();
  }
});

// Hash routing support (e.g., #/v1, #v1, #/v2, #v2, ?v=1, ?v=2)
function handleRouting() {
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();

  if (hash.includes('v1') || hash.includes('1st-edition') || search.includes('v=1')) {
    window.location.replace('./v1/index.html');
  } else if (hash.includes('v2') || hash.includes('modern') || search.includes('v=2')) {
    window.location.replace('./v2/index.html');
  }
}

handleRouting();
window.addEventListener('hashchange', handleRouting);
