/**
 * Coin Catcher Arcade - Phase 7: Visual Polish, Animations, Sound, and Responsive Controls
 * 
 * In this phase:
 * 1. Web Audio API synthesized retro sound effects (Coin, Hit, Game Over, Restart).
 * 2. Sound starts OFF/Muted by default; toggleable via the HUD button.
 * 3. Responsive Touch D-Pad controls with continuous hold and diagonal support.
 * 4. Lightweight visual animations: pulsing coin, glowing invulnerability shield, menacing enemy core.
 * 5. Floating "+1" score popup particles when coins are collected.
 * 6. Responsive canvas scaling and accessibility improvements (:focus-visible, reduced-motion).
 * 7. Zero dependencies (no external audio files or libraries).
 */

// ==========================================
// 1. Canvas Setup & DOM References
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('scoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const restartBtn = document.getElementById('restartBtn');

const soundToggleBtn = document.getElementById('soundToggleBtn');
const soundIcon = document.getElementById('soundIcon');
const soundText = document.getElementById('soundText');

// ==========================================
// 2. Constants & Game State Variables
// ==========================================
const INITIAL_LIVES = 3;
const INVULNERABILITY_DURATION = 1500; // milliseconds

let score = 0;
let lives = INITIAL_LIVES;
let isGameOver = false;
let isInvulnerable = false;
let invulnerabilityEndTime = 0;

// Floating text particle system for score feedback
const floatingTexts = [];

/**
 * Updates the HTML score counter element.
 */
function updateScoreDisplay() {
  if (scoreDisplay) {
    scoreDisplay.textContent = score;
  }
}

/**
 * Updates the HTML lives counter element.
 */
function updateLivesDisplay() {
  if (livesDisplay) {
    livesDisplay.textContent = lives;
  }
}

// ==========================================
// 3. Web Audio API Retro Sound Synthesizer
// ==========================================
let audioCtx = null;
let isAudioEnabled = false;

/**
 * Lazily initializes and resumes the Web Audio context upon user interaction.
 */
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

/**
 * Toggles game sound effects on/off.
 */
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

if (soundToggleBtn) {
  soundToggleBtn.addEventListener('click', toggleAudio);
}

/**
 * Synthesizes a cheerful two-tone ascending coin pickup sound.
 */
function playCoinSound() {
  if (!isAudioEnabled) return;
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;

    const osc = actx.createOscillator();
    const gain = actx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880.00, now + 0.08); // A5

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(actx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  } catch (err) {
    console.warn('Audio synthesis note:', err);
  }
}

/**
 * Synthesizes a low-pitch impact buzz sound for player damage.
 */
function playHitSound() {
  if (!isAudioEnabled) return;
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;

    const osc = actx.createOscillator();
    const gain = actx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.18);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(actx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  } catch (err) {
    console.warn('Audio synthesis note:', err);
  }
}

/**
 * Synthesizes a descending game-over defeat sequence.
 */
function playGameOverSound() {
  if (!isAudioEnabled) return;
  try {
    const actx = getAudioContext();
    if (!actx) return;
    const now = actx.currentTime;

    const osc = actx.createOscillator();
    const gain = actx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.setValueAtTime(260, now + 0.12);
    osc.frequency.setValueAtTime(200, now + 0.24);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.6);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(actx.destination);

    osc.start(now);
    osc.stop(now + 0.65);
  } catch (err) {
    console.warn('Audio synthesis note:', err);
  }
}

/**
 * Synthesizes a crisp start/restart confirmation tone.
 */
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
  } catch (err) {
    console.warn('Audio synthesis note:', err);
  }
}

// ==========================================
// 4. Entity Definitions
// ==========================================
// Player object
const player = {
  x: 120,          // Distance from the left canvas edge in pixels
  y: 205,          // Distance from the top canvas edge in pixels
  width: 40,       // Width of player square in pixels
  height: 40,      // Height of player square in pixels
  speed: 5,        // Movement speed in pixels per frame
  color: '#38bdf8',// Bright arcade blue
  borderColor: '#0284c7',
  startX: 120,     // Safe starting position X
  startY: 205      // Safe starting position Y
};

// Golden Coin (circular target)
const coin = {
  x: 400,          // Center horizontal coordinate
  y: 225,          // Center vertical coordinate
  radius: 16,      // Circle radius in pixels
  color: '#facc15',// Bright arcade gold
  borderColor: '#ca8a04',
  innerColor: '#fef08a'
};

// Red Enemy with Horizontal Patrol AI
const enemy = {
  x: 640,          // Current horizontal position
  y: 205,          // Current vertical position
  width: 40,       // Width of enemy square
  height: 40,      // Height of enemy square
  size: 40,        // Backward compatibility
  speed: 3,        // Horizontal patrol speed in pixels per frame
  direction: -1,   // -1: moving left, 1: moving right
  patrolMinX: 280, // Left patrol turnaround boundary
  patrolMaxX: 740, // Right patrol turnaround boundary
  color: '#ef4444',// Menacing arcade red
  borderColor: '#b91c1c',
  startX: 640,     // Initial starting X for restart
  startY: 205,     // Initial starting Y for restart
  startDirection: -1
};

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
  // Ignore movement inputs if game is over
  if (isGameOver) {
    return;
  }

  const key = event.key.toLowerCase();
  let handled = false;

  // Vertical input
  if (key === 'arrowup' || key === 'w') {
    activeKeys.up = isPressed;
    handled = true;
  }
  if (key === 'arrowdown' || key === 's') {
    activeKeys.down = isPressed;
    handled = true;
  }

  // Horizontal input
  if (key === 'arrowleft' || key === 'a') {
    activeKeys.left = isPressed;
    handled = true;
  }
  if (key === 'arrowright' || key === 'd') {
    activeKeys.right = isPressed;
    handled = true;
  }

  // Prevent arrow keys from scrolling the webpage
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

// Pointer/Touch D-Pad Bindings
function bindTouchButton(id, direction) {
  const btn = document.getElementById(id);
  if (!btn) return;

  const press = (e) => {
    e.preventDefault();
    if (!isGameOver) {
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
// 6. Movement & AI Logic
// ==========================================

function updatePlayer() {
  let dx = 0;
  let dy = 0;

  if (activeKeys.left) dx -= 1;
  if (activeKeys.right) dx += 1;
  if (activeKeys.up) dy -= 1;
  if (activeKeys.down) dy += 1;

  if (dx !== 0 || dy !== 0) {
    // Diagonal Normalization
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
  if (player.x < 0) {
    player.x = 0;
  }
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
  if (player.y < 0) {
    player.y = 0;
  }
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
  }
}

/**
 * Updates enemy horizontal patrol position.
 * Reverses direction when reaching either patrol boundary.
 */
function updateEnemy() {
  enemy.x += enemy.speed * enemy.direction;

  // Turn around at left patrol boundary
  if (enemy.x <= enemy.patrolMinX) {
    enemy.x = enemy.patrolMinX;
    enemy.direction = 1;
  }
  // Turn around at right patrol boundary
  else if (enemy.x >= enemy.patrolMaxX) {
    enemy.x = enemy.patrolMaxX;
    enemy.direction = -1;
  }
}

// ==========================================
// 7. Collision Detection & Safe Spawning
// ==========================================

/**
 * Detects collision between player rectangle and circular coin.
 */
function checkPlayerCoinCollision() {
  const closestX = Math.max(player.x, Math.min(coin.x, player.x + player.width));
  const closestY = Math.max(player.y, Math.min(coin.y, player.y + player.height));

  const distanceX = coin.x - closestX;
  const distanceY = coin.y - closestY;

  const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
  return distanceSquared < (coin.radius * coin.radius);
}

/**
 * Detects collision between player rectangle and enemy rectangle
 * using Axis-Aligned Bounding Box (AABB) intersection testing.
 */
function checkPlayerEnemyCollision() {
  return (
    player.x < enemy.x + enemy.width &&
    player.x + player.width > enemy.x &&
    player.y < enemy.y + enemy.height &&
    player.y + player.height > enemy.y
  );
}

const MAX_SPAWN_ATTEMPTS = 50;

/**
 * Repositions coin to a random valid location within canvas boundaries.
 */
function spawnCoin() {
  const margin = coin.radius + 15;
  const minX = margin;
  const maxX = canvas.width - margin;
  const minY = margin;
  const maxY = canvas.height - margin;

  const safeDistance = (player.width / 2) + coin.radius + 50; // ~86px
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
    const distanceSquared = (dx * dx) + (dy * dy);

    if (distanceSquared >= (safeDistance * safeDistance)) {
      foundValidPosition = true;
    }
  }

  if (foundValidPosition) {
    coin.x = candidateX;
    coin.y = candidateY;
  } else {
    // Safe deterministic fallback: opposite quadrant from player
    coin.x = playerCenterX < (canvas.width / 2) ? (canvas.width - margin - 40) : (margin + 40);
    coin.y = playerCenterY < (canvas.height / 2) ? (canvas.height - margin - 40) : (margin + 40);
  }
}

// ==========================================
// 8. Hit Handling, Invulnerability & Game Over
// ==========================================

function handlePlayerHit(currentTime) {
  lives -= 1;
  updateLivesDisplay();
  playHitSound();

  if (lives <= 0) {
    triggerGameOver();
  } else {
    // Non-fatal hit: Safe respawn and 1.5s invulnerability
    player.x = player.startX;
    player.y = player.startY;

    activeKeys.up = false;
    activeKeys.down = false;
    activeKeys.left = false;
    activeKeys.right = false;

    isInvulnerable = true;
    invulnerabilityEndTime = currentTime + INVULNERABILITY_DURATION;

    console.log(`Player hit! Lives remaining: ${lives}. Invulnerable for 1.5s.`);
  }
}

function triggerGameOver() {
  if (isGameOver) return;
  isGameOver = true;
  playGameOverSound();

  activeKeys.up = false;
  activeKeys.down = false;
  activeKeys.left = false;
  activeKeys.right = false;

  if (finalScoreDisplay) {
    finalScoreDisplay.textContent = score;
  }

  if (gameOverOverlay) {
    gameOverOverlay.classList.remove('hidden');
  }

  console.log(`Game Over! Final Score: ${score}`);
}

function restartGame() {
  isGameOver = false;
  score = 0;
  lives = INITIAL_LIVES;
  isInvulnerable = false;
  invulnerabilityEndTime = 0;
  floatingTexts.length = 0; // Clear particle queue

  updateScoreDisplay();
  updateLivesDisplay();
  playRestartSound();

  player.x = player.startX;
  player.y = player.startY;

  enemy.x = enemy.startX;
  enemy.y = enemy.startY;
  enemy.direction = enemy.startDirection;

  activeKeys.up = false;
  activeKeys.down = false;
  activeKeys.left = false;
  activeKeys.right = false;

  spawnCoin();

  if (gameOverOverlay) {
    gameOverOverlay.classList.add('hidden');
  }

  console.log('Game restarted successfully. 3 Lives restored, Score reset to 0.');
}

if (restartBtn) {
  restartBtn.addEventListener('click', restartGame);
}

// ==========================================
// 9. Master Update Function
// ==========================================

function update() {
  if (isGameOver) {
    return;
  }

  const now = performance.now();

  // 1. Expire invulnerability window
  if (isInvulnerable && now >= invulnerabilityEndTime) {
    isInvulnerable = false;
  }

  // 2. Update player movement
  updatePlayer();

  // 3. Update enemy patrol
  updateEnemy();

  // 4. Update floating score popup particles
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const item = floatingTexts[i];
    item.y += item.dy;
    item.alpha -= 0.025;
    if (item.alpha <= 0) {
      floatingTexts.splice(i, 1);
    }
  }

  // 5. Check player-enemy collision (only active when not invulnerable)
  if (!isInvulnerable && checkPlayerEnemyCollision()) {
    handlePlayerHit(now);
    return;
  }

  // 6. Check coin collection (remains active during invulnerability!)
  if (checkPlayerCoinCollision()) {
    score += 1;
    updateScoreDisplay();

    // Spawn floating score feedback particle
    floatingTexts.push({
      x: coin.x,
      y: coin.y - 12,
      text: '+1',
      alpha: 1.0,
      dy: -1.0
    });

    playCoinSound();
    spawnCoin();
  }
}

// ==========================================
// 10. Rendering Logic & Visual Animations
// ==========================================

function drawBackground() {
  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.04)';
  ctx.lineWidth = 1;

  const gridSize = 40;
  for (let x = 0; x <= canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  for (let y = 0; y <= canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawPlayer() {
  const now = performance.now();

  // Controlled blinking & protective shield aura during invulnerability
  if (isInvulnerable) {
    const blinkPhase = Math.floor(now / 100) % 2;
    ctx.globalAlpha = blinkPhase === 0 ? 0.3 : 0.85;

    // Glowing protective aura ring
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.75, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else {
    ctx.globalAlpha = 1.0;
  }

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.strokeStyle = player.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(player.x + 6, player.y + 6, player.width - 12, player.height - 12);

  ctx.globalAlpha = 1.0;
}

function drawCoin() {
  const now = performance.now();
  // Lightweight pulse animation: gentle expansion/contraction
  const pulse = Math.sin(now / 180) * 1.5;
  const visualRadius = Math.max(12, coin.radius + pulse);

  // Subtle outer golden glow aura
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, visualRadius + 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(250, 204, 21, 0.12)';
  ctx.fill();

  // Main coin disc
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, visualRadius, 0, Math.PI * 2);
  ctx.fillStyle = coin.color;
  ctx.fill();

  ctx.strokeStyle = coin.borderColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner ring highlight
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

  // Menacing pulsating core
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(enemy.x + 8, enemy.y + 8, enemy.width - 16, enemy.height - 16);

  ctx.fillStyle = '#fca5a5';
  ctx.fillRect(enemy.x + 16 - corePulse / 2, enemy.y + 16 - corePulse / 2, 8 + corePulse, 8 + corePulse);
}

function drawFloatingTexts() {
  for (const item of floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, item.alpha);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 15px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(250, 204, 21, 0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText(item.text, item.x, item.y);
    ctx.restore();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  drawPlayer();
  drawCoin();
  drawEnemy();
  drawFloatingTexts();
}

// ==========================================
// 11. Continuous Game Loop & Startup
// ==========================================

let isLoopRunning = false;

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  if (isLoopRunning) {
    console.warn('Game loop is already running. Ignoring duplicate start request.');
    return;
  }
  isLoopRunning = true;
  score = 0;
  lives = INITIAL_LIVES;
  isGameOver = false;
  isInvulnerable = false;
  invulnerabilityEndTime = 0;

  updateScoreDisplay();
  updateLivesDisplay();
  requestAnimationFrame(gameLoop);
  console.log('Game loop started successfully with sound and touch support.');
}

// Start game loop on initial load
startGame();
