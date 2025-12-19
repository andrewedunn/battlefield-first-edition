# Claude Code Instructions

This is a kid-friendly game project. Keep it fun and silly - no realistic violence or blood.

## Tech Overview

- **Framework**: Phaser 3 (loaded via CDN, no npm/build required)
- **Sprites**: All generated programmatically in `BootScene.js` using Phaser Graphics API
- **Sounds**: Generated with Web Audio API in `SoundGenerator.js`
- **No external assets**: Everything is code-generated

## Key Files

- `js/scenes/BootScene.js` - Creates all sprites (soldiers, terrain, projectiles, power-ups)
- `js/scenes/GameScene.js` - Main game logic (movement, combat, AI, terrain effects)
- `js/scenes/CityLifeScene.js` - Level 2: City Life (extends GameScene with city terrain, rats, roadkill)
- `js/scenes/LevelSelectScene.js` - Level selection menu
- `js/SoundGenerator.js` - Procedural sound effects for weapons and events
- `js/main.js` - Phaser configuration

## Game Constants

- Grid: 28x18 tiles, 28px per tile
- Players: 15 per team
- Safe zones: Columns 0-2 (blue), 25-27 (red)
- Level 1 terrain types: 0=grass, 1=trench, 2=mountain, 3=mud, 4=bounce, 5=teleporter
- Level 2 terrain types: 6=vertical street, 7=building (elevated), 8=car (obstacle), 9=pothole (like trench), 10=sewer (rat spawn), 11=sidewalk, 12=park, 13=horizontal street

## AI Behavior

Located in `updateAI()` and `updateSingleAI()` in GameScene.js:
- AI must exit safe zone before shooting (can't shoot from safe zone)
- Targets enemies outside their safe zone
- Moves aggressively toward targets
- Update rate balanced for fair gameplay (250ms interval, 1-2 players per frame)

## Adding New Features

**New weapon**: Add to `weaponTypes` array in `createPlayers()`, create projectile sprite in `BootScene.createProjectileSprites()`, add sound in `SoundGenerator.createAllSounds()`

**New terrain**: Add type number to terrain system, create sprite in `BootScene.createSpecialTerrainSprites()`, add rendering in `drawBattlefield()`, add effect in `handleTerrainEffect()`

**New power-up**: Add type to `spawnPowerUp()`, create sprite in `BootScene.createPowerUpSprites()`, add effect in `collectPowerUp()`

## Level 2: City Life

City Life is the second level that unlocks after beating level 1. It features:

**Terrain:**
- Buildings: Standing on a building tile = elevated. Ground players can't shoot elevated players.
- Cars: Impassable obstacles (blocks movement and shots)
- Potholes: Same as trenches (shots pass over players inside)
- Sewers: Walkable tiles that spawn rats

**Progressive Hazards:**
- Roadkill: Spawns after 10 seconds on street tiles, slows movement like mud (every 5s)
- Rats: Spawn from sewers after 20 seconds, chase players, bite once (1 damage), return to sewer (every 4s)
- Rats avoid players in safe zones and can be shot (join pizza line when eliminated)

**Power-ups:** Pizza (health), hotdog (speed), coffee (rapid fire), traffic cone (shield)

**Death Animation:** Pizza line queue at pizzeria instead of conga line

**Level Progression:** Stored in localStorage as `levelsCompleted` array
