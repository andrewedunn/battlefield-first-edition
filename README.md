# Battlefield First Edition

A fun, kid-friendly grid-based tactical game built with Phaser 3. Two teams battle it out with silly weapons on a battlefield filled with trenches, mountains, and special terrain.

## Play

Open `index.html` in a web browser - no build step required!

## Controls

- **Click** a blue player to select them
- **WASD** or **Arrow keys** to move
- **Spacebar** to shoot

## Features

- **Two teams**: 15 blue players (you) vs 15 red players (AI)
- **10 silly weapons**: Banana Blaster, Rubber Chicken, Pie Thrower, and more
- **Safe zones**: Home bases where you can't be attacked (but can't shoot from either)
- **Terrain types**:
  - Trenches - provide cover from shots fired outside
  - Mountains - block movement and projectiles
  - Mud puddles - slow movement
  - Bounce pads - launch you across the map
  - Teleporters - warp between paired portals
- **Power-ups**: Speed boost, Shield, Rapid fire, Health pack
- **Conga line**: Eliminated players dance around the battlefield

## Tech Stack

- [Phaser 3](https://phaser.io/) game framework (loaded via CDN)
- Vanilla JavaScript
- Programmatically generated sprites (no external assets)
- Web Audio API for sound effects

## Project Structure

```
battlefield-first-edition/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Game styling
└── js/
    ├── main.js         # Phaser game configuration
    ├── SoundGenerator.js # Web Audio sound effects
    └── scenes/
        ├── BootScene.js  # Asset generation
        └── GameScene.js  # Main gameplay logic
```

## License

MIT
