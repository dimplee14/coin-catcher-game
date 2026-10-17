/**
 * Coin Catcher Arcade - Phase 8: Professional Edition
 * 
 * Comprehensive Polish & Commercial Arcade Features:
 * 1. State Machine: START (attract), PLAYING, PAUSED, GAMEOVER.
 * 2. Persistent High Score with localStorage & celebratory "NEW RECORD!" badge.
 * 3. Tactile Screen Shake on player damage and defeat.
 * 4. Dual Particle Explosion Systems: Golden coin sparkles & blue damage bursts.
 * 5. Player Character Life: Directional animated pixel eyes that track movement.
 * 6. Combo Multiplier System: Fast coin collection awards 2x, 3x multipliers!
 * 7. Pitch-Scaling Chimes: Successive combo pickups scale up the pentatonic scale.
 * 8. Ambient Starfield: Floating, twinkling cosmic backdrop.
 * 9. Dynamic Difficulty: Enemy patrol speed scales smoothly with score.
 * 10. Pause Menu: ESC / P / UI button toggles pause with clean resume.
 * 11. Responsive Touch D-Pad with continuous hold & diagonals.
 * 12. Zero external dependencies.
 */

// ==========================================
// 1. Canvas Setup & DOM References
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');

const startOverlay = document.getElementById('startOverlay');
const startBtn = document.getElementById('startBtn');

const pauseOverlay = document.getElementById('pauseOverlay');
const pauseBtn = document.getElementById('pauseBtn');
const pauseText = document.getElementById('pauseText');
const resumeBtn = document.getElementById('resumeBtn');
const pauseRestartBtn = document.getElementById('pauseRestartBtn');

const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const finalBestDisplay = document.getElementById('finalBestDisplay');
const newRecordBadge = document.getElementById('newRecordBadge');
const restartBtn = document.getElementById('restartBtn');

const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const soundText = document.getElementById('soundText');

// ==========================================
// 2. Constants & Game States
// ==========================================
const GameState = {
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameover'
};

const INITIAL_LIVES = 3;
const INVULNERABILITY_DURATION = 1500; // milliseconds
const COMBO_TIMEOUT = 2500; // milliseconds to keep combo streak

let currentState = GameState.START;

let score = 0;
let highScore = 0;
let lives = INITIAL_LIVES;
let isInvulnerable = false;
let invulnerabilityEndTime = 0;

// Combo Streak System
let combo = 0;
let lastCoinPickupTime = 0;

// Screen Shake System
let screenShakeTimer = 0;
let screenShakeIntensity = 0;

// Particle & Floating Text Systems
const particles = [];
const floatingTexts = [];

// Load High Score from localStorage
function loadHighScore() {
  try {
    const saved = localStorage.getItem('coin_catcher_high_score');
    if (saved !== null) {
      highScore = parseInt(saved, 10) || 0;
    }
  } catch (e) {
    highScore = 0;
  }
  updateHighScoreDisplay();
}

function saveHighScore() {
  try {
    localStorage.setItem('coin_catcher_high_score', String(highScore));
  } catch (e) {}
}

function updateScoreDisplay() {
  if (scoreDisplay) scoreDisplay.textContent = score;
}

function updateHighScoreDisplay() {
  if (highScoreDisplay) highScoreDisplay.textContent = highScore;
  if (finalBestDisplay) finalBestDisplay.textContent = highScore;
}

function updateLivesDisplay() {
  if (livesDisplay) livesDisplay.textContent = lives;
}

// ==========================================
// 3. Web Audio API Retro Sound Synthesizer
// ==========================================
let audioCtx = null;
let isAudioEnabled = false;

const pentatonicScale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6

function getAudioContext() {
  if (!audioCtx && (typeof window !== 'undefined') && (window.AudioContext || window.webkitAudioContext)) {
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function toggleAudio() {
  const actx = getAudioContext();
  isAudioEnabled = !isAudioEnabled;

  if (soundToggleBtn && soundIcon && soundText) {
    if (isAudioEnabled) {
      soundToggleBtn.classList.add('active');
      soundIcon.textContent = '🔊';
      soundText.textContent = 'SOUND: ON';
      playRestartSound();
    } else {
      soundToggleBtn.classList.remove('active');
      soundIcon.textContent = '🔇';
      soundText.textContent = 'SOUND: OFF';
    }
  }
}

if (soundToggleBtn) soundToggleBtn.addEventListener('click', toggleAudio);

function playCoinSound(comboLevel = 1) {
  if (!isAudioEnabled) return;
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;

    const noteIndex = Math.min(pentatonicScale.length - 1, Math.max(0, comboLevel - 1));
    const baseFreq = pentatonicScale[noteIndex];

    const osc = actx.createOscillator();
    const gain = actx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.setValueAtTime(baseFreq * 1.5, now + 0.07);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(actx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (err) {}
}

function playHitSound() {
  if (!isAudioEnabled) return;
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;

    const osc = actx.createOscillator();
    const gain = actx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(170, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.2);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(actx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (err) {}
}

function playGameOverSound() {
  if (!isAudioEnabled) return;
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;

    const osc = actx.createOscillator();
    const gain = actx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.setValueAtTime(260, now + 0.12);
    osc.frequency.setValueAtTime(196, now + 0.24);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.65);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

    osc.connect(gain);
    gain.connect(actx.destination);

    osc.start(now);
    osc.stop(now + 0.7);
  } catch (err) {}
}

function playRestartSound() {
  if (!isAudioEnabled) return;
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;

    const osc = actx.createOscillator();
    const gain = actx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(659.25, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(actx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch (err) {}
}

// ==========================================
// 4. Entity Definitions
// ==========================================
const player = {
  x: 120,
  y: 205,
  width: 40,
  height: 40,
  speed: 5,
  color: '#38bdf8',
  borderColor: '#0284c7',
  startX: 120,
  startY: 205,
  lastDx: 0,
  lastDy: 0
};

const coin = {
  x: 400,
  y: 225,
  radius: 16,
  color: '#facc15',
  borderColor: '#ca8a04',
  innerColor: '#fef08a'
};

const enemy = {
  x: 640,
  y: 205,
  width: 40,
  height: 40,
  size: 40,
  baseSpeed: 3,
  speed: 3,
  direction: -1,
  patrolMinX: 280,
  patrolMaxX: 740,
  color: '#ef4444',
  borderColor: '#b91c1c',
  startX: 640,
  startY: 205,
  startDirection: -1
};

// Background Ambient Starfield
const stars = [];
for (let i = 0; i < 35; i++) {
  stars.push({
    x: Math.random() * 800,
    y: Math.random() * 450,
    radius: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.002 + 0.001,
    phase: Math.random() * Math.PI * 2
  });
}

// ==========================================
// 5. Input Handling (Keyboard & Touch D-Pad)
// ==========================================
const activeKeys = {
  up: false,
  down: false,
  left: false,
  right: false
};

function handleKeyEvent(event, isPressed) {
  // ESC or P toggles Pause during active gameplay
  if (isPressed && (event.key === 'Escape' || event.key.toLowerCase() === 'p')) {
    if (currentState === GameState.PLAYING) {
      pauseGame();
      return;
    } else if (currentState === GameState.PAUSED) {
      resumeGame();
      return;
    }
  }

  if (currentState !== GameState.PLAYING) {
    return;
  }

  const key = event.key.toLowerCase();
  let handled = false;

  if (key === 'arrowup' || key === 'w') { activeKeys.up = isPressed; handled = true; }
  if (key === 'arrowdown' || key === 's') { activeKeys.down = isPressed; handled = true; }
  if (key === 'arrowleft' || key === 'a') { activeKeys.left = isPressed; handled = true; }
  if (key === 'arrowright' || key === 'd') { activeKeys.right = isPressed; handled = true; }

  if (handled && event.key.startsWith('Arrow')) {
    event.preventDefault();
  }
}

window.addEventListener('keydown', (event) => handleKeyEvent(event, true));
window.addEventListener('keyup', (event) => handleKeyEvent(event, false));

window.addEventListener('blur', () => {
  activeKeys.up = false;
  activeKeys.down = false;
  activeKeys.left = false;
  activeKeys.right = false;
});

function bindTouchButton(id, direction) {
  const btn = document.getElementById(id);
  if (!btn) return;

  const press = (e) => {
    e.preventDefault();
    if (currentState === GameState.PLAYING) {
      activeKeys[direction] = true;
      btn.classList.add('pressed');
    }
  };

  const release = (e) => {
    e.preventDefault();
    activeKeys[direction] = false;
    btn.classList.remove('pressed');
  };

  btn.addEventListener('pointerdown', press);
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  btn.addEventListener('pointerleave', release);
}

bindTouchButton('dpadUp', 'up');
bindTouchButton('dpadDown', 'down');
bindTouchButton('dpadLeft', 'left');
bindTouchButton('dpadRight', 'right');

// ==========================================
// 6. Visual Juice: Screen Shake & Particles
// ==========================================

function triggerScreenShake(intensity = 6, duration = 250) {
  screenShakeIntensity = intensity;
  screenShakeTimer = duration;
}

function createCoinBurst(x, y) {
  const count = 12;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const speed = Math.random() * 3 + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 3 + 2,
      alpha: 1.0,
      color: '#facc15',
      decay: 0.035
    });
  }
}

function createHitBurst(x, y) {
  const count = 16;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: Math.random() * 3.5 + 2,
      alpha: 1.0,
      color: Math.random() > 0.5 ? '#38bdf8' : '#ffffff',
      decay: 0.04
    });
  }
}

// ==========================================
// 7. Movement, Collision & Dynamic AI
// ==========================================

function updatePlayer() {
  let dx = 0;
  let dy = 0;

  if (activeKeys.left) dx -= 1;
  if (activeKeys.right) dx += 1;
  if (activeKeys.up) dy -= 1;
  if (activeKeys.down) dy += 1;

  if (dx !== 0 || dy !== 0) {
    player.lastDx = dx;
    player.lastDy = dy;

    if (dx !== 0 && dy !== 0) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }

    player.x += dx * player.speed;
    player.y += dy * player.speed;

    clampPlayerToBounds();
  }
}

function clampPlayerToBounds() {
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  if (player.y < 0) player.y = 0;
  if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
}

function updateEnemy() {
  // Dynamic speed scaling based on score
  enemy.speed = Math.min(5.5, enemy.baseSpeed + score * 0.06);

  enemy.x += enemy.speed * enemy.direction;

  if (enemy.x <= enemy.patrolMinX) {
    enemy.x = enemy.patrolMinX;
    enemy.direction = 1;
  } else if (enemy.x >= enemy.patrolMaxX) {
    enemy.x = enemy.patrolMaxX;
    enemy.direction = -1;
  }
}

function checkPlayerCoinCollision() {
  const closestX = Math.max(player.x, Math.min(coin.x, player.x + player.width));
  const closestY = Math.max(player.y, Math.min(coin.y, player.y + player.height));
  const distanceX = coin.x - closestX;
  const distanceY = coin.y - closestY;
  return (distanceX * distanceX) + (distanceY * distanceY) < (coin.radius * coin.radius);
}

function checkPlayerEnemyCollision() {
  return (
    player.x < enemy.x + enemy.width &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.height &&
    player.y + player.height > enemy.y
  );
}

const MAX_SPAWN_ATTEMPTS = 50;

function spawnCoin() {
  const margin = coin.radius + 15;
  const minX = margin;
  const maxX = canvas.width - margin;
  const minY = margin;
  const maxY = canvas.height - margin;

  const safeDistance = (player.width / 2) + coin.radius + 50;
  const playerCenterX = player.x + (player.width / 2);
  const playerCenterY = player.y + (player.height / 2);

  let attempts = 0;
  let foundValidPosition = false;
  let candidateX = coin.x;
  let candidateY = coin.y;

  while (attempts < MAX_SPAWN_ATTEMPTS && !foundValidPosition) {
    attempts++;
    candidateX = Math.floor(minX + Math.random() * (maxX - minX));
    candidateY = Math.floor(minY + Math.random() * (maxY - minY));

    const dx = candidateX - playerCenterX;
    const dy = candidateY - playerCenterY;
    if ((dx * dx + dy * dy) >= (safeDistance * safeDistance)) {
      foundValidPosition = true;
    }
  }

  if (foundValidPosition) {
    coin.x = candidateX;
    coin.y = candidateY;
  } else {
    coin.x = playerCenterX < (canvas.width / 2) ? (canvas.width - margin - 40) : (margin + 40);
    coin.y = playerCenterY < (canvas.height / 2) ? (canvas.height - margin - 40) : (margin + 40);
  }
}

// ==========================================
// 8. State Flow, Hit & Game Over Handlers
// ==========================================

function handlePlayerHit(currentTime) {
  lives -= 1;
  updateLivesDisplay();
  combo = 0; // Break combo streak on hit

  createHitBurst(player.x + player.width / 2, player.y + player.height / 2);
  triggerScreenShake(6, 250);
  playHitSound();

  if (lives <= 0) {
    triggerGameOver();
  } else {
    player.x = player.startX;
    player.y = player.startY;

    activeKeys.up = false;
    activeKeys.down = false;
    activeKeys.left = false;
    activeKeys.right = false;

    isInvulnerable = true;
    invulnerabilityEndTime = currentTime + INVULNERABILITY_DURATION;
  }
}

function triggerGameOver() {
  currentState = GameState.GAMEOVER;
  triggerScreenShake(9, 380);
  playGameOverSound();

  activeKeys.up = false;
  activeKeys.down = false;
  activeKeys.left = false;
  activeKeys.right = false;

  const isNewRecord = score > highScore;
  if (isNewRecord) {
    highScore = score;
    saveHighScore();
    updateHighScoreDisplay();
  }

  if (finalScoreDisplay) finalScoreDisplay.textContent = score;
  if (finalBestDisplay) finalBestDisplay.textContent = highScore;

  if (newRecordBadge) {
    if (isNewRecord && score > 0) {
      newRecordBadge.classList.remove('hidden');
    } else {
      newRecordBadge.classList.add('hidden');
    }
  }

  if (gameOverOverlay) gameOverOverlay.classList.remove('hidden');
}

function startGameSession() {
  currentState = GameState.PLAYING;
  score = 0;
  lives = INITIAL_LIVES;
  combo = 0;
  isInvulnerable = false;
  invulnerabilityEndTime = 0;
  particles.length = 0;
  floatingTexts.length = 0;

  updateScoreDisplay();
  updateLivesDisplay();
  playRestartSound();

  player.x = player.startX;
  player.y = player.startY;
  player.lastDx = 0;
  player.lastDy = 0;

  enemy.x = enemy.startX;
  enemy.y = enemy.startY;
  enemy.direction = enemy.startDirection;

  activeKeys.up = false;
  activeKeys.down = false;
  activeKeys.left = false;
  activeKeys.right = false;

  spawnCoin();

  if (startOverlay) startOverlay.classList.add('hidden');
  if (gameOverOverlay) gameOverOverlay.classList.add('hidden');
  if (pauseOverlay) pauseOverlay.classList.add('hidden');
}

function pauseGame() {
  if (currentState !== GameState.PLAYING) return;
  currentState = GameState.PAUSED;
  if (pauseOverlay) pauseOverlay.classList.remove('hidden');
  if (pauseText) pauseText.textContent = 'RESUME';
}

function resumeGame() {
  if (currentState !== GameState.PAUSED) return;
  currentState = GameState.PLAYING;
  if (pauseOverlay) pauseOverlay.classList.add('hidden');
  if (pauseText) pauseText.textContent = 'PAUSE';
}

function togglePause() {
  if (currentState === GameState.PLAYING) {
    pauseGame();
  } else if (currentState === GameState.PAUSED) {
    resumeGame();
  }
}

// Attach UI Event Listeners
if (startBtn) startBtn.addEventListener('click', startGameSession);
if (restartBtn) restartBtn.addEventListener('click', startGameSession);
if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
if (resumeBtn) resumeBtn.addEventListener('click', resumeGame);
if (pauseRestartBtn) pauseRestartBtn.addEventListener('click', startGameSession);

// ==========================================
// 9. Master Update Function
// ==========================================

let lastTimestamp = performance.now();

function update() {
  const now = performance.now();
  const dt = Math.min(now - lastTimestamp, 100);
  lastTimestamp = now;

  // Screen shake decay
  if (screenShakeTimer > 0) {
    screenShakeTimer -= dt;
  }

  // Update particles even during game-over / pause for smooth decay
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= p.decay;
    if (p.alpha <= 0) particles.splice(i, 1);
  }

  // Update floating text popups
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const t = floatingTexts[i];
    t.y += t.dy;
    t.alpha -= 0.022;
    if (t.alpha <= 0) floatingTexts.splice(i, 1);
  }

  // Only execute gameplay physics while playing
  if (currentState !== GameState.PLAYING) {
    return;
  }

  // Invulnerability expiration
  if (isInvulnerable && now >= invulnerabilityEndTime) {
    isInvulnerable = false;
  }

  // Movement & AI
  updatePlayer();
  updateEnemy();

  // Enemy collision
  if (!isInvulnerable && checkPlayerEnemyCollision()) {
    handlePlayerHit(now);
    return;
  }

  // Coin collection with Combo streak system
  if (checkPlayerCoinCollision()) {
    if (now - lastCoinPickupTime <= COMBO_TIMEOUT) {
      combo += 1;
    } else {
      combo = 1;
    }
    lastCoinPickupTime = now;

    const pointsEarned = combo;
    score += pointsEarned;
    updateScoreDisplay();

    // Check high score in real-time
    if (score > highScore) {
      highScore = score;
      updateHighScoreDisplay();
      saveHighScore();
    }

    createCoinBurst(coin.x, coin.y);
    triggerScreenShake(3, 140);
    playCoinSound(combo);

    floatingTexts.push({
      x: coin.x,
      y: coin.y - 14,
      text: combo > 1 ? `+${pointsEarned} (${combo}x COMBO!)` : '+1',
      alpha: 1.0,
      dy: -1.2,
      color: combo > 1 ? '#34d399' : '#facc15'
    });

    spawnCoin();
  }
}

// ==========================================
// 10. Master Rendering Logic
// ==========================================

function drawBackground() {
  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const now = performance.now();

  // Ambient Starfield
  for (const s of stars) {
    const brightness = (Math.sin(now * s.speed + s.phase) + 1) / 2;
    ctx.fillStyle = `rgba(148, 163, 184, ${brightness * 0.45 + 0.1})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Arcade grid lines
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawPlayer() {
  const now = performance.now();

  if (isInvulnerable) {
    const blinkPhase = Math.floor(now / 100) % 2;
    ctx.globalAlpha = blinkPhase === 0 ? 0.3 : 0.85;

    // Glowing protective aura ring
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.78, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  } else {
    ctx.globalAlpha = 1.0;
  }

  // Player body
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.strokeStyle = player.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(player.x, player.y, player.width, player.height);

  // Directional Animated Eyes (Gives character expression and life!)
  let eyeOffsetX = 0;
  let eyeOffsetY = 0;
  if (activeKeys.left) eyeOffsetX = -2;
  if (activeKeys.right) eyeOffsetX = 2;
  if (activeKeys.up) eyeOffsetY = -2;
  if (activeKeys.down) eyeOffsetY = 2;

  // Sclera (White eye bases)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(player.x + 9, player.y + 11, 7, 9);
  ctx.fillRect(player.x + 24, player.y + 11, 7, 9);

  // Pupils (Looking in direction of movement)
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(player.x + 11 + eyeOffsetX, player.y + 13 + eyeOffsetY, 4, 5);
  ctx.fillRect(player.x + 26 + eyeOffsetX, player.y + 13 + eyeOffsetY, 4, 5);

  ctx.globalAlpha = 1.0;
}

function drawCoin() {
  const now = performance.now();
  const pulse = Math.sin(now / 180) * 1.5;
  const visualRadius = Math.max(12, coin.radius + pulse);

  // Subtle outer golden aura
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, visualRadius + 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(250, 204, 21, 0.15)';
  ctx.fill();

  // Main coin disc
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, visualRadius, 0, Math.PI * 2);
  ctx.fillStyle = coin.color;
  ctx.fill();

  ctx.strokeStyle = coin.borderColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner ring shimmer
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, visualRadius * 0.55, 0, Math.PI * 2);
  ctx.strokeStyle = coin.innerColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawEnemy() {
  const now = performance.now();
  const corePulse = Math.sin(now / 150) * 2;

  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

  ctx.strokeStyle = enemy.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);

  // Pulsating red eye core
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(enemy.x + 8, enemy.y + 8, enemy.width - 16, enemy.height - 16);

  ctx.fillStyle = '#fca5a5';
  ctx.fillRect(enemy.x + 16 - corePulse / 2, enemy.y + 16 - corePulse / 2, 8 + corePulse, 8 + corePulse);
}

function drawParticles() {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    ctx.restore();
  }
}

function drawFloatingTexts() {
  for (const t of floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, t.alpha);
    ctx.fillStyle = t.color || '#facc15';
    ctx.font = 'bold 14px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = t.color || '#facc15';
    ctx.shadowBlur = 8;
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  }
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Calculate camera shake offset
  let shakeX = 0;
  let shakeY = 0;
  if (screenShakeTimer > 0) {
    const progress = screenShakeTimer / 250;
    const currentIntensity = screenShakeIntensity * progress;
    shakeX = (Math.random() - 0.5) * currentIntensity * 2;
    shakeY = (Math.random() - 0.5) * currentIntensity * 2;
  }

  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawBackground();
  drawPlayer();
  drawCoin();
  drawEnemy();
  drawParticles();
  drawFloatingTexts();

  ctx.restore();
}

// ==========================================
// 11. Continuous Game Loop & Initialization
// ==========================================
let isLoopRunning = false;

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function initGame() {
  if (isLoopRunning) return;
  isLoopRunning = true;
  loadHighScore();
  requestAnimationFrame(gameLoop);
  console.log('Coin Catcher Professional Edition initialized.');
}

// Initialize on page load
initGame();
