# supabangbang — Godot 4 Edition

This is the Godot 4 port of the original HTML5/JS Pang-style game.

## How to Open
1. Download and install [Godot 4](https://godotengine.org/)
2. Open Godot → Import Project → navigate to this `godot/` folder → select `project.godot`
3. Click **Edit** to open the editor
4. Press **F5** to play!

## Controls
- **Arrow Left / Right** — move player
- **Space** — shoot harpoon
- **Space** (on Game Over) — restart

## Structure
```
godot/
├── project.godot        # Godot project config
├── scenes/
│   ├── Main.tscn        # Main game scene
│   ├── Player.tscn      # Player scene
│   ├── Ball.tscn        # Ball scene (reused for splits)
│   └── Harpoon.tscn     # Harpoon scene
└── scripts/
    ├── Main.gd          # Game loop, score, lives, spawning
    ├── Player.gd        # Movement, invincibility
    ├── Ball.gd          # Physics, gravity, splitting
    └── Harpoon.gd       # Upward movement, collision
```

## Features
- Bouncing balls with gravity (split into 2 smaller ones when hit)
- Harpoon shooting
- 3 lives with 1.5s invincibility after hit
- Score system (smaller balls = more points)
- Game Over + Restart
- Levels (more balls each wave)
