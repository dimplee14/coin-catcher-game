/**
 * Coin Catcher Arcade - Phase 4: Coin Collection, Collision Detection, and Score
 * 
 * In this phase:
 * 1. Score tracking is introduced, starting at 0 and updating the HTML display.
 * 2. Circle-vs-Rectangle collision detection accurately detects when the player touches the coin.
 * 3. Collecting a coin increments the score by exactly 1 and immediately repositions the coin.
 * 4. Safe random coin spawning ensures the coin stays inside canvas bounds and does not spawn on the player.
 * 5. Single-collection-per-spawn prevents multi-counting while in contact.
 * 6. Preserves Phase 3 continuous game loop, input, diagonal normalization, and stationary enemy.
 */

// ==========================================
// 1. Canvas Setup & Score UI
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');

// Score State
let score = 0;

/**
 * Updates the HTML score counter element.
 */
function updateScoreDisplay() {
  if (scoreDisplay) {
    scoreDisplay.textContent = score;
  }
}

// ==========================================
// 2. Entity Definitions
// ==========================================
// Player object with positional, dimensional, and kinematic properties
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

// Red Enemy remains visible and stationary
const enemy = {
  x: 640,          // Distance from the left canvas edge in pixels
  y: 205,          // Distance from the top canvas edge in pixels
  size: 40,        // Width and height of the enemy square
  color: '#ef4444',// Menacing arcade red
  borderColor: '#b91c1c'
};

// ==========================================
// 3. Input Handling
// ==========================================
const activeKeys = {
  up: false,
  down: false,
  left: false,
  right: false
};

function handleKeyEvent(event, isPressed) {
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
// 4. Movement & Boundary Logic
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

// ==========================================
// 5. Collision Detection & Random Placement
// ==========================================

/**
 * Checks for collision between the rectangular player and the circular coin.
 * Uses exact Circle-versus-AABB (Axis-Aligned Bounding Box) mathematical testing:
 * 1. Clamps circle center to the closest point on player rectangle.
 * 2. Compares squared Euclidean distance with squared circle radius.
 * 
 * @returns {boolean} true if player touches or overlaps the coin
 */
function checkPlayerCoinCollision() {
  // Find closest point on player rectangle to the coin center
  const closestX = Math.max(player.x, Math.min(coin.x, player.x + player.width));
  const closestY = Math.max(player.y, Math.min(coin.y, player.y + player.height));

  // Compute distance vector from closest point to coin center
  const distanceX = coin.x - closestX;
  const distanceY = coin.y - closestY;

  // Use squared distance comparison to avoid expensive Math.sqrt calls
  const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
  return distanceSquared < (coin.radius * coin.radius);
}

// Maximum random spawn attempts before applying deterministic fallback
const MAX_SPAWN_ATTEMPTS = 50;

/**
 * Repositions the coin to a random valid location within the canvas.
 * Requirements:
 * - Keeps the coin completely inside canvas boundaries (including coin radius).
 * - Avoids spawning on top of or immediately adjacent to the player.
 * - Safely caps attempts at MAX_SPAWN_ATTEMPTS with a reliable fallback.
 */
function spawnCoin() {
  const margin = coin.radius + 15;
  const minX = margin;
  const maxX = canvas.width - margin;
  const minY = margin;
  const maxY = canvas.height - margin;

  // Safe distance threshold: player half-diagonal + coin radius + safe padding
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
    // Deterministic safe fallback: Place on opposite quadrant of canvas
    coin.x = playerCenterX < (canvas.width / 2) ? (canvas.width - margin - 40) : (margin + 40);
    coin.y = playerCenterY < (canvas.height / 2) ? (canvas.height - margin - 40) : (margin + 40);
    console.warn('Spawn max attempts reached. Placed coin using safe fallback quadrant.');
  }
}

/**
 * Master update function.
 * Coordinates game physics, input updates, and collision events.
 */
function update() {
  // 1. Move player according to input and boundaries
  updatePlayer();

  // 2. Check collision between player and coin
  if (checkPlayerCoinCollision()) {
    // Increment score exactly once per collection
    score += 1;
    updateScoreDisplay();

    // Immediately teleport coin to a safe random location away from player
    spawnCoin();
  }
}

// ==========================================
// 6. Rendering Logic (Drawing)
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
  ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

  ctx.strokeStyle = enemy.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(enemy.x, enemy.y, enemy.size, enemy.size);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(enemy.x + 8, enemy.y + 8, enemy.size - 16, enemy.size - 16);
}

function draw() {
  // Clear previous frame buffer
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Render scene elements
  drawBackground();
  drawPlayer();
  drawCoin();
  drawEnemy();
}

// ==========================================
// 7. Continuous Game Loop & Initialization
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
  updateScoreDisplay();
  requestAnimationFrame(gameLoop);
  console.log('Game initialized successfully. Score reset to 0.');
}

// Start game loop on load
startGame();
