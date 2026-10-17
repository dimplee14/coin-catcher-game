/**
 * Coin Catcher Arcade - Phase 1: Static Game Screen
 * 
 * In this phase, we establish the canvas rendering context
 * and draw our three core game entities as static shapes:
 * 1. Player (Blue Square)
 * 2. Coin   (Golden Circle)
 * 3. Enemy  (Red Square)
 */

// Step 1: Obtain reference to the HTML5 canvas element
const canvas = document.getElementById('gameCanvas');

// Step 2: Acquire the 2D rendering context
const ctx = canvas.getContext('2d');

// Step 3: Define Static Entity Specifications
const player = {
  x: 120,          // Distance from the left canvas edge in pixels
  y: 205,          // Distance from the top canvas edge in pixels
  size: 40,        // Width and height of the player square
  color: '#38bdf8',// Bright arcade blue
  borderColor: '#0284c7'
};

const coin = {
  x: 400,          // Center horizontal coordinate
  y: 225,          // Center vertical coordinate
  radius: 16,      // Circle radius in pixels
  color: '#facc15',// Bright arcade gold
  borderColor: '#ca8a04',
  innerColor: '#fef08a'
};

const enemy = {
  x: 640,          // Distance from the left canvas edge in pixels
  y: 205,          // Distance from the top canvas edge in pixels
  size: 40,        // Width and height of the enemy square
  color: '#ef4444',// Menacing arcade red
  borderColor: '#b91c1c'
};

/**
 * Draws a subtle background grid pattern to enhance the arcade aesthetic.
 */
function drawBackground() {
  // Fill base canvas color
  ctx.fillStyle = '#0b1120';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw light grid lines
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
 * Uses fillRect() and strokeRect().
 */
function drawPlayer() {
  // Main player body
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.size, player.size);

  // Border outline
  ctx.strokeStyle = player.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(player.x, player.y, player.size, player.size);

  // Optional: Inner detail for polished look
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fillRect(player.x + 6, player.y + 6, player.size - 12, player.size - 12);
}

/**
 * Draws the Golden Circular Coin.
 * Uses beginPath(), arc(), fill(), and stroke().
 */
function drawCoin() {
  // Outer gold circle
  ctx.beginPath();
  // arc(centerX, centerY, radius, startAngle, endAngle)
  ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
  ctx.fillStyle = coin.color;
  ctx.fill();

  ctx.strokeStyle = coin.borderColor;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Inner ring highlight
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, coin.radius * 0.55, 0, Math.PI * 2);
  ctx.strokeStyle = coin.innerColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/**
 * Draws the Red Square Enemy.
 * Uses fillRect() and strokeRect().
 */
function drawEnemy() {
  // Main enemy body
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

  // Border outline
  ctx.strokeStyle = enemy.borderColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(enemy.x, enemy.y, enemy.size, enemy.size);

  // Optional: Inner menacing core
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(enemy.x + 8, enemy.y + 8, enemy.size - 16, enemy.size - 16);
}

/**
 * Renders the static Phase 1 scene.
 * Called once upon load. No game loop or animation active.
 */
function renderStaticScene() {
  drawBackground();
  drawPlayer();
  drawCoin();
  drawEnemy();
  console.log('Phase 1 static scene rendered successfully.');
}

// Initial single render
renderStaticScene();
