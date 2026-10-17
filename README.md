# Coin Catcher Game

A classic 2D arcade coin catcher game built with HTML5 Canvas, modern CSS, and vanilla JavaScript (zero dependencies).

## Phase 1: Project Setup & Static Game Screen
- **Canvas Resolution:** 800 × 450 logical pixels
- **Player:** Blue square (`#38bdf8`)
- **Coin:** Golden circle (`#facc15`)
- **Enemy:** Red square (`#ef4444`)
- **Theme:** Polished retro-modern arcade aesthetic

## Phase 2: Player Movement & Keyboard Input
- **Controls:** Arrow Keys (`↑`, `↓`, `←`, `→`) and `W`, `A`, `S`, `D`
- **Continuous Movement:** Responsive key state tracking with smooth hold support
- **Normalized Diagonals:** Prevents diagonal movement from being $\sqrt{2} \approx 1.41\times$ faster
- **Boundaries:** Clamped strictly within the $800 \times 450$ canvas area
- **Zero Dependencies:** Pure vanilla JavaScript

## Phase 3: Continuous Game Loop
- **Loop Engine:** Driven by `requestAnimationFrame()` for native 60fps refresh sync
- **Separation of Concerns:**
  - `update()`: Mutates game state, calculates positions, checks canvas bounds
  - `draw()`: Clears canvas buffer (`ctx.clearRect`) and draws scene layers (no trails)
  - `gameLoop()`: Executes `update()`, then `draw()`, then schedules the next frame
- **Single-Start Guard:** Prevents duplicate running loops or frame spikes

## Phase 4: Coin Collection, Collision Detection & Score
- **Collision Detection:** Exact mathematical Circle-versus-Rectangle (AABB) intersection check
- **Score System:** Initialized to 0, updates immediately in the arcade HUD upon collection
- **Single-Collection Guarantee:** Score increments exactly once per coin collection
- **Safe Random Spawning:** Moves coin within canvas bounds, enforces safe distance from player, and includes a deterministic quadrant fallback if max attempts (50) are reached

## How to Run
Open `index.html` in any modern web browser.
