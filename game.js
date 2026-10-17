/**
 * Coin Catcher Arcade - Phase 3: Continuous Game Loop
 * 
 * In this phase:
 * 1. Establishes a true continuous game loop via requestAnimationFrame().
 * 2. Strictly separates state updates (update()) from rendering (draw()).
 * 3. Clears the canvas buffer every frame (ctx.clearRect) to prevent motion trails.
 * 4. Guards against duplicate loop initiation with single-start initialization.
 * 5. Preserves all Phase 2 keyboard input, diagonal normalization, and boundary clamping.
 * 6. Preserves stationary coin and enemy entities.
 */

// ==========================================
// 1. Canvas Setup
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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

// Coin remains visible and stationary
const coin = {
  x: 400,          // Center horizontal coordinate
  y: 225,          // Center vertical coordinate
  radius: 16,      // Circle radius in pixels
  color: '#facc15',// Bright arcade gold
  borderColor: '#ca8a04',
  innerColor: '#fef08a'
};

// Enemy remains visible and stationary
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
// State tracking object for directional controls
const activeKeys = {
  up: false,
  down: false,
  left: false,
  right: false
};

/**
 * Maps keyboard event keys to directional flags.
 * Supports Arrow keys and WASD (case-insensitive).
 * Prevents default page scrolling for arrow keys.
 */
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

// Attach event listeners to window (one-time setup)
window.addEventListener('keydown', (event) => handleKeyEvent(event, true));
window.addEventListener('keyup', (event) => handleKeyEvent(event, false));

// Reset keys when the window loses focus to prevent stuck keys
window.addEventListener('blur', () => {
  activeKeys.up = false;
  activeKeys.down = false;
  activeKeys.left = false;
  activeKeys.right = false;
});

// ==========================================
// 4. Game Logic (State Updates)
// ==========================================

/**
 * Updates player position based on currently held keys.
 * Normalizes diagonal movement so diagonal travel isn't faster.
 */
function updatePlayer() {
  let dx = 0;
  let dy = 0;

  // Direction vector components
  if (activeKeys.left) dx -= 1;
  if (activeKeys.right) dx += 1;
  if (activeKeys.up) dy -= 1;
  if (activeKeys.down) dy += 1;

  // Only move if at least one direction is active
  if (dx !== 0 || dy !== 0) {
    // Diagonal Normalization:
    // Scale diagonal speed by 1 / sqrt(2) ≈ 0.7071 to ensure consistent speed
    if (dx !== 0 && dy !== 0) {
      dx *= Math.SQRT1_2;
      dy *= Math.SQRT1_2;
    }

    // Apply displacement
    player.x += dx * player.speed;
    player.y += dy * player.speed;

    // Enforce Canvas boundaries
    clampPlayerToBounds();
  }
}

/**
 * Restricts player coordinates to stay completely inside the 800x450 Canvas.
 * Incorporates player width and height.
 */
function clampPlayerToBounds() {
  // Left boundary
  if (player.x < 0) {
    player.x = 0;
  }
  // Right boundary (canvas width minus player width)
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
  // Top boundary
  if (player.y < 0) {
    player.y = 0;
  }
  // Bottom boundary (canvas height minus player height)
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
  }
}

/**
 * Master update function.
 * Coordinates all game state changes each frame.
 */
function update() {
  updatePlayer();
}

// ==========================================
// 5. Rendering Logic (Drawing)
// ==========================================

/**
 * Draws the subtle arcade background grid.
 */
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

/**
 * Draws the Blue Square Player.
 */
function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.strokeStyle = player.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(player.x + 6, player.y + 6, player.width - 12, player.height - 12);
}

/**
 * Draws the Golden Circular Coin.
 */
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

/**
 * Draws the Red Square Enemy.
 */
function drawEnemy() {
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

  ctx.strokeStyle = enemy.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(enemy.x, enemy.y, enemy.size, enemy.size);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(enemy.x + 8, enemy.y + 8, enemy.size - 16, enemy.size - 16);
}

/**
 * Master draw function.
 * Clears the canvas buffer and draws all entities in correct visual order.
 */
function draw() {
  // Step 1: Clear the previous frame to avoid ghosting/smearing trails
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Step 2: Draw the scene layers
  drawBackground();
  drawPlayer();
  drawCoin();
  drawEnemy();
}

// ==========================================
// 6. Continuous Game Loop
// ==========================================

// Guard flag to guarantee the loop is started exactly once
let isLoopRunning = false;

/**
 * The core continuous game loop.
 * Executed before every screen repaint (~60 times per second).
 */
function gameLoop() {
  // 1. Update game state
  update();

  // 2. Render current state to screen
  draw();

  // 3. Request the browser to call gameLoop again on the next animation frame
  requestAnimationFrame(gameLoop);
}

/**
 * Initializes and starts the continuous game loop.
 * Protects against accidental multiple loop invocations.
 */
function startGame() {
  if (isLoopRunning) {
    console.warn('Game loop is already running. Ignoring duplicate start request.');
    return;
  }
  isLoopRunning = true;
  requestAnimationFrame(gameLoop);
  console.log('Continuous game loop initialized successfully.');
}

// Start the game loop exactly once on load
startGame();
