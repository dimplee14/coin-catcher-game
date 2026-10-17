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

## Phase 5: Enemy Patrol AI, Collision & Game Over
- **Enemy Patrol AI:** Red enemy patrols horizontally ($x \in [280, 740]$) and reverses direction smoothly at bounds
- **Player-Enemy Collision:** Fast AABB collision detection triggers Game Over upon contact
- **State Management:** Freezes all gameplay updates (`isGameOver = true`), preventing further score increments or movement
- **Game Over Overlay & Restart:** Displays final score, reason for defeat, and a Restart button that cleanly resets the session without spawning duplicate animation loops

## Phase 6: Lives, Invulnerability & Game-State Improvements
- **3-Lives System:** Player starts with 3 lives displayed in the HUD; each non-fatal hit deducts 1 life
- **Safe Respawn & Invulnerability:** After hit, player resets to $(120, 205)$ with $1.5\text{s}$ invulnerability
- **Controlled Blinking:** Visual feedback via opacity toggling during invulnerability
- **Non-blocking Timing:** Driven by `performance.now()` elapsed timestamps
- **Game Over at 0 Lives:** Game Over triggers only when all 3 lives are exhausted

## Phase 7: Visual Polish, Animations, Sound & Touch Controls
- **Web Audio API Sound Effects:** Synthesized retro chimes for coin pickup, damage thud, game over arpeggio, and restart
- **Sound Control:** Muted by default; toggleable via the HUD button with visual state indicators
- **Responsive Touch D-Pad:** Continuous hold and diagonal movement support on mobile and touch devices
- **Canvas Visual Animations:** Pulsing golden coin glow, floating `+1` score popups, and menacing enemy core
- **Accessibility & Design:** Responsive canvas scaling (`aspect-ratio: 16/9`), keyboard focus rings (`:focus-visible`), and `prefers-reduced-motion` compliance
- **Zero Dependencies:** Pure vanilla web standards (HTML5 Canvas, CSS3, Web Audio API)

## Phase 8: Professional Arcade Edition
- **Arcade State Machine:** Seamless transitions between `START` (attract mode), `PLAYING`, `PAUSED`, and `GAMEOVER`.
- **Persistent High Score:** Stored via `localStorage` and displayed in the HUD ("BEST"). Celebratory glowing `🏆 NEW HIGH SCORE! 🏆` badge awarded upon beating personal best.
- **Dynamic Combo Multiplier System:** Fast coin collection within 2.5 seconds increases multiplier ($2\times, 3\times$). Floating combo feedback pops up in neon green.
- **Pitch-Scaling Audio:** Retro coin chime ascends up the pentatonic scale with consecutive combo streaks.
- **Juicy Screen Shake:** Dynamic camera shake that triggers on coin collection (subtle), taking damage (medium), and defeat (heavy).
- **Dual Particle Systems:** Radial golden coin sparkles on pickup and blue/white shattered sparks on damage.
- **Directional Animated Player Eyes:** Player character features animated pupils that glance in the direction of movement.
- **Dynamic Difficulty:** Enemy patrol speed smoothly increases as the score climbs.
- **Pause Menu:** Full pause/resume system toggled via <kbd>ESC</kbd>, <kbd>P</kbd>, or the HUD Pause button.
- **Ambient Cosmic Starfield:** 35 twinkling stars in the canvas background.

## Controls
- **Movement:** Arrow Keys (`↑`, `↓`, `←`, `→`) or `W`, `A`, `S`, `D`
- **Pause / Resume:** <kbd>ESC</kbd> or <kbd>P</kbd>
- **Audio Toggle:** Sound button in HUD
- **Mobile / Touch:** On-screen 4-way D-Pad

## How to Run
Open `index.html` in any modern web browser.

