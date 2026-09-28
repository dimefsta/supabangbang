/**
 * SUPABANGBANG - Retro Arcade Pang (Super Pang)
 * Full HTML5 Canvas Engine with Authentic Physics, Stages, Power-ups & 2-Player Mode
 */

// ==========================================
// 1. SOUND SYSTEM (Web Audio API + WAV Fallback)
// ==========================================
class RetroAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.wavShoot = new Audio("sounds/shoot.wav");
    this.wavPop = new Audio("sounds/pop.wav");
    this.wavShoot.volume = 0.4;
    this.wavPop.volume = 0.5;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(freq, type, duration, startVol = 0.3, endVol = 0.01) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(startVol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(endVol, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent ignore
    }
  }

  shoot() {
    if (!this.enabled) return;
    try {
      this.wavShoot.currentTime = 0;
      this.wavShoot.play().catch(() => {});
    } catch (e) {}

    // Synth laser zap
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch (e) {}
  }

  pop(tier = 4) {
    if (!this.enabled) return;
    try {
      this.wavPop.currentTime = 0;
      this.wavPop.play().catch(() => {});
    } catch (e) {}

    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const baseFreq = 160 + (5 - tier) * 90;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(baseFreq * 2, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.11);
    } catch (e) {}
  }

  powerup() {
    if (!this.enabled) return;
    const notes = [330, 440, 554, 659];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, "square", 0.1, 0.2), idx * 60);
    });
  }

  freeze() {
    if (!this.enabled) return;
    this.playTone(880, "sine", 0.4, 0.3);
    setTimeout(() => this.playTone(1174, "sine", 0.4, 0.3), 100);
  }

  tick() {
    if (!this.enabled) return;
    this.playTone(1200, "square", 0.03, 0.15);
  }

  dynamite() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Noise buffer for explosion
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.45);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch (e) {}
  }

  hurt() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {}
  }

  stageClear() {
    if (!this.enabled) return;
    const melody = [
      { f: 523, d: 0.12 }, { f: 659, d: 0.12 }, { f: 783, d: 0.12 },
      { f: 1046, d: 0.3 }
    ];
    melody.forEach((note, i) => {
      setTimeout(() => this.playTone(note.f, "triangle", note.d, 0.3), i * 140);
    });
  }

  gameOver() {
    if (!this.enabled) return;
    const notes = [440, 415, 392, 349];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, "sawtooth", 0.35, 0.3), idx * 250);
    });
  }
}

const audio = new RetroAudio();

// ==========================================
// 2. CONSTANTS & CONFIGURATION
// ==========================================
const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;
const CEILING_Y = 64;
const FLOOR_Y = 645;
const GRAVITY = 0.28;

// Ball Tiers configuration (Authentic Pang bounce heights)
const BALL_TIERS = {
  4: { radius: 36, color: "#ff2a5f", bounce: -12.4, speed: 2.3, points: 100, name: "Huge" },
  3: { radius: 26, color: "#00b4d8", bounce: -10.8, speed: 2.6, points: 200, name: "Large" },
  2: { radius: 17, color: "#06d6a0", bounce: -9.2,  speed: 3.0, points: 400, name: "Medium" },
  1: { radius: 10, color: "#ffd166", bounce: -7.5,  speed: 3.4, points: 800, name: "Small" },
};

// Powerup types
const POWERUP_TYPES = [
  { id: "DOUBLE", icon: "🔱", color: "#f97316", name: "Double Harpoon", weight: 30 },
  { id: "HOOK",   icon: "⚓",  color: "#f59e0b", name: "Sticky Hook",  weight: 25 },
  { id: "GUN",    icon: "⚡",  color: "#ec4899", name: "Vulcan Gun",   weight: 20 },
  { id: "CLOCK",  icon: "⏱️", color: "#818cf8", name: "Time Freeze",  weight: 15 },
  { id: "DYNAMITE",icon: "🧨", color: "#ef4444", name: "Dynamite",     weight: 10 },
  { id: "SHIELD", icon: "🛡️", color: "#10b981", name: "Shield",        weight: 15 },
  { id: "LIFE",   icon: "❤️",  color: "#f43f5e", name: "Extra Life",   weight: 5 },
];

// ==========================================
// 3. STAGES / LEVELS DEFINITIONS
// ==========================================
const STAGES = [
  {
    id: 1,
    title: "Stage 1: Mount Fuji, Japan",
    subtitle: "Welcome to Pang! Pop the bouncing bubble!",
    theme: "fuji",
    timer: 60,
    balls: [
      { x: 500, y: 140, tier: 4, dx: 2.3, dy: 0 }
    ],
    blocks: [],
    ladders: []
  },
  {
    id: 2,
    title: "Stage 2: Acropolis, Athens",
    subtitle: "Ancient columns! Double threat incoming!",
    theme: "athens",
    timer: 60,
    balls: [
      { x: 300, y: 160, tier: 3, dx: -2.6, dy: 0 },
      { x: 700, y: 160, tier: 3, dx: 2.6, dy: 0 }
    ],
    blocks: [],
    ladders: []
  },
  {
    id: 3,
    title: "Stage 3: Maya Pyramids, Mexico",
    subtitle: "Breakable stone bricks! Shoot them or dodge!",
    theme: "maya",
    timer: 60,
    balls: [
      { x: 500, y: 120, tier: 4, dx: 2.3, dy: 0 }
    ],
    blocks: [
      { x: 350, y: 400, w: 60, h: 24, breakable: true, health: 1 },
      { x: 420, y: 400, w: 60, h: 24, breakable: true, health: 1 },
      { x: 490, y: 400, w: 60, h: 24, breakable: true, health: 1 },
      { x: 560, y: 400, w: 60, h: 24, breakable: true, health: 1 }
    ],
    ladders: []
  },
  {
    id: 4,
    title: "Stage 4: Easter Island (Rapa Nui)",
    subtitle: "Climb the ladders to reach higher ground!",
    theme: "easter",
    timer: 65,
    balls: [
      { x: 250, y: 140, tier: 3, dx: -2.6, dy: 0 },
      { x: 750, y: 140, tier: 3, dx: 2.6, dy: 0 },
      { x: 500, y: 180, tier: 2, dx: 3.0, dy: 0 }
    ],
    blocks: [
      { x: 150, y: 460, w: 220, h: 20, breakable: false },
      { x: 630, y: 460, w: 220, h: 20, breakable: false }
    ],
    ladders: [
      { x: 240, y: 460, w: 36, h: 185 },
      { x: 720, y: 460, w: 36, h: 185 }
    ]
  },
  {
    id: 5,
    title: "Stage 5: Eiffel Tower, Paris",
    subtitle: "Trapped bubbles above! Break through wisely!",
    theme: "paris",
    timer: 70,
    balls: [
      { x: 300, y: 140, tier: 3, dx: 2.6, dy: 0 },
      { x: 700, y: 140, tier: 3, dx: -2.6, dy: 0 }
    ],
    blocks: [
      // Upper barrier
      { x: 200, y: 320, w: 60, h: 20, breakable: true, health: 1 },
      { x: 270, y: 320, w: 60, h: 20, breakable: true, health: 1 },
      { x: 340, y: 320, w: 60, h: 20, breakable: true, health: 1 },
      { x: 410, y: 320, w: 60, h: 20, breakable: false },
      { x: 480, y: 320, w: 60, h: 20, breakable: false },
      { x: 550, y: 320, w: 60, h: 20, breakable: true, health: 1 },
      { x: 620, y: 320, w: 60, h: 20, breakable: true, health: 1 },
      { x: 690, y: 320, w: 60, h: 20, breakable: true, health: 1 }
    ],
    ladders: [
      { x: 470, y: 320, w: 36, h: 325 }
    ]
  },
  {
    id: 6,
    title: "Stage 6: Pyramids of Giza, Egypt",
    subtitle: "Final Challenge! The Ultimate Pop Master!",
    theme: "egypt",
    timer: 75,
    balls: [
      { x: 250, y: 130, tier: 4, dx: 2.3, dy: 0 },
      { x: 750, y: 130, tier: 4, dx: -2.3, dy: 0 }
    ],
    blocks: [
      { x: 400, y: 440, w: 200, h: 20, breakable: false },
      { x: 100, y: 340, w: 120, h: 20, breakable: true, health: 1 },
      { x: 780, y: 340, w: 120, h: 20, breakable: true, health: 1 }
    ],
    ladders: [
      { x: 485, y: 440, w: 36, h: 205 }
    ]
  }
];

// ==========================================
// 4. GAME STATE & VARIABLES
// ==========================================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameState = "TITLE"; // TITLE, INTRO, PLAYING, LEVEL_CLEAR, GAME_OVER, VICTORY, PAUSED
let previousState = "PLAYING";
let twoPlayerMode = false;
let currentStageIndex = 0;
let stageTimer = 60;
let stageTimerInterval = null;
let stageBannerTimer = 0;
let highScore = parseInt(localStorage.getItem("supabangbang_highscore") || "0", 10);
let screenShake = 0;
let timeFreezeTimer = 0;

// Collections
let balls = [];
let harpoons = [];
let particles = [];
let floatingTexts = [];
let powerups = [];
let stageBlocks = [];
let stageLadders = [];

// Players Setup
class Player {
  constructor(id, name, color, hatColor, x) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.hatColor = hatColor;
    this.x = x;
    this.y = FLOOR_Y - 54;
    this.width = 44;
    this.height = 54;
    this.speed = 5.2;
    this.climbSpeed = 3.6;
    this.dx = 0;
    this.dy = 0;
    this.facing = 1; // 1 = right, -1 = left
    this.lives = 3;
    this.score = 0;
    this.safe = false;
    this.safeTimer = 0;
    this.weapon = "NORMAL"; // NORMAL, DOUBLE, HOOK, GUN
    this.weaponTimer = 0;
    this.hasShield = false;
    this.isClimbing = false;
    this.onLadder = false;
    this.walkFrame = 0;
    this.walkAnimTimer = 0;
    this.shootingPose = false;
    this.shootPoseTimer = 0;
  }

  resetPosition() {
    this.x = this.id === 1 ? (twoPlayerMode ? 350 : 478) : 550;
    this.y = FLOOR_Y - this.height;
    this.dx = 0;
    this.dy = 0;
    this.isClimbing = false;
    this.onLadder = false;
    this.weapon = "NORMAL";
    this.hasShield = false;
  }

  makeSafe(seconds = 2.0) {
    this.safe = true;
    this.safeTimer = seconds;
  }
}

let player1 = new Player(1, "Player 1", "#ff1e27", "#ff7700", 478);
let player2 = new Player(2, "Player 2", "#00e676", "#ffd600", 560);

// Key state tracker
const keys = {};

// ==========================================
// 5. INPUT HANDLING
// ==========================================
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  audio.init();

  if (e.code === "KeyP") {
    togglePause();
    e.preventDefault();
    return;
  }

  if (e.code === "KeyM") {
    toggleMute();
    e.preventDefault();
    return;
  }

  if (gameState === "TITLE") {
    if (e.code === "Space" || e.code === "Enter") {
      startGame();
      e.preventDefault();
    }
  } else if (gameState === "GAME_OVER" || gameState === "VICTORY") {
    if (e.code === "Space" || e.code === "Enter") {
      resetFullGame();
      e.preventDefault();
    }
  } else if (gameState === "PLAYING") {
    if (e.code === "Space") {
      shootPlayer(player1);
      e.preventDefault();
    }
    if (twoPlayerMode && (e.code === "KeyF" || e.code === "KeyJ")) {
      shootPlayer(player2);
      e.preventDefault();
    }
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// UI Buttons
document.getElementById("btnSound").addEventListener("click", toggleMute);
document.getElementById("btnPause").addEventListener("click", togglePause);
document.getElementById("btnFullscreen").addEventListener("click", toggleFullscreen);
const btnToggle2P = document.getElementById("btnToggle2P");
btnToggle2P.addEventListener("click", () => {
  twoPlayerMode = !twoPlayerMode;
  btnToggle2P.textContent = twoPlayerMode 
    ? "Λειτουργία: 2 Παίκτες (P1 + P2 Co-op)" 
    : "Λειτουργία: 1 Παίκτης (P1)";
  if (gameState === "TITLE") {
    player1.resetPosition();
    player2.resetPosition();
  }
});

// ==========================================
// LANDSCAPE TOUCH ENGINE (D-PAD & JOYSTICK)
// ==========================================
let controlMode = "DPAD"; // "DPAD" or "JOYSTICK"

const hudDpad = document.getElementById("hudDpad");
const hudJoystick = document.getElementById("hudJoystick");
const joystickBase = document.getElementById("joystickBase");
const joystickKnob = document.getElementById("joystickKnob");
const btnTouchFire = document.getElementById("btnTouchFire");
const rotateModal = document.getElementById("rotateModal");
const btnForceRotate = document.getElementById("btnForceRotate");
const btnMobilePause = document.getElementById("btnMobilePause");
const btnSwitchCtrl = document.getElementById("btnSwitchCtrl");
const btnToggleControlMode = document.getElementById("btnToggleControlMode");

// Mode toggle (D-Pad vs Joystick)
function switchControlMode() {
  controlMode = (controlMode === "DPAD") ? "JOYSTICK" : "DPAD";
  if (controlMode === "DPAD") {
    if (hudDpad) hudDpad.style.display = "flex";
    if (hudJoystick) hudJoystick.style.display = "none";
    if (btnSwitchCtrl) btnSwitchCtrl.textContent = "🔀 D-PAD";
  } else {
    if (hudDpad) hudDpad.style.display = "none";
    if (hudJoystick) hudJoystick.style.display = "flex";
    if (btnSwitchCtrl) btnSwitchCtrl.textContent = "🕹️ MOXΛΟΣ";
  }
}

if (btnSwitchCtrl) btnSwitchCtrl.addEventListener("click", switchControlMode);
if (btnToggleControlMode) btnToggleControlMode.addEventListener("click", switchControlMode);
if (btnMobilePause) btnMobilePause.addEventListener("click", togglePause);

// ------------------------------------------
// 1. PRECISION D-PAD TOUCH (Slide & Multi-touch)
// ------------------------------------------
const dpadButtons = document.querySelectorAll(".dpad-btn");
let activeDpadKey = null;

function handleDpadTouch(clientX, clientY) {
  const el = document.elementFromPoint(clientX, clientY);
  const btn = el ? el.closest(".dpad-btn") : null;
  const key = btn ? btn.getAttribute("data-key") : null;

  if (activeDpadKey !== key) {
    if (activeDpadKey) keys[activeDpadKey] = false;
    dpadButtons.forEach(b => b.classList.remove("active"));

    activeDpadKey = key;
    if (activeDpadKey) {
      keys[activeDpadKey] = true;
      if (btn) btn.classList.add("active");
    }
  }
}

if (hudDpad) {
  hudDpad.addEventListener("touchstart", (e) => {
    e.preventDefault();
    audio.init();
    if (e.touches.length > 0) {
      handleDpadTouch(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  hudDpad.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleDpadTouch(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  const clearDpad = () => {
    if (activeDpadKey) keys[activeDpadKey] = false;
    activeDpadKey = null;
    dpadButtons.forEach(b => b.classList.remove("active"));
  };

  hudDpad.addEventListener("touchend", clearDpad);
  hudDpad.addEventListener("touchcancel", clearDpad);

  let isDpadMouseDown = false;
  hudDpad.addEventListener("mousedown", (e) => {
    isDpadMouseDown = true;
    handleDpadTouch(e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", (e) => {
    if (isDpadMouseDown) handleDpadTouch(e.clientX, e.clientY);
  });
  window.addEventListener("mouseup", () => {
    if (isDpadMouseDown) {
      isDpadMouseDown = false;
      clearDpad();
    }
  });
}

// ------------------------------------------
// 2. VIRTUAL ANALOG JOYSTICK
// ------------------------------------------
let joystickTouchId = null;
let joystickCenter = { x: 0, y: 0 };
const maxDistance = 36;

const guideUp = document.querySelector(".arrow-up");
const guideDown = document.querySelector(".arrow-down");
const guideLeft = document.querySelector(".arrow-left");
const guideRight = document.querySelector(".arrow-right");

if (joystickBase && joystickKnob) {
  const startJoy = (clientX, clientY, identifier) => {
    joystickTouchId = identifier;
    const rect = joystickBase.getBoundingClientRect();
    joystickCenter.x = rect.left + rect.width / 2;
    joystickCenter.y = rect.top + rect.height / 2;
    moveJoy(clientX, clientY);
  };

  const moveJoy = (clientX, clientY) => {
    const dx = clientX - joystickCenter.x;
    const dy = clientY - joystickCenter.y;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    const clampedDist = Math.min(dist, maxDistance);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
    joystickKnob.classList.add("active");

    const deadzone = 10;
    const isLeft = dx < -deadzone;
    const isRight = dx > deadzone;
    const isUp = dy < -deadzone;
    const isDown = dy > deadzone;

    keys["ArrowLeft"] = isLeft;
    keys["ArrowRight"] = isRight;
    keys["ArrowUp"] = isUp;
    keys["ArrowDown"] = isDown;

    if (guideLeft) guideLeft.classList.toggle("lit", isLeft);
    if (guideRight) guideRight.classList.toggle("lit", isRight);
    if (guideUp) guideUp.classList.toggle("lit", isUp);
    if (guideDown) guideDown.classList.toggle("lit", isDown);
  };

  const resetJoy = () => {
    joystickTouchId = null;
    joystickKnob.style.transform = "translate(0px, 0px)";
    joystickKnob.classList.remove("active");
    keys["ArrowLeft"] = false;
    keys["ArrowRight"] = false;
    keys["ArrowUp"] = false;
    keys["ArrowDown"] = false;

    if (guideLeft) guideLeft.classList.remove("lit");
    if (guideRight) guideRight.classList.remove("lit");
    if (guideUp) guideUp.classList.remove("lit");
    if (guideDown) guideDown.classList.remove("lit");
  };

  joystickBase.addEventListener("touchstart", (e) => {
    e.preventDefault();
    audio.init();
    if (joystickTouchId === null && e.changedTouches.length > 0) {
      const touch = e.changedTouches[0];
      startJoy(touch.clientX, touch.clientY, touch.identifier);
    }
  }, { passive: false });

  window.addEventListener("touchmove", (e) => {
    if (joystickTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId) {
        moveJoy(touch.clientX, touch.clientY);
        break;
      }
    }
  }, { passive: false });

  const onTouchEnd = (e) => {
    if (joystickTouchId === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId) {
        resetJoy();
        break;
      }
    }
  };
  window.addEventListener("touchend", onTouchEnd);
  window.addEventListener("touchcancel", onTouchEnd);
}

// ------------------------------------------
// 3. ARCADE FIRE BUTTON
// ------------------------------------------
if (btnTouchFire) {
  const onFirePress = (e) => {
    e.preventDefault();
    btnTouchFire.classList.add("pressed");
    audio.init();

    if (gameState === "TITLE" || gameState === "GAME_OVER" || gameState === "VICTORY") {
      if (gameState === "TITLE") startGame();
      else resetFullGame();
    } else if (gameState === "PLAYING") {
      shootPlayer(player1);
    }
  };

  const onFireRelease = (e) => {
    e.preventDefault();
    btnTouchFire.classList.remove("pressed");
  };

  btnTouchFire.addEventListener("touchstart", onFirePress, { passive: false });
  btnTouchFire.addEventListener("touchend", onFireRelease, { passive: false });
  btnTouchFire.addEventListener("mousedown", onFirePress);
  btnTouchFire.addEventListener("mouseup", onFireRelease);
}

// ------------------------------------------
// 4. ORIENTATION & LANDSCAPE ENFORCEMENT
// ------------------------------------------
function checkOrientationState() {
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 1024);
  const isPortrait = window.innerHeight > window.innerWidth;
  const modal = document.getElementById("rotateModal");

  if (isTouch && isPortrait) {
    if (modal) modal.style.display = "flex";
  } else {
    if (modal) modal.style.display = "none";
  }
}

window.addEventListener("resize", checkOrientationState);
window.addEventListener("orientationchange", checkOrientationState);
checkOrientationState();

if (btnForceRotate) {
  btnForceRotate.addEventListener("click", async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock("landscape").catch(() => {});
      }
    } catch (e) {}
  });
}

function toggleMute() {
  const isEnabled = audio.toggle();
  document.getElementById("btnSound").textContent = isEnabled ? "🔊" : "🔇";
}

function togglePause() {
  if (gameState === "PLAYING") {
    previousState = gameState;
    gameState = "PAUSED";
  } else if (gameState === "PAUSED") {
    gameState = previousState;
  }
}

function toggleFullscreen() {
  const wrapper = document.getElementById("canvasWrapper");
  if (!document.fullscreenElement) {
    wrapper.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

// ==========================================
// 6. GAME INITIALIZATION & LEVEL LOADING
// ==========================================
function startGame() {
  currentStageIndex = 0;
  player1.score = 0;
  player1.lives = 3;
  player2.score = 0;
  player2.lives = 3;
  loadStage(currentStageIndex);
}

function resetFullGame() {
  gameState = "TITLE";
  player1.resetPosition();
  player2.resetPosition();
}

function loadStage(index) {
  const stage = STAGES[index];
  currentStageIndex = index;
  gameState = "INTRO";
  stageBannerTimer = 2.0; // 2 seconds intro
  stageTimer = stage.timer;
  timeFreezeTimer = 0;

  // Clear entities
  balls = [];
  harpoons = [];
  particles = [];
  floatingTexts = [];
  powerups = [];
  stageBlocks = JSON.parse(JSON.stringify(stage.blocks));
  stageLadders = JSON.parse(JSON.stringify(stage.ladders));

  // Spawn balls with initial upward bounce or arc
  stage.balls.forEach((b) => {
    const tierConf = BALL_TIERS[b.tier];
    balls.push({
      x: b.x,
      y: b.y,
      tier: b.tier,
      radius: tierConf.radius,
      dx: b.dx,
      dy: b.dy || 0,
      color: tierConf.color
    });
  });

  player1.resetPosition();
  player1.makeSafe(2.5);
  if (twoPlayerMode) {
    player2.resetPosition();
    player2.makeSafe(2.5);
  }

  // Timer interval
  if (stageTimerInterval) clearInterval(stageTimerInterval);
  stageTimerInterval = setInterval(() => {
    if (gameState === "PLAYING") {
      if (timeFreezeTimer > 0) {
        timeFreezeTimer--;
        audio.tick();
      } else {
        stageTimer--;
        if (stageTimer <= 10 && stageTimer > 0) {
          audio.tick();
        }
        if (stageTimer <= 0) {
          playerDeath(player1, "Time's Up!");
        }
      }
    }
  }, 1000);
}

// ==========================================
// 7. WEAPON & SHOOTING MECHANICS
// ==========================================
function shootPlayer(p) {
  if (p.lives <= 0) return;

  // Count active harpoons for this player
  const playerHarpoons = harpoons.filter((h) => h.playerId === p.id);
  const maxAllowed = (p.weapon === "DOUBLE") ? 2 : 1;

  if (p.weapon === "GUN") {
    // Vulcan Gun shoots twin fast bullets
    audio.shoot();
    p.shootingPose = true;
    p.shootPoseTimer = 0.2;
    harpoons.push({
      id: Math.random(),
      playerId: p.id,
      type: "BULLET",
      x: p.x + 12,
      originY: p.y,
      tipY: p.y,
      speed: 16,
      width: 4,
      color: "#ec4899"
    });
    harpoons.push({
      id: Math.random(),
      playerId: p.id,
      type: "BULLET",
      x: p.x + p.width - 12,
      originY: p.y,
      tipY: p.y,
      speed: 16,
      width: 4,
      color: "#ec4899"
    });
    return;
  }

  if (playerHarpoons.length >= maxAllowed) return;

  audio.shoot();
  p.shootingPose = true;
  p.shootPoseTimer = 0.22;

  harpoons.push({
    id: Math.random(),
    playerId: p.id,
    type: p.weapon === "HOOK" ? "HOOK" : "NORMAL",
    x: p.x + p.width / 2,
    originY: p.y + p.height,
    tipY: p.y,
    speed: 11.5,
    width: 5,
    anchored: false,
    anchorTimer: 0,
    color: p.weapon === "HOOK" ? "#f59e0b" : "#ffffff"
  });
}

// Distance from circle to vertical segment (Accurate Pang Collision!)
function circleToVerticalSegmentDistanceSq(cx, cy, segX, y1, y2) {
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const closestY = Math.max(minY, Math.min(cy, maxY));
  const dx = cx - segX;
  const dy = cy - closestY;
  return dx * dx + dy * dy;
}

// ==========================================
// 8. UPDATE LOGIC & PHYSICS
// ==========================================
function update(delta) {
  if (gameState === "PAUSED") return;

  // Screen shake decay
  if (screenShake > 0) screenShake = Math.max(0, screenShake - delta * 15);

  // Intro banner countdown
  if (gameState === "INTRO") {
    stageBannerTimer -= delta;
    if (stageBannerTimer <= 0) {
      gameState = "PLAYING";
    }
  }

  // Update Players
  updatePlayer(player1, delta, {
    left: keys["ArrowLeft"],
    right: keys["ArrowRight"],
    up: keys["ArrowUp"],
    down: keys["ArrowDown"]
  });

  if (twoPlayerMode) {
    updatePlayer(player2, delta, {
      left: keys["KeyA"],
      right: keys["KeyD"],
      up: keys["KeyW"],
      down: keys["KeyS"]
    });
  }

  if (gameState === "PLAYING") {
    // Update Harpoons
    updateHarpoons(delta);

    // Update Balls (only if not frozen by clock)
    if (timeFreezeTimer <= 0) {
      updateBalls(delta);
    }

    // Check collisions
    checkHarpoonCollisions();
    checkPlayerBallCollisions(player1);
    if (twoPlayerMode) checkPlayerBallCollisions(player2);

    // Update Power-ups
    updatePowerups(delta);

    // Check Win Condition for Stage
    if (balls.length === 0) {
      triggerStageClear();
    }
  }

  // Update Particles & Floating Text
  updateParticles(delta);
}

function updatePlayer(p, delta, ctrl) {
  if (p.lives <= 0) return;

  // Invincibility safe timer
  if (p.safe) {
    p.safeTimer -= delta;
    if (p.safeTimer <= 0) p.safe = false;
  }

  // Shoot pose reset
  if (p.shootingPose) {
    p.shootPoseTimer -= delta;
    if (p.shootPoseTimer <= 0) p.shootingPose = false;
  }

  // Check if player is intersecting any ladder
  p.onLadder = false;
  const playerCenter = p.x + p.width / 2;
  for (const lad of stageLadders) {
    if (
      playerCenter >= lad.x &&
      playerCenter <= lad.x + lad.w &&
      p.y + p.height >= lad.y &&
      p.y <= lad.y + lad.h
    ) {
      p.onLadder = true;
      p.currentLadder = lad;
      break;
    }
  }

  // Vertical ladder climbing
  if (p.onLadder && (ctrl.up || ctrl.down)) {
    p.isClimbing = true;
    p.x = p.currentLadder.x + p.currentLadder.w / 2 - p.width / 2; // snap to ladder center
    if (ctrl.up) p.y -= p.climbSpeed;
    if (ctrl.down) p.y += p.climbSpeed;

    // Constrain to ladder top and floor
    if (p.y + p.height < p.currentLadder.y) p.y = p.currentLadder.y - p.height;
    if (p.y + p.height > FLOOR_Y) p.y = FLOOR_Y - p.height;
  } else if (!p.onLadder) {
    p.isClimbing = false;
  }

  // Horizontal movement
  if (!p.isClimbing) {
    p.dx = 0;
    if (ctrl.left) {
      p.dx = -p.speed;
      p.facing = -1;
      p.walkAnimTimer += delta * 12;
      p.walkFrame = Math.floor(p.walkAnimTimer) % 4;
    } else if (ctrl.right) {
      p.dx = p.speed;
      p.facing = 1;
      p.walkAnimTimer += delta * 12;
      p.walkFrame = Math.floor(p.walkAnimTimer) % 4;
    } else {
      p.walkFrame = 0;
    }

    p.x += p.dx;

    // Platform gravity & landing
    let onPlatform = false;
    let groundTarget = FLOOR_Y;

    // Check platforms below player
    for (const b of stageBlocks) {
      if (
        p.x + p.width > b.x &&
        p.x < b.x + b.w &&
        p.y + p.height <= b.y + 10 &&
        p.y + p.height >= b.y - 12
      ) {
        groundTarget = b.y;
        onPlatform = true;
        break;
      }
    }

    if (p.y + p.height < groundTarget) {
      p.dy += GRAVITY * 2;
      p.y += p.dy;
      if (p.y + p.height >= groundTarget) {
        p.y = groundTarget - p.height;
        p.dy = 0;
      }
    } else {
      p.y = groundTarget - p.height;
      p.dy = 0;
    }
  }

  // Screen horizontal boundaries
  if (p.x < 15) p.x = 15;
  if (p.x + p.width > CANVAS_WIDTH - 15) p.x = CANVAS_WIDTH - 15 - p.width;
}

function updateHarpoons(delta) {
  for (let i = harpoons.length - 1; i >= 0; i--) {
    const h = harpoons[i];

    if (h.type === "BULLET") {
      h.tipY -= h.speed;
      h.originY -= h.speed;
      if (h.tipY < CEILING_Y) {
        harpoons.splice(i, 1);
      }
      continue;
    }

    // Harpoon wire extension
    if (!h.anchored) {
      h.tipY -= h.speed;

      // Hit ceiling
      if (h.tipY <= CEILING_Y) {
        h.tipY = CEILING_Y;
        if (h.type === "HOOK") {
          h.anchored = true;
          h.anchorTimer = 4.0; // Stays on ceiling for 4 seconds
        } else {
          // Normal harpoon disappears immediately when reaching top
          harpoons.splice(i, 1);
        }
      }
    } else {
      // Anchored Hook countdown
      h.anchorTimer -= delta;
      if (h.anchorTimer <= 0) {
        harpoons.splice(i, 1);
      }
    }
  }
}

function updateBalls(delta) {
  balls.forEach((ball) => {
    // Gravity
    ball.dy += GRAVITY;
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall bounce
    if (ball.x - ball.radius < 15) {
      ball.x = 15 + ball.radius;
      ball.dx = Math.abs(ball.dx);
    } else if (ball.x + ball.radius > CANVAS_WIDTH - 15) {
      ball.x = CANVAS_WIDTH - 15 - ball.radius;
      ball.dx = -Math.abs(ball.dx);
    }

    // Ceiling bounce
    if (ball.y - ball.radius < CEILING_Y) {
      ball.y = CEILING_Y + ball.radius;
      ball.dy = Math.abs(ball.dy);
    }

    // Floor bounce (Exact Pang impulse by tier!)
    if (ball.y + ball.radius >= FLOOR_Y) {
      ball.y = FLOOR_Y - ball.radius;
      ball.dy = BALL_TIERS[ball.tier].bounce;
    }

    // Blocks & Platforms collision
    stageBlocks.forEach((block) => {
      // Ball vs Block AABB
      const closestX = Math.max(block.x, Math.min(ball.x, block.x + block.w));
      const closestY = Math.max(block.y, Math.min(ball.y, block.y + block.h));
      const distX = ball.x - closestX;
      const distY = ball.y - closestY;
      const distSq = distX * distX + distY * distY;

      if (distSq < ball.radius * ball.radius) {
        // Collided with block
        if (Math.abs(distY) > Math.abs(distX)) {
          // Vertical bounce
          if (ball.y < block.y) {
            ball.y = block.y - ball.radius;
            ball.dy = BALL_TIERS[ball.tier].bounce;
          } else {
            ball.y = block.y + block.h + ball.radius;
            ball.dy = Math.abs(ball.dy);
          }
        } else {
          // Horizontal bounce
          if (ball.x < block.x) {
            ball.x = block.x - ball.radius;
            ball.dx = -Math.abs(ball.dx);
          } else {
            ball.x = block.x + block.w + ball.radius;
            ball.dx = Math.abs(ball.dx);
          }
        }
      }
    });
  });
}

function checkHarpoonCollisions() {
  // Check harpoons vs breakable blocks
  for (let hi = harpoons.length - 1; hi >= 0; hi--) {
    const h = harpoons[hi];
    for (let bi = stageBlocks.length - 1; bi >= 0; bi--) {
      const b = stageBlocks[bi];
      if (b.breakable && h.x >= b.x && h.x <= b.x + b.w && h.tipY <= b.y + b.h && h.originY >= b.y) {
        // Block destroyed
        audio.pop(2);
        createBlockDebris(b.x + b.w / 2, b.y + b.h / 2);
        maybeSpawnPowerup(b.x + b.w / 2, b.y + b.h / 2);
        stageBlocks.splice(bi, 1);
        harpoons.splice(hi, 1);
        break;
      }
    }
  }

  // Check harpoons vs balls
  const toSplit = [];

  for (let hi = harpoons.length - 1; hi >= 0; hi--) {
    const h = harpoons[hi];
    let harpoonRemoved = false;

    for (let bi = balls.length - 1; bi >= 0; bi--) {
      const ball = balls[bi];
      const distSq = circleToVerticalSegmentDistanceSq(ball.x, ball.y, h.x, h.tipY, h.originY);

      if (distSq <= (ball.radius + h.width / 2) * (ball.radius + h.width / 2)) {
        // HIT!
        toSplit.push({ ballIndex: bi, playerId: h.playerId });
        if (!harpoonRemoved) {
          harpoons.splice(hi, 1);
          harpoonRemoved = true;
        }
        break;
      }
    }
  }

  // Process splits in reverse order
  toSplit.sort((a, b) => b.ballIndex - a.ballIndex);
  toSplit.forEach(({ ballIndex, playerId }) => {
    splitBall(ballIndex, playerId);
  });
}

function splitBall(index, playerId) {
  const ball = balls[index];
  if (!ball) return;

  const p = (playerId === 2 && twoPlayerMode) ? player2 : player1;
  const points = BALL_TIERS[ball.tier].points;
  p.score += points;

  if (p.score > highScore) {
    highScore = p.score;
    localStorage.setItem("supabangbang_highscore", highScore);
  }

  audio.pop(ball.tier);
  createBurstParticles(ball.x, ball.y, ball.color, ball.tier);
  createFloatingText(`+${points}`, ball.x, ball.y - 10, ball.color);

  // Big ball screen shake
  if (ball.tier >= 3) {
    screenShake = ball.tier === 4 ? 8 : 4;
  }

  // 22% Chance to spawn a powerup
  maybeSpawnPowerup(ball.x, ball.y);

  // Split into 2 smaller balls if tier > 1
  if (ball.tier > 1) {
    const newTier = ball.tier - 1;
    const tierConf = BALL_TIERS[newTier];
    const baseSpeed = tierConf.speed;

    balls.push({
      x: ball.x - 12,
      y: ball.y - 4,
      tier: newTier,
      radius: tierConf.radius,
      dx: -baseSpeed,
      dy: -5.2, // Upward burst jump
      color: tierConf.color
    });

    balls.push({
      x: ball.x + 12,
      y: ball.y - 4,
      tier: newTier,
      radius: tierConf.radius,
      dx: baseSpeed,
      dy: -5.2, // Upward burst jump
      color: tierConf.color
    });
  }

  // Remove original ball
  balls.splice(index, 1);
}

function checkPlayerBallCollisions(p) {
  if (p.lives <= 0 || p.safe) return;

  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    // Circle vs Player Rectangle
    const closestX = Math.max(p.x, Math.min(b.x, p.x + p.width));
    const closestY = Math.max(p.y, Math.min(b.y, p.y + p.height));
    const distX = b.x - closestX;
    const distY = b.y - closestY;

    if (distX * distX + distY * distY < b.radius * b.radius) {
      if (p.hasShield) {
        // Shield absorbs hit
        p.hasShield = false;
        audio.freeze();
        p.makeSafe(1.5);
        createBurstParticles(p.x + p.width / 2, p.y + p.height / 2, "#10b981", 4);
        createFloatingText("SHIELD BREAK!", p.x, p.y - 20, "#10b981");
        return;
      }

      playerDeath(p, "HIT BY BALL!");
      break;
    }
  }
}

function playerDeath(p, reason = "") {
  p.lives--;
  audio.hurt();
  createBurstParticles(p.x + p.width / 2, p.y + p.height / 2, p.color, 4);
  createFloatingText(reason || "OUCH!", p.x, p.y - 25, "#ef4444");

  if (p.lives <= 0) {
    if ((!twoPlayerMode && player1.lives <= 0) || (twoPlayerMode && player1.lives <= 0 && player2.lives <= 0)) {
      triggerGameOver();
    }
  } else {
    // Reset positions and grant 2.5s invincibility
    player1.resetPosition();
    player1.makeSafe(2.5);
    if (twoPlayerMode && player2.lives > 0) {
      player2.resetPosition();
      player2.makeSafe(2.5);
    }
  }
}

// ==========================================
// 9. POWER-UPS & SPECIAL MECHANICS
// ==========================================
function maybeSpawnPowerup(x, y) {
  if (Math.random() > 0.22) return;

  const totalWeight = POWERUP_TYPES.reduce((acc, p) => acc + p.weight, 0);
  let rand = Math.random() * totalWeight;
  let selected = POWERUP_TYPES[0];

  for (const item of POWERUP_TYPES) {
    if (rand < item.weight) {
      selected = item;
      break;
    }
    rand -= item.weight;
  }

  powerups.push({
    x: x,
    y: y,
    type: selected.id,
    icon: selected.icon,
    color: selected.color,
    name: selected.name,
    vy: 1.8,
    life: 9.0, // 9 seconds lifetime
    radius: 16
  });
}

function updatePowerups(delta) {
  for (let i = powerups.length - 1; i >= 0; i--) {
    const pw = powerups[i];
    pw.y += pw.vy;
    pw.life -= delta;

    // Floor stop
    if (pw.y + pw.radius >= FLOOR_Y) {
      pw.y = FLOOR_Y - pw.radius;
      pw.vy = 0;
    }

    // Platforms stop
    for (const b of stageBlocks) {
      if (
        pw.x + pw.radius > b.x &&
        pw.x - pw.radius < b.x + b.w &&
        pw.y + pw.radius >= b.y &&
        pw.y + pw.radius <= b.y + 10
      ) {
        pw.y = b.y - pw.radius;
        pw.vy = 0;
        break;
      }
    }

    // Check collection by Player 1 or Player 2
    let collectedBy = null;
    if (checkPlayerCollect(player1, pw)) collectedBy = player1;
    else if (twoPlayerMode && checkPlayerCollect(player2, pw)) collectedBy = player2;

    if (collectedBy) {
      applyPowerup(collectedBy, pw);
      powerups.splice(i, 1);
      continue;
    }

    // Timeout remove
    if (pw.life <= 0) {
      powerups.splice(i, 1);
    }
  }
}

function checkPlayerCollect(p, pw) {
  if (p.lives <= 0) return false;
  return (
    pw.x + pw.radius > p.x &&
    pw.x - pw.radius < p.x + p.width &&
    pw.y + pw.radius > p.y &&
    pw.y - pw.radius < p.y + p.height
  );
}

function applyPowerup(p, pw) {
  audio.powerup();
  createFloatingText(pw.name, pw.x - 20, pw.y - 15, pw.color);

  switch (pw.type) {
    case "DOUBLE":
      p.weapon = "DOUBLE";
      break;
    case "HOOK":
      p.weapon = "HOOK";
      break;
    case "GUN":
      p.weapon = "GUN";
      break;
    case "SHIELD":
      p.hasShield = true;
      break;
    case "LIFE":
      p.lives = Math.min(5, p.lives + 1);
      createFloatingText("1-UP! ❤️", p.x, p.y - 35, "#f43f5e");
      break;
    case "CLOCK":
      timeFreezeTimer = 5;
      audio.freeze();
      createFloatingText("TIME FREEZE! ⏱️", 450, 200, "#818cf8");
      break;
    case "DYNAMITE":
      audio.dynamite();
      screenShake = 12;
      triggerDynamite(p);
      break;
  }
}

function triggerDynamite(p) {
  // Pop all balls into tier 1 small balls
  const newBalls = [];
  balls.forEach((ball) => {
    createBurstParticles(ball.x, ball.y, ball.color, ball.tier);
    p.score += BALL_TIERS[ball.tier].points;

    // Split into 4 small balls or burst
    if (ball.tier > 1) {
      const tierConf = BALL_TIERS[1];
      for (let i = 0; i < (ball.tier === 4 ? 4 : 2); i++) {
        newBalls.push({
          x: ball.x + (i - 1.5) * 20,
          y: ball.y,
          tier: 1,
          radius: tierConf.radius,
          dx: (i % 2 === 0 ? 1 : -1) * tierConf.speed,
          dy: -4 - Math.random() * 3,
          color: tierConf.color
        });
      }
    }
  });

  balls = newBalls;
  createFloatingText("BOOOM! 🧨", 460, 220, "#ef4444");
}

function triggerStageClear() {
  gameState = "LEVEL_CLEAR";
  audio.stageClear();

  // Bonus points for remaining time
  const bonus = stageTimer * 50;
  player1.score += bonus;
  createFloatingText(`TIME BONUS: +${bonus}`, 400, 250, "#ffe600");

  setTimeout(() => {
    if (currentStageIndex + 1 < STAGES.length) {
      loadStage(currentStageIndex + 1);
    } else {
      triggerVictory();
    }
  }, 2800);
}

function triggerGameOver() {
  gameState = "GAME_OVER";
  audio.gameOver();
  if (stageTimerInterval) clearInterval(stageTimerInterval);
}

function triggerVictory() {
  gameState = "VICTORY";
  audio.stageClear();
  if (stageTimerInterval) clearInterval(stageTimerInterval);
}

// ==========================================
// 10. PARTICLES & VISUAL EFFECTS
// ==========================================
function createBurstParticles(x, y, color, tier) {
  const count = 12 + tier * 6;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * (tier * 2.2);
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.5,
      radius: 2.5 + Math.random() * 3.5,
      color: color,
      alpha: 1.0,
      life: 0.45 + Math.random() * 0.4
    });
  }
}

function createBlockDebris(x, y) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      radius: 3 + Math.random() * 4,
      color: "#94a3b8",
      alpha: 1.0,
      life: 0.6
    });
  }
}

function createDustParticle(x, y) {
  particles.push({
    x: x,
    y: y,
    vx: (Math.random() - 0.5) * 1.5,
    vy: -Math.random() * 1.0 - 0.3,
    radius: 1.5 + Math.random() * 2.0,
    color: "#ff9100",
    alpha: 0.55,
    life: 0.28
  });
}

function createFloatingText(text, x, y, color = "#fff") {
  floatingTexts.push({
    text: text,
    x: x,
    y: y,
    color: color,
    alpha: 1.0,
    life: 0.85
  });
}

function updateParticles(delta) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += GRAVITY * 0.8;
    p.life -= delta;
    p.alpha = Math.max(0, p.life / 0.7);
    if (p.life <= 0) particles.splice(i, 1);
  }

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y -= 38 * delta;
    ft.life -= delta;
    ft.alpha = Math.max(0, ft.life / 0.85);
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }
}

// ==========================================
// 11. DRAWING / RENDERING ENGINE
// ==========================================
function draw() {
  ctx.save();

  // Screen shake application
  if (screenShake > 0) {
    const ox = (Math.random() - 0.5) * screenShake * 2;
    const oy = (Math.random() - 0.5) * screenShake * 2;
    ctx.translate(ox, oy);
  }

  // Draw World Background
  drawBackground();

  // Draw Ladders & Blocks
  drawLadders();
  drawBlocks();

  // Draw Game Entities
  drawHarpoons();
  drawPowerups();
  drawBalls();
  drawPlayer(player1);
  if (twoPlayerMode) drawPlayer(player2);
  drawParticles();

  // Freeze tint overlay if clock active
  if (timeFreezeTimer > 0) {
    ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // Draw HUD & Overlays
  drawHUD();

  if (gameState === "TITLE") drawTitleScreen();
  else if (gameState === "INTRO") drawIntroBanner();
  else if (gameState === "LEVEL_CLEAR") drawLevelClearScreen();
  else if (gameState === "GAME_OVER") drawGameOverScreen();
  else if (gameState === "VICTORY") drawVictoryScreen();
  else if (gameState === "PAUSED") drawPauseScreen();

  ctx.restore();
}

function drawBackground() {
  const stage = STAGES[currentStageIndex] || STAGES[0];
  const theme = stage.theme;

  // Sky Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  if (theme === "fuji") {
    grad.addColorStop(0, "#1e1b4b");
    grad.addColorStop(0.4, "#4c1d95");
    grad.addColorStop(0.7, "#be185d");
    grad.addColorStop(1, "#fbbf24");
  } else if (theme === "athens") {
    grad.addColorStop(0, "#030712");
    grad.addColorStop(0.5, "#0c4a6e");
    grad.addColorStop(0.85, "#0284c7");
    grad.addColorStop(1, "#38bdf8");
  } else if (theme === "maya") {
    grad.addColorStop(0, "#052e16");
    grad.addColorStop(0.6, "#14532d");
    grad.addColorStop(1, "#15803d");
  } else if (theme === "easter") {
    grad.addColorStop(0, "#0f172a");
    grad.addColorStop(0.5, "#1e293b");
    grad.addColorStop(0.8, "#334155");
    grad.addColorStop(1, "#475569");
  } else if (theme === "paris") {
    grad.addColorStop(0, "#0f0c29");
    grad.addColorStop(0.5, "#302b63");
    grad.addColorStop(1, "#24243e");
  } else {
    // Egypt
    grad.addColorStop(0, "#1c1917");
    grad.addColorStop(0.5, "#451a03");
    grad.addColorStop(0.8, "#78350f");
    grad.addColorStop(1, "#b45309");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Background Scenery Art (Stylized Retro Silhouettes)
  if (theme === "fuji") {
    // Mount Fuji Silhouette
    ctx.fillStyle = "rgba(30, 27, 75, 0.75)";
    ctx.beginPath();
    ctx.moveTo(150, FLOOR_Y);
    ctx.lineTo(460, 240);
    ctx.lineTo(540, 240);
    ctx.lineTo(850, FLOOR_Y);
    ctx.closePath();
    ctx.fill();

    // Fuji Snowcap
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(430, 310);
    ctx.lineTo(460, 240);
    ctx.lineTo(540, 240);
    ctx.lineTo(570, 310);
    ctx.lineTo(530, 325);
    ctx.lineTo(500, 305);
    ctx.lineTo(470, 325);
    ctx.closePath();
    ctx.fill();

    // Red Sun
    ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
    ctx.beginPath();
    ctx.arc(500, 210, 55, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === "athens") {
    // Parthenon Columns
    ctx.fillStyle = "rgba(226, 232, 240, 0.22)";
    ctx.fillRect(200, 320, 600, 25); // Pediment beam
    for (let c = 220; c <= 780; c += 40) {
      ctx.fillRect(c, 345, 16, FLOOR_Y - 345);
    }
  } else if (theme === "paris") {
    // Eiffel Tower Silhouette
    ctx.fillStyle = "rgba(253, 224, 71, 0.2)";
    ctx.beginPath();
    ctx.moveTo(420, FLOOR_Y);
    ctx.lineTo(495, 120);
    ctx.lineTo(505, 120);
    ctx.lineTo(580, FLOOR_Y);
    ctx.lineTo(540, FLOOR_Y);
    ctx.lineTo(500, 360);
    ctx.lineTo(460, FLOOR_Y);
    ctx.closePath();
    ctx.fill();
  } else if (theme === "egypt") {
    // Great Pyramids
    ctx.fillStyle = "rgba(120, 53, 15, 0.6)";
    ctx.beginPath();
    ctx.moveTo(100, FLOOR_Y);
    ctx.lineTo(350, 280);
    ctx.lineTo(600, FLOOR_Y);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(450, FLOOR_Y);
    ctx.lineTo(680, 240);
    ctx.lineTo(920, FLOOR_Y);
    ctx.closePath();
    ctx.fill();
  }

  // Ground platform
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(0, FLOOR_Y, CANVAS_WIDTH, CANVAS_HEIGHT - FLOOR_Y);
  ctx.fillStyle = "#0284c7";
  ctx.fillRect(0, FLOOR_Y, CANVAS_WIDTH, 4);

  // Ceiling border
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CEILING_Y);
  ctx.fillStyle = "#334155";
  ctx.fillRect(0, CEILING_Y - 4, CANVAS_WIDTH, 4);
}

function drawLadders() {
  stageLadders.forEach((lad) => {
    // Rails
    ctx.fillStyle = "#78350f";
    ctx.fillRect(lad.x, lad.y, 6, lad.h);
    ctx.fillRect(lad.x + lad.w - 6, lad.y, 6, lad.h);

    // Rungs
    ctx.fillStyle = "#b45309";
    for (let ry = lad.y + 12; ry < lad.y + lad.h; ry += 20) {
      ctx.fillRect(lad.x + 4, ry, lad.w - 8, 4);
    }
  });
}

function drawBlocks() {
  stageBlocks.forEach((b) => {
    if (b.breakable) {
      // Brick pattern
      ctx.fillStyle = "#d97706";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "#78350f";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    } else {
      // Solid Metal / Stone Platform
      ctx.fillStyle = "#475569";
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(b.x, b.y, b.w, 3);
    }
  });
}

function drawHarpoons() {
  harpoons.forEach((h) => {
    if (h.type === "BULLET") {
      // Vulcan Gun Bullet
      ctx.fillStyle = h.color;
      ctx.fillRect(h.x - 2, h.tipY, 4, 18);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(h.x - 1, h.tipY + 2, 2, 8);
      return;
    }

    // Classic Zig-Zag Harpoon Chain Link
    const segHeight = 12;
    const startY = h.originY;
    const endY = h.tipY;

    ctx.strokeStyle = h.color;
    ctx.lineWidth = h.width;
    ctx.beginPath();
    ctx.moveTo(h.x, startY);

    for (let y = startY; y > endY; y -= segHeight) {
      const offset = (Math.floor(y / segHeight) % 2 === 0 ? 3 : -3);
      ctx.lineTo(h.x + offset, Math.max(endY, y - segHeight));
    }
    ctx.stroke();

    // Harpoon Arrow / Anchor Head
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.moveTo(h.x, endY - 6);
    ctx.lineTo(h.x - 7, endY + 8);
    ctx.lineTo(h.x + 7, endY + 8);
    ctx.closePath();
    ctx.fill();

    // Hook anchor glow
    if (h.anchored) {
      ctx.fillStyle = "rgba(245, 158, 11, 0.4)";
      ctx.beginPath();
      ctx.arc(h.x, CEILING_Y + 6, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function drawBalls() {
  balls.forEach((b) => {
    // 3D Sphere Radial Gradient
    const grad = ctx.createRadialGradient(
      b.x - b.radius * 0.35,
      b.y - b.radius * 0.35,
      b.radius * 0.1,
      b.x,
      b.y,
      b.radius
    );
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, b.color);
    grad.addColorStop(1, "#0f172a");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    // Specular Highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
    ctx.beginPath();
    ctx.arc(
      b.x - b.radius * 0.32,
      b.y - b.radius * 0.32,
      b.radius * 0.24,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();
  });
}

function drawPlayer(p) {
  if (p.lives <= 0) return;

  ctx.save();

  const cx = p.x + p.width / 2;
  const cy = p.y + p.height / 2;

  // Dynamic Contact Shadow on Floor
  if (!p.isClimbing && p.y + p.height >= FLOOR_Y - 4) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.ellipse(cx, FLOOR_Y - 1, 17, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Safe / Invincible Shimmer Effect (high-tech chromatic aura)
  if (p.safe) {
    const blinkCycle = Math.floor(Date.now() / 90) % 3;
    if (blinkCycle === 0) {
      ctx.globalAlpha = 0.35;
    } else if (blinkCycle === 1) {
      ctx.shadowColor = "#ffd600";
      ctx.shadowBlur = 12;
      ctx.globalAlpha = 0.88;
    } else {
      ctx.globalAlpha = 0.65;
    }
  }

  // Action Dust Puffs when sprinting
  if (p.dx !== 0 && !p.isClimbing && Math.random() < 0.28) {
    createDustParticle(
      p.facing === 1 ? p.x + 4 : p.x + p.width - 4,
      p.y + p.height - 3
    );
  }

  // Draw Shield Bubble if active
  if (p.hasShield) {
    const shieldTime = Date.now() / 300;
    const pulseRadius = 33 + Math.sin(shieldTime * 2) * 2;
    const shieldGrad = ctx.createRadialGradient(cx, cy, 14, cx, cy, pulseRadius);
    shieldGrad.addColorStop(0, "rgba(0, 230, 118, 0.1)");
    shieldGrad.addColorStop(0.7, "rgba(0, 230, 118, 0.38)");
    shieldGrad.addColorStop(1, "rgba(118, 255, 3, 0.9)");
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#00e676";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Shield Orbiting Spark
    const sparkX = cx + Math.cos(shieldTime * 3) * (pulseRadius - 2);
    const sparkY = cy + Math.sin(shieldTime * 3) * (pulseRadius - 2);
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==========================================
  // 1. LEGS & TACTICAL BOOTS
  // ==========================================
  const pantsColor = "#1a1f2c";
  const pantsHighlight = "#2d3748";
  const bootColor = "#090a0f";
  const bootRim = p.hatColor;

  if (p.isClimbing) {
    const legOffset = (Math.floor(p.y / 8) % 2 === 0 ? 5 : -5);
    // Left Leg
    ctx.fillStyle = pantsColor;
    ctx.fillRect(p.x + 9, p.y + 36, 10, 15 + legOffset);
    ctx.fillStyle = bootColor;
    ctx.fillRect(p.x + 8, p.y + 49 + legOffset, 12, 6);
    // Right Leg
    ctx.fillStyle = pantsColor;
    ctx.fillRect(p.x + 25, p.y + 36, 10, 15 - legOffset);
    ctx.fillStyle = bootColor;
    ctx.fillRect(p.x + 24, p.y + 49 - legOffset, 12, 6);
  } else {
    const legSwing = p.dx !== 0 ? (p.walkFrame === 1 ? -5 : p.walkFrame === 3 ? 5 : 0) : 0;
    // Left leg
    ctx.fillStyle = pantsColor;
    ctx.fillRect(p.x + 7 + legSwing, p.y + 36, 11, 13);
    ctx.fillStyle = pantsHighlight;
    ctx.fillRect(p.x + 9 + legSwing, p.y + 38, 3, 6); // Knee highlight
    ctx.fillStyle = bootColor;
    ctx.fillRect(p.x + 6 + legSwing, p.y + 48, 13, 7); // Combat boot
    ctx.fillStyle = bootRim;
    ctx.fillRect(p.x + 6 + legSwing, p.y + 53, 13, 2); // Sole rim

    // Right leg
    ctx.fillStyle = pantsColor;
    ctx.fillRect(p.x + 25 - legSwing, p.y + 36, 11, 13);
    ctx.fillStyle = pantsHighlight;
    ctx.fillRect(p.x + 27 - legSwing, p.y + 38, 3, 6); // Knee highlight
    ctx.fillStyle = bootColor;
    ctx.fillRect(p.x + 24 - legSwing, p.y + 48, 13, 7); // Combat boot
    ctx.fillStyle = bootRim;
    ctx.fillRect(p.x + 24 - legSwing, p.y + 53, 13, 2); // Sole rim
  }

  // ==========================================
  // 2. HEROIC ACTION VEST & INNER SHIRT
  // ==========================================
  // Vest Base
  ctx.fillStyle = p.color;
  ctx.fillRect(p.x + 7, p.y + 16, 30, 20);

  // Vest Shoulder Highlights
  ctx.fillStyle = "rgba(255, 255, 255, 0.32)";
  ctx.fillRect(p.x + 7, p.y + 16, 30, 3);

  // Vest Shadow Contours
  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(p.x + 7, p.y + 32, 30, 4);

  // Crisp White Athletic Undershirt (V-Neck Center)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(p.x + 17, p.y + 17, 10, 15);
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(p.x + 19, p.y + 20, 6, 12);

  // Gold Zipper / Badge Accent
  ctx.fillStyle = "#ffd600";
  ctx.fillRect(p.x + 21, p.y + 18, 2, 8);

  // ==========================================
  // 3. TACTICAL UTILITY BELT
  // ==========================================
  ctx.fillStyle = "#3e1f0b"; // Rich leather
  ctx.fillRect(p.x + 6, p.y + 33, 32, 5);

  // Utility Pouches
  ctx.fillStyle = "#5c2c0e";
  ctx.fillRect(p.x + 7, p.y + 32, 5, 6);
  ctx.fillRect(p.x + 32, p.y + 32, 5, 6);

  // Gleaming Gold Belt Buckle
  ctx.fillStyle = "#ffd600";
  ctx.fillRect(p.x + 18, p.y + 32, 8, 6);
  ctx.fillStyle = "#fffbeb";
  ctx.fillRect(p.x + 20, p.y + 33, 4, 4);

  // ==========================================
  // 4. HEAD, FACE & EXPRESSIVE EYES
  // ==========================================
  // Face Base (Warm Heroic Skin)
  ctx.fillStyle = "#fed7aa";
  ctx.fillRect(p.x + 12, p.y + 6, 20, 14);

  // Cheek warmth
  ctx.fillStyle = "rgba(244, 63, 94, 0.35)";
  ctx.fillRect(p.x + (p.facing === 1 ? 22 : 14), p.y + 14, 5, 3);

  // Hair Bangs peeking out
  ctx.fillStyle = "#3e1f0b";
  ctx.fillRect(p.x + 11, p.y + 7, 4, 6);
  ctx.fillRect(p.x + 29, p.y + 7, 4, 6);

  // Expressive Arcade Eyes
  if (!p.isClimbing) {
    const eyeX = p.facing === 1 ? p.x + 21 : p.x + 15;
    // Eye Dark Base
    ctx.fillStyle = "#090a0f";
    ctx.fillRect(eyeX, p.y + 10, 5, 5);
    // Specular Catchlight Highlight (Bright white gleam)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(eyeX + (p.facing === 1 ? 2 : 1), p.y + 10, 2, 2);
  }

  // ==========================================
  // 5. HEROIC ACTION CAP (WITH VISOR & INSIGNIA)
  // ==========================================
  // Cap Visor / Brim (Curved forward)
  ctx.fillStyle = p.hatColor;
  const brimX = p.facing === 1 ? p.x + 7 : p.x + 3;
  ctx.fillRect(brimX, p.y + 4, 34, 5);

  // Visor Top Specular Highlight
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillRect(brimX + 2, p.y + 4, 30, 2);

  // Cap Crown
  ctx.fillStyle = p.hatColor;
  ctx.fillRect(p.x + 9, p.y - 3, 26, 8);

  // Crown Band
  ctx.fillStyle = "#1e2430";
  ctx.fillRect(p.x + 9, p.y + 2, 26, 3);

  // Gold Star / Emblem on Cap
  ctx.fillStyle = "#ffd600";
  ctx.fillRect(p.x + 20, p.y - 1, 4, 4);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(p.x + 21, p.y, 2, 2);

  // ==========================================
  // 6. ARMS, GLOVES & HARPOON LAUNCHER
  // ==========================================
  if (p.shootingPose) {
    // Both arms raised gripping the heavy harpoon launcher!
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x + 13, p.y + 7, 8, 12);
    ctx.fillRect(p.x + 23, p.y + 7, 8, 12);

    // Tactical Gloves
    ctx.fillStyle = "#18181b";
    ctx.fillRect(p.x + 14, p.y + 4, 6, 5);
    ctx.fillRect(p.x + 24, p.y + 4, 6, 5);

    // Harpoon Launcher Rifle (Gunmetal & Gold)
    ctx.fillStyle = "#334155";
    ctx.fillRect(p.x + 18, p.y - 14, 8, 22); // Main barrel
    ctx.fillStyle = "#64748b";
    ctx.fillRect(p.x + 19, p.y - 12, 6, 18); // Barrel chamber

    // Gold Reinforcement Rings
    ctx.fillStyle = "#ffd600";
    ctx.fillRect(p.x + 17, p.y - 8, 10, 2);
    ctx.fillRect(p.x + 17, p.y - 14, 10, 2);

    // Glowing Laser Target Diode
    ctx.fillStyle = "#ff1744";
    ctx.fillRect(p.x + 21, p.y - 16, 2, 3);

    // Energetic Muzzle Flash Spark!
    ctx.fillStyle = "#ffd600";
    ctx.beginPath();
    ctx.arc(p.x + 22, p.y - 18, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(p.x + 22, p.y - 18, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (!p.isClimbing) {
    const armX = p.facing === 1 ? p.x + 27 : p.x + 6;
    // Arm Sleeve
    ctx.fillStyle = p.color;
    ctx.fillRect(armX, p.y + 19, 10, 11);
    // Tactical Glove
    ctx.fillStyle = "#18181b";
    ctx.fillRect(armX + (p.facing === 1 ? 2 : 0), p.y + 28, 8, 6);
    // Holstered Harpoon Grip
    ctx.fillStyle = "#475569";
    ctx.fillRect(armX + (p.facing === 1 ? 4 : 2), p.y + 31, 4, 7);
    ctx.fillStyle = "#ffd600";
    ctx.fillRect(armX + (p.facing === 1 ? 4 : 2), p.y + 30, 4, 2);
  }

  ctx.restore();
}

function drawPowerups() {
  powerups.forEach((pw) => {
    // Blinking when close to expiry
    if (pw.life < 2.5 && Math.floor(Date.now() / 120) % 2 === 0) return;

    // Glowing badge
    ctx.fillStyle = pw.color;
    ctx.beginPath();
    ctx.arc(pw.x, pw.y, pw.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pw.icon, pw.x, pw.y + 1);
  });
}

function drawParticles() {
  particles.forEach((p) => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  floatingTexts.forEach((ft) => {
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = ft.alpha;
    ctx.font = "12px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    ctx.fillText(ft.text, ft.x, ft.y);
  });

  ctx.globalAlpha = 1.0;
}

function drawHUD() {
  // Top HUD Bar Background
  const hudGrad = ctx.createLinearGradient(0, 0, 0, CEILING_Y);
  hudGrad.addColorStop(0, "#08090f");
  hudGrad.addColorStop(1, "#12141e");
  ctx.fillStyle = hudGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CEILING_Y - 4);

  // Blazing Orange/Gold Action Rail under HUD
  ctx.fillStyle = "#ff5500";
  ctx.fillRect(0, CEILING_Y - 4, CANVAS_WIDTH, 3);
  ctx.shadowColor = "rgba(255, 85, 0, 0.8)";
  ctx.shadowBlur = 10;

  ctx.textBaseline = "middle";

  // --- Player 1 Info (Left) ---
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ff5500";
  ctx.font = "11px 'Press Start 2P', monospace";
  ctx.textAlign = "left";
  ctx.fillText("1P SCORE", 24, 18);

  ctx.fillStyle = "#ffffff";
  ctx.font = "16px 'Press Start 2P', monospace";
  ctx.fillText(`${player1.score}`, 24, 42);

  // Lives display with clear spacing
  ctx.font = "15px sans-serif";
  ctx.fillText(`${"❤️ ".repeat(Math.max(0, player1.lives))}`, 180, 42);

  // --- Stage & Timer (Center) ---
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd600";
  ctx.font = "12px 'Press Start 2P', monospace";
  ctx.fillText(`STAGE ${currentStageIndex + 1}`, CANVAS_WIDTH / 2, 18);

  ctx.fillStyle = stageTimer <= 10 ? "#ff1744" : "#ffffff";
  ctx.font = "18px 'Press Start 2P', monospace";
  ctx.fillText(`TIME: ${stageTimer}`, CANVAS_WIDTH / 2, 42);

  // --- Player 2 or High Score (Right) ---
  ctx.textAlign = "right";
  if (twoPlayerMode) {
    ctx.fillStyle = "#00e676";
    ctx.font = "11px 'Press Start 2P', monospace";
    ctx.fillText("2P SCORE", CANVAS_WIDTH - 24, 18);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px 'Press Start 2P', monospace";
    ctx.fillText(`${player2.score}`, CANVAS_WIDTH - 24, 42);
  } else {
    ctx.fillStyle = "#ffab00";
    ctx.font = "11px 'Press Start 2P', monospace";
    ctx.fillText("HIGH SCORE", CANVAS_WIDTH - 24, 18);
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px 'Press Start 2P', monospace";
    ctx.fillText(`${highScore}`, CANVAS_WIDTH - 24, 42);
  }

  ctx.textAlign = "left";
}

// ==========================================
// 12. MENUS & OVERLAY SCREENS
// ==========================================
function drawTitleScreen() {
  ctx.fillStyle = "rgba(8, 9, 13, 0.92)";
  ctx.fillRect(0, CEILING_Y, CANVAS_WIDTH, FLOOR_Y - CEILING_Y);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.shadowColor = "rgba(255, 85, 0, 0.75)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#ff3d00";
  ctx.font = "34px 'Press Start 2P', monospace";
  ctx.fillText("SUPA BANG BANG", CANVAS_WIDTH / 2, 200);

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffd600";
  ctx.font = "14px 'Press Start 2P', monospace";
  ctx.fillText("WORLD TOUR ARCADE", CANVAS_WIDTH / 2, 245);

  ctx.fillStyle = "#ffab00";
  ctx.font = "16px 'Press Start 2P', monospace";
  if (Math.floor(Date.now() / 350) % 2 === 0) {
    ctx.fillText("TAP FIRE OR PRESS SPACE", CANVAS_WIDTH / 2, 340);
  }

  ctx.fillStyle = "#a1a1aa";
  ctx.font = "11px 'Press Start 2P', monospace";
  ctx.fillText(`MODE: ${twoPlayerMode ? "2 PLAYERS (CO-OP)" : "1 PLAYER"}`, CANVAS_WIDTH / 2, 410);
  ctx.fillText("JOYSTICK / ARROWS TO MOVE & CLIMB", CANVAS_WIDTH / 2, 445);
  ctx.fillText("POP ALL BUBBLES! DON'T GET HIT!", CANVAS_WIDTH / 2, 480);
}

function drawIntroBanner() {
  const stage = STAGES[currentStageIndex];
  ctx.fillStyle = "rgba(18, 14, 20, 0.88)";
  ctx.fillRect(150, 240, 700, 160);
  ctx.strokeStyle = "#ff5500";
  ctx.lineWidth = 3;
  ctx.strokeRect(150, 240, 700, 160);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffd600";
  ctx.font = "18px 'Press Start 2P', monospace";
  ctx.fillText(stage.title, CANVAS_WIDTH / 2, 280);

  ctx.fillStyle = "#f4f4f5";
  ctx.font = "12px 'Press Start 2P', monospace";
  ctx.fillText(stage.subtitle, CANVAS_WIDTH / 2, 330);

  ctx.fillStyle = "#00e676";
  ctx.font = "14px 'Press Start 2P', monospace";
  ctx.fillText("GET READY!", CANVAS_WIDTH / 2, 365);
}

function drawLevelClearScreen() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.82)";
  ctx.fillRect(200, 240, 600, 160);
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 3;
  ctx.strokeRect(200, 240, 600, 160);

  ctx.textAlign = "center";
  ctx.fillStyle = "#10b981";
  ctx.font = "24px 'Press Start 2P', monospace";
  ctx.fillText("STAGE CLEAR!", CANVAS_WIDTH / 2, 290);

  ctx.fillStyle = "#ffe600";
  ctx.font = "14px 'Press Start 2P', monospace";
  ctx.fillText(`TIME BONUS: +${stageTimer * 50}`, CANVAS_WIDTH / 2, 345);
}

function drawGameOverScreen() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
  ctx.fillRect(0, CEILING_Y, CANVAS_WIDTH, FLOOR_Y - CEILING_Y);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ef4444";
  ctx.font = "36px 'Press Start 2P', monospace";
  ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, 280);

  ctx.fillStyle = "#ffffff";
  ctx.font = "16px 'Press Start 2P', monospace";
  ctx.fillText(`FINAL SCORE: ${player1.score + (twoPlayerMode ? player2.score : 0)}`, CANVAS_WIDTH / 2, 340);

  ctx.fillStyle = "#ffe600";
  ctx.font = "14px 'Press Start 2P', monospace";
  if (Math.floor(Date.now() / 400) % 2 === 0) {
    ctx.fillText("PRESS SPACE TO RETRY", CANVAS_WIDTH / 2, 420);
  }
}

function drawVictoryScreen() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
  ctx.fillRect(0, CEILING_Y, CANVAS_WIDTH, FLOOR_Y - CEILING_Y);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffe600";
  ctx.font = "32px 'Press Start 2P', monospace";
  ctx.fillText("CONGRATULATIONS!", CANVAS_WIDTH / 2, 240);

  ctx.fillStyle = "#00e676";
  ctx.font = "16px 'Press Start 2P', monospace";
  ctx.fillText("YOU COMPLETED THE WORLD TOUR!", CANVAS_WIDTH / 2, 300);

  ctx.fillStyle = "#ffffff";
  ctx.font = "18px 'Press Start 2P', monospace";
  ctx.fillText(`FINAL SCORE: ${player1.score}`, CANVAS_WIDTH / 2, 360);

  ctx.fillStyle = "#10b981";
  ctx.font = "14px 'Press Start 2P', monospace";
  ctx.fillText("PRESS SPACE TO PLAY AGAIN", CANVAS_WIDTH / 2, 430);
}

function drawPauseScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = "#ffe600";
  ctx.font = "28px 'Press Start 2P', monospace";
  ctx.fillText("PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

  ctx.fillStyle = "#ffffff";
  ctx.font = "12px 'Press Start 2P', monospace";
  ctx.fillText("Press P or Pause Button to Resume", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40);
}

// ==========================================
// 13. MAIN LOOP
// ==========================================
let lastTime = performance.now();

function gameLoop(time) {
  const delta = Math.min((time - lastTime) / 1000, 0.05); // cap delta at 50ms to prevent jumping
  lastTime = time;

  update(delta);
  draw();

  requestAnimationFrame(gameLoop);
}

// Start Main Loop
requestAnimationFrame(gameLoop);
