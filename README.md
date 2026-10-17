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

## How to Run
Open `index.html` in any modern web browser.
