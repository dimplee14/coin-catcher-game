/**
 * Coin Catcher Arcade - Phase 2: Player Movement and Keyboard Input
 * 
 * In this phase:
 * 1. The player object stores x, y, width, height, and movement speed.
 * 2. Keydown and keyup events track active directions (Arrow keys & WASD).
 * 3. Diagonal movement is normalized (not 1.41x faster).
 * 4. Boundary checking ensures the player stays completely within the canvas.
 * 5. A temporary update-and-draw ticker runs to make movement visible and smooth.
 * 6. The coin and enemy remain visible and stationary.
 */

// Step 1: Obtain reference to the HTML5 canvas element and 2D context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Step 2: Define Game Entities
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

// Step 3: Keyboard Input Tracking
// An object representing the live pressed-state of each direction
const activeKeys = {
  up: false,
  down: false,
  left: false,
  right: false
};

/**
 * Handles keydown and keyup events.
 * Supports both Arrow keys and WASD (case-insensitive).
 * Prevents default page scrolling for arrow keys.
 * 
 * @param {KeyboardEvent} event - The keyboard event object
 * @param {boolean} isPressed - true on keydown, false on keyup
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

  // Prevent arrow keys from scrolling the webpage while playing
  if (handled && event.key.startsWith('Arrow')) {
    event.preventDefault();
  }
}

// Attach event listeners to window (one-time setup)
window.addEventListener('keydown', (event) => handleKeyEvent(event, true));
window.addEventListener('keyup', (event) => handleKeyEvent(event, false));

// Reset keys when the window loses focus to prevent "sticky key" syndrome
window.addEventListener('blur', () => {
  activeKeys.up = false;
  activeKeys.down = false;
  activeKeys.left = false;
  activeKeys.right = false;
});

// Step 4: Player Movement & Boundary Logic (Game Logic)

/**
 * Updates player position based on currently held keys.
 * Normalizes diagonal movement so diagonal travel isn't faster.
 */
function updatePlayer() {
  let dx = 0;
  let dy = 0;

  // Determine direction components
  if (activeKeys.left) dx -= 1;
  if (activeKeys.right) dx += 1;
  if (activeKeys.up) dy -= 1;
  if (activeKeys.down) dy += 1;

  // Only move if at least one movement key is pressed
  if (dx !== 0 || dy !== 0) {
    // Diagonal Normalization:
    // If moving both horizontally and vertically, the unnormalized vector length is sqrt(1^2 + 1^2) = sqrt(2) ≈ 1.414.
    // Multiplying by Math.SQRT1_2 (1 / sqrt(2) ≈ 0.7071) scales the vector length back to exactly 1.
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
  // Left boundary: player left edge must not be less than 0
  if (player.x < 0) {
    player.x = 0;
  }
  // Right boundary: player right edge (x + width) must not exceed canvas width
  if (player.x + player.width > canvas.width) {
    player.x = canvas.width - player.width;
  }
  // Top boundary: player top edge must not be less than 0
  if (player.y < 0) {
    player.y = 0;
  }
  // Bottom boundary: player bottom edge (y + height) must not exceed canvas height
  if (player.y + player.height > canvas.height) {
    player.y = canvas.height - player.height;
  }
}

// Step 5: Rendering Logic (Drawing Only)

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
 * Uses player.width and player.height.
 */
function drawPlayer() {
  // Main body
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Border outline
  ctx.strokeStyle = player.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(player.x, player.y, player.width, player.height);

  // Inner highlight detail
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
 * Renders the entire scene.
 * Pure rendering function: does not alter game state.
 */
function renderScene() {
  drawBackground();
  drawPlayer();
  drawCoin();
  drawEnemy();
}

// Step 6: Temporary Phase 2 Update-and-Draw Mechanism
// Note: A full game loop with delta-time will be introduced in Phase 3.
function phase2Tick() {
  updatePlayer();
  renderScene();
  requestAnimationFrame(phase2Tick);
}

// Initial kickoff
requestAnimationFrame(phase2Tick);
