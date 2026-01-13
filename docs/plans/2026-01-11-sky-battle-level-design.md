# Level 3: Sky Battle - Design Document

## Overview

Sky Battle is the third level of Battlefield First Edition. Players control goofy cartoon biplanes in a WWI-style dogfight set in the sky.

## Core Concept

**Theme:** Cartoon aerial combat with silly obstacles and hazards

**Player Sprites:** Goofy cartoon biplanes
- Two wings (biplane style) with visible spinning propeller
- Googly eyes on the nose
- Trailing scarf that flaps behind
- Blue team = blue planes, Red team = red planes
- Directional variants (left/right/up/down)

**Background:** Light blue sky with scattered white clouds. No visible grid lines - open sky feel.

**Safe Zones:** Cloud platforms on far left (blue) and far right (red).

## Terrain Types

| Type | Visual | Effect |
|------|--------|--------|
| Open sky | Light blue | Normal movement |
| Fluffy cloud | White puff | Decorative, no effect |
| Turbulence | Swirly wind lines | Random 1-tile displacement on entry |
| Hot air balloon | Colorful balloon | Impassable obstacle (blocks movement & shots) |
| Storm cloud | Dark gray cloud | Blocks shots (line of sight blocker) |

**Layout Concept:**
- Hot air balloons scattered in middle as cover
- Turbulence zones at key chokepoints
- Storm clouds creating tactical walls
- Open sky corridors for dogfighting

## Progressive Hazards

### UFO Abduction
- **Start time:** 15 seconds
- **Interval:** Every 8 seconds
- **Behavior:**
  1. UFO appears at random location
  2. Hovers 1 second with tractor beam visual
  3. Beams up random plane within 2-tile radius
  4. Plane frozen/invisible for 3 seconds
  5. Plane reappears at same location, briefly invulnerable
  6. UFO flies off screen
- **Max active:** 1 UFO at a time

### Bird Flock
- **Start time:** 25 seconds
- **Interval:** Every 6 seconds
- **Behavior:**
  1. Flock of 3-4 birds spawns from screen edge
  2. Flies in straight line across map
  3. Planes hit take 1 damage + knocked back 1 tile
  4. Flock disappears off other edge

## Power-ups

| Power-up | Sprite | Effect |
|----------|--------|--------|
| Fuel Can | Red/yellow jerry can | +1 health |
| Nitro Boost | Blue bottle with flames | Speed boost (8 sec) |
| Radar Dish | Small spinning radar | Rapid fire (8 sec) |
| Parachute | Folded chute pack | Shield (blocks 1 hit) |

Power-ups spawn on open sky tiles with gentle bob animation.

## Death Animation: Crash Pile

- Eliminated plane spirals downward with spin animation
- Lands in "crash pile" at bottom of screen (below play grid)
- Planes stack in silly jumbled pile, slightly overlapping
- Cartoon smoke puffs rise from pile
- Small "OOPS" sign next to wreckage

## Cheat Code

- **Code:** "ufo"
- **Trigger:** Type during Level 1 or Level 2
- **Effect:** Shows "BEAM ME UP!" message, skips to Level 3
- **Implementation:** Same pattern as "pizza" code for Level 2

## Level Progression

- Unlocks after completing Level 2
- Added to LevelSelectScene as "Level 3: Sky Battle"
- Completion saves to localStorage
- Chaos mode works same as other levels

## Technical Implementation

### New Scene
- `SkyBattleScene.js` extends `GameScene`
- Override terrain generation, drawing, hazards, power-ups

### New Sprites (BootScene.js)
- Biplane sprites (blue/red, 4 directions each)
- Hot air balloon
- Storm cloud
- Turbulence indicator
- UFO with tractor beam
- Bird flock
- Fuel can, nitro, radar, parachute power-ups
- Crash pile base + smoke

### New Sounds (SoundGenerator.js)
- Propeller hum
- Turbulence whoosh
- UFO beam
- Bird squawk
- Crash sound

## Level Title

"SKY BATTLE" in top corner (matching "CITY LIFE" style)
