/**
 * Coin Catcher Arcade - Phase 5: Enemy Movement, Basic AI, and Game Over
 * 
 * In this phase:
 * 1. The red enemy moves with horizontal patrol AI, reversing at patrol boundaries.
 * 2. Player-Enemy collision detection (AABB) triggers the Game Over state.
 * 3. Gameplay updates freeze upon Game Over (player, enemy, coin, and score stop).
 * 4. A game-over modal overlay displays the final score and a Restart button.
 * 5. Restart resets score, player, enemy, and coin without creating duplicate loops or listeners.
 * 6. Preserves Phase 1-4 features: keyboard input, normalization, boundaries, coin collection, score HUD.
 */

// ==========================================
// 1. Canvas Setup & DOM References
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('scoreDisplay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreDisplay = document.getElementById('finalScoreDisplay');
const restartBtn = document.getElementById('restartBtn');

// ==========================================
// 2. Game State Variables
// ==========================================
let score = 0;
let isGameOver = false;

/**
 * Updates the HTML score counter element.
 */
function updateScoreDisplay() {
  if (scoreDisplay) {
    scoreDisplay.textContent = score;
  }
}

// ==========================================
// 3. Entity Definitions
// ==========================================
// Player object
const player = {
  x: 120,          // Distance from the left canvas edge in pixels
  y: 205,          // Distance from the top canvas edge in pixels
  width: 40,       // Width of player square in pixels
  height: 40,      // Height of player square in pixels
  speed: 5,        // Movement speed in pixels per frame
  color: '#38bdf8',// Bright arcade blue
  borderColor: '#0284c7'
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
// 4. Input Handling
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

// ==========================================
// 5. Movement & AI Logic
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
// 6. Collision Detection & Safe Spawning
// ==========================================

/**
 * Detects collision between the player rectangle and the circular coin.
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

// Maximum random spawn attempts before applying deterministic fallback
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
// 7. Game Over & Restart Mechanics
// ==========================================

/**
 * Triggers the Game Over state when player collides with enemy.
 * Freezes gameplay and displays the final score overlay.
 */
function triggerGameOver() {
  if (isGameOver) return; // Prevent repeated triggers
  isGameOver = true;

  // Clear held keys so player doesn't move immediately on restart
  activeKeys.up = false;
  activeKeys.down = false;
  activeKeys.left = false;
  activeKeys.right = false;

  // Update final score display
  if (finalScoreDisplay) {
    finalScoreDisplay.textContent = score;
  }

  // Show the modal overlay
  if (gameOverOverlay) {
    gameOverOverlay.classList.remove('hidden');
  }

  console.log(`Game Over triggered! Final Score: ${score}`);
}

/**
 * Resets the game to a fresh playable state.
 * Reuses the existing loop and event listeners (no duplicate loops created).
 */
function restartGame() {
  // 1. Reset state variables
  isGameOver = false;
  score = 0;
  updateScoreDisplay();

  // 2. Reset player to starting position
  player.x = 120;
  player.y = 205;

  // 3. Reset enemy to starting position and direction
  enemy.x = enemy.startX;
  enemy.y = enemy.startY;
  enemy.direction = enemy.startDirection;

  // 4. Reset keys
  activeKeys.up = false;
  activeKeys.down = false;
  activeKeys.left = false;
  activeKeys.right = false;

  // 5. Spawn coin in a fresh valid location
  spawnCoin();

  // 6. Hide game over overlay
  if (gameOverOverlay) {
    gameOverOverlay.classList.add('hidden');
  }

  console.log('Game restarted successfully. New session active.');
}

// Attach restart button click listener (one-time setup)
if (restartBtn) {
  restartBtn.addEventListener('click', restartGame);
}

// ==========================================
// 8. Master Update Function
// ==========================================

/**
 * Master update function.
 * Coordinates player movement, enemy patrol, and collision checks.
 * Stops all updates if isGameOver is true.
 */
function update() {
  // Stop all gameplay updates when game is over
  if (isGameOver) {
    return;
  }

  // 1. Update player based on input
  updatePlayer();

  // 2. Update enemy patrol
  updateEnemy();

  // 3. Check player-enemy collision (Game Over)
  if (checkPlayerEnemyCollision()) {
    triggerGameOver();
    return; // Exit immediately, no coin checks or movement updates
  }

  // 4. Check player-coin collision (Scoring)
  if (checkPlayerCoinCollision()) {
    score += 1;
    updateScoreDisplay();
    spawnCoin();
  }
}

// ==========================================
// 9. Rendering Logic (Drawing)
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
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.strokeStyle = player.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(player.x + 6, player.y + 6, player.width - 12, player.height - 12);
}

function drawCoin() {
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
  ctx.fillStyle = coin.color;
  ctx.fill();

  ctx.strokeStyle = coin.borderColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(coin.x, coin.y, coin.radius * 0.55, 0, Math.PI * 2);
  ctx.strokeStyle = coin.innerColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawEnemy() {
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

  ctx.strokeStyle = enemy.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(enemy.x + 8, enemy.y + 8, enemy.width - 16, enemy.height - 16);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  drawPlayer();
  drawCoin();
  drawEnemy();
}

// ==========================================
// 10. Continuous Game Loop & Startup
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
  isGameOver = false;
  updateScoreDisplay();
  requestAnimationFrame(gameLoop);
  console.log('Game loop started successfully.');
}

// Start game loop on initial load
startGame();
