# Sky Battle (Level 3) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Level 3 "Sky Battle" - an aerial dogfight level with cartoon biplanes, sky terrain, UFO abductions, bird flocks, and aviation-themed power-ups.

**Architecture:** SkyBattleScene extends GameScene (same pattern as CityLifeScene). New sprites created in BootScene. New sounds added to SoundGenerator. Level unlocks after completing Level 2.

**Tech Stack:** Phaser 3, Web Audio API, vanilla JavaScript

---

## Task 1: Create Biplane Sprites

**Files:**
- Modify: `js/scenes/BootScene.js`

**Step 1: Add createSkyBattleSprites() call in create()**

In the `create()` method, add a call to the new sprite creation method after `createPizzeriaSprite()`:

```javascript
this.createSkyBattleSprites();
```

**Step 2: Create biplane sprites method**

Add this method after `createPizzeriaSprite()`:

```javascript
createSkyBattleSprites() {
    this.createBiplaneSprites();
    this.createSkyTerrainSprites();
    this.createSkyPowerUpSprites();
    this.createSkyHazardSprites();
    this.createCrashPileSprite();
}

createBiplaneSprites() {
    const teams = [
        { name: 'blue', bodyColor: 0x3498db, wingColor: 0x2980b9, scarfColor: 0xf39c12 },
        { name: 'red', bodyColor: 0xe74c3c, wingColor: 0xc0392b, scarfColor: 0xf1c40f }
    ];
    const directions = ['right', 'left', 'up', 'down'];

    for (const team of teams) {
        for (const dir of directions) {
            this.createBiplane(team, dir);
        }
    }
}

createBiplane(team, direction) {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const size = 28;
    const cx = size / 2;
    const cy = size / 2;

    if (direction === 'right') {
        // Fuselage
        g.fillStyle(team.bodyColor, 1);
        g.fillEllipse(cx, cy, 20, 8);
        // Top wing
        g.fillStyle(team.wingColor, 1);
        g.fillRect(6, 6, 16, 3);
        // Bottom wing
        g.fillRect(6, 19, 16, 3);
        // Wing struts
        g.fillStyle(0x8b4513, 1);
        g.fillRect(10, 9, 1, 10);
        g.fillRect(18, 9, 1, 10);
        // Propeller (spinning blur)
        g.fillStyle(0x4a4a4a, 1);
        g.fillEllipse(24, cy, 3, 8);
        // Tail
        g.fillStyle(team.wingColor, 1);
        g.fillRect(0, 10, 4, 8);
        // Googly eye
        g.fillStyle(0xffffff, 1);
        g.fillCircle(20, cy - 1, 3);
        g.fillStyle(0x000000, 1);
        g.fillCircle(21, cy - 1, 1.5);
        // Scarf trailing behind
        g.fillStyle(team.scarfColor, 1);
        g.fillRect(0, cy - 1, 6, 2);
        g.fillRect(-2, cy, 3, 2);
    } else if (direction === 'left') {
        // Fuselage
        g.fillStyle(team.bodyColor, 1);
        g.fillEllipse(cx, cy, 20, 8);
        // Top wing
        g.fillStyle(team.wingColor, 1);
        g.fillRect(6, 6, 16, 3);
        // Bottom wing
        g.fillRect(6, 19, 16, 3);
        // Wing struts
        g.fillStyle(0x8b4513, 1);
        g.fillRect(10, 9, 1, 10);
        g.fillRect(18, 9, 1, 10);
        // Propeller
        g.fillStyle(0x4a4a4a, 1);
        g.fillEllipse(4, cy, 3, 8);
        // Tail
        g.fillStyle(team.wingColor, 1);
        g.fillRect(24, 10, 4, 8);
        // Googly eye
        g.fillStyle(0xffffff, 1);
        g.fillCircle(8, cy - 1, 3);
        g.fillStyle(0x000000, 1);
        g.fillCircle(7, cy - 1, 1.5);
        // Scarf trailing behind
        g.fillStyle(team.scarfColor, 1);
        g.fillRect(22, cy - 1, 6, 2);
        g.fillRect(27, cy, 3, 2);
    } else if (direction === 'up') {
        // Top-down view flying up
        g.fillStyle(team.bodyColor, 1);
        g.fillEllipse(cx, cy, 8, 20);
        // Wings (horizontal)
        g.fillStyle(team.wingColor, 1);
        g.fillRect(2, 10, 24, 4);
        // Tail
        g.fillRect(10, 24, 8, 4);
        // Propeller
        g.fillStyle(0x4a4a4a, 1);
        g.fillEllipse(cx, 2, 8, 3);
        // Googly eye
        g.fillStyle(0xffffff, 1);
        g.fillCircle(cx, 8, 3);
        g.fillStyle(0x000000, 1);
        g.fillCircle(cx, 7, 1.5);
    } else if (direction === 'down') {
        // Top-down view flying down
        g.fillStyle(team.bodyColor, 1);
        g.fillEllipse(cx, cy, 8, 20);
        // Wings
        g.fillStyle(team.wingColor, 1);
        g.fillRect(2, 14, 24, 4);
        // Tail
        g.fillRect(10, 0, 8, 4);
        // Propeller
        g.fillStyle(0x4a4a4a, 1);
        g.fillEllipse(cx, 26, 8, 3);
        // Googly eye
        g.fillStyle(0xffffff, 1);
        g.fillCircle(cx, 20, 3);
        g.fillStyle(0x000000, 1);
        g.fillCircle(cx, 21, 1.5);
    }

    g.generateTexture(`biplane_${team.name}_${direction}`, size, size);
    g.destroy();
}
```

**Step 3: Verify**

Open game in browser, check browser console for errors. Sprites won't be visible yet but should generate without errors.

**Step 4: Commit**

```bash
git add js/scenes/BootScene.js
git commit -m "feat: add biplane sprites for Sky Battle level"
```

---

## Task 2: Create Sky Terrain Sprites

**Files:**
- Modify: `js/scenes/BootScene.js`

**Step 1: Add sky terrain sprite method**

Add after `createBiplaneSprites()` inside `createSkyBattleSprites()`:

```javascript
createSkyTerrainSprites() {
    const ts = this.tileSize;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Open sky tile - light blue gradient feel
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(0, 0, ts, ts);
    g.fillStyle(0x98d8f0, 0.5);
    g.fillRect(0, 0, ts, ts / 2);
    g.generateTexture('tile_sky', ts, ts);

    // Fluffy cloud - decorative
    g.clear();
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(0, 0, ts, ts);
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(ts / 2, ts / 2, 8);
    g.fillCircle(ts / 2 - 6, ts / 2 + 2, 5);
    g.fillCircle(ts / 2 + 6, ts / 2 + 2, 5);
    g.fillCircle(ts / 2 - 3, ts / 2 - 3, 4);
    g.fillCircle(ts / 2 + 4, ts / 2 - 2, 4);
    g.generateTexture('tile_cloud', ts, ts);

    // Turbulence zone - swirly wind lines
    g.clear();
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(0, 0, ts, ts);
    g.lineStyle(2, 0xb0c4de, 0.8);
    // Swirl 1
    g.beginPath();
    g.arc(ts / 2, ts / 2, 8, 0, Math.PI * 1.5);
    g.strokePath();
    // Swirl 2
    g.beginPath();
    g.arc(ts / 2, ts / 2, 5, Math.PI, Math.PI * 2.5);
    g.strokePath();
    // Wind lines
    g.lineStyle(1, 0x778899, 0.6);
    g.lineBetween(4, 8, 12, 6);
    g.lineBetween(16, 20, 24, 18);
    g.generateTexture('tile_turbulence', ts, ts);

    // Hot air balloon - obstacle
    g.clear();
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(0, 0, ts, ts);
    // Balloon envelope
    g.fillStyle(0xe74c3c, 1);
    g.fillCircle(ts / 2, 10, 10);
    g.fillStyle(0xf39c12, 1);
    g.fillTriangle(ts / 2, 8, ts / 2 - 8, 12, ts / 2 + 8, 12);
    g.fillStyle(0x3498db, 1);
    g.fillTriangle(ts / 2, 12, ts / 2 - 6, 18, ts / 2 + 6, 18);
    // Basket
    g.fillStyle(0x8b4513, 1);
    g.fillRect(ts / 2 - 4, 20, 8, 6);
    // Ropes
    g.lineStyle(1, 0x5d4037);
    g.lineBetween(ts / 2 - 4, 20, ts / 2 - 6, 18);
    g.lineBetween(ts / 2 + 4, 20, ts / 2 + 6, 18);
    g.generateTexture('tile_balloon', ts, ts);

    // Storm cloud - blocks line of sight
    g.clear();
    g.fillStyle(0x87ceeb, 1);
    g.fillRect(0, 0, ts, ts);
    g.fillStyle(0x4a4a4a, 1);
    g.fillCircle(ts / 2, ts / 2, 10);
    g.fillCircle(ts / 2 - 7, ts / 2 + 2, 6);
    g.fillCircle(ts / 2 + 7, ts / 2 + 2, 6);
    g.fillStyle(0x3d3d3d, 1);
    g.fillCircle(ts / 2, ts / 2 + 2, 6);
    // Lightning hint
    g.fillStyle(0xf1c40f, 0.8);
    g.fillTriangle(ts / 2, ts / 2 + 4, ts / 2 - 2, ts / 2 + 8, ts / 2 + 1, ts / 2 + 6);
    g.generateTexture('tile_storm', ts, ts);

    // Cloud platform (safe zone base)
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, ts, ts);
    g.fillStyle(0xecf0f1, 1);
    g.fillCircle(6, ts / 2, 8);
    g.fillCircle(ts / 2, ts / 2 - 2, 10);
    g.fillCircle(ts - 6, ts / 2, 8);
    g.fillStyle(0xf5f5f5, 1);
    g.fillRect(0, ts / 2, ts, ts / 2);
    g.generateTexture('tile_cloud_platform', ts, ts);

    g.destroy();
}
```

**Step 2: Verify**

Open game in browser, check console for errors.

**Step 3: Commit**

```bash
git add js/scenes/BootScene.js
git commit -m "feat: add sky terrain sprites (clouds, turbulence, balloon, storm)"
```

---

## Task 3: Create Sky Power-up Sprites

**Files:**
- Modify: `js/scenes/BootScene.js`

**Step 1: Add power-up sprite method**

Add after `createSkyTerrainSprites()`:

```javascript
createSkyPowerUpSprites() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const size = 24;

    // Fuel can - health restore
    g.fillStyle(0xe74c3c, 0.3);
    g.fillCircle(12, 12, 11);
    // Can body
    g.fillStyle(0xc0392b, 1);
    g.fillRect(6, 6, 12, 14);
    // Can top
    g.fillStyle(0x922b21, 1);
    g.fillRect(8, 4, 8, 3);
    // Handle
    g.fillStyle(0x7b241c, 1);
    g.fillRect(5, 8, 2, 6);
    // Spout
    g.fillRect(17, 6, 3, 4);
    // Label
    g.fillStyle(0xf1c40f, 1);
    g.fillRect(8, 10, 8, 6);
    g.generateTexture('powerup_fuel', size, size);

    // Nitro boost - speed
    g.clear();
    g.fillStyle(0x3498db, 0.3);
    g.fillCircle(12, 12, 11);
    // Bottle
    g.fillStyle(0x2980b9, 1);
    g.fillEllipse(12, 14, 10, 12);
    // Neck
    g.fillStyle(0x1a5276, 1);
    g.fillRect(10, 4, 4, 5);
    // Cap
    g.fillStyle(0x7f8c8d, 1);
    g.fillRect(9, 2, 6, 3);
    // Flames
    g.fillStyle(0xe74c3c, 1);
    g.fillTriangle(8, 20, 12, 14, 10, 22);
    g.fillStyle(0xf39c12, 1);
    g.fillTriangle(12, 20, 16, 14, 14, 22);
    g.fillStyle(0xf1c40f, 1);
    g.fillTriangle(10, 18, 14, 16, 12, 21);
    g.generateTexture('powerup_nitro', size, size);

    // Radar dish - rapid fire
    g.clear();
    g.fillStyle(0x9b59b6, 0.3);
    g.fillCircle(12, 12, 11);
    // Dish
    g.fillStyle(0xbdc3c7, 1);
    g.beginPath();
    g.arc(12, 14, 9, Math.PI, 0, false);
    g.fillPath();
    // Inner dish
    g.fillStyle(0x95a5a6, 1);
    g.beginPath();
    g.arc(12, 14, 6, Math.PI, 0, false);
    g.fillPath();
    // Stand
    g.fillStyle(0x7f8c8d, 1);
    g.fillRect(10, 14, 4, 6);
    // Base
    g.fillRect(6, 19, 12, 3);
    // Antenna
    g.fillStyle(0xe74c3c, 1);
    g.fillCircle(12, 10, 2);
    g.generateTexture('powerup_radar', size, size);

    // Parachute - shield
    g.clear();
    g.fillStyle(0x27ae60, 0.3);
    g.fillCircle(12, 12, 11);
    // Canopy
    g.fillStyle(0xe74c3c, 1);
    g.beginPath();
    g.arc(12, 10, 9, Math.PI, 0, false);
    g.fillPath();
    // Stripes
    g.fillStyle(0xffffff, 1);
    g.fillTriangle(6, 10, 9, 10, 7, 3);
    g.fillTriangle(12, 10, 15, 10, 13, 1);
    g.fillTriangle(18, 10, 15, 10, 17, 3);
    // Lines
    g.lineStyle(1, 0x5d4037);
    g.lineBetween(5, 10, 10, 20);
    g.lineBetween(12, 10, 12, 18);
    g.lineBetween(19, 10, 14, 20);
    // Pack
    g.fillStyle(0x8b4513, 1);
    g.fillRect(9, 18, 6, 4);
    g.generateTexture('powerup_parachute', size, size);

    g.destroy();
}
```

**Step 2: Verify**

Open game, check console.

**Step 3: Commit**

```bash
git add js/scenes/BootScene.js
git commit -m "feat: add sky power-up sprites (fuel, nitro, radar, parachute)"
```

---

## Task 4: Create Sky Hazard Sprites (UFO, Birds)

**Files:**
- Modify: `js/scenes/BootScene.js`

**Step 1: Add hazard sprite method**

Add after `createSkyPowerUpSprites()`:

```javascript
createSkyHazardSprites() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // UFO with tractor beam
    // UFO body
    g.fillStyle(0xbdc3c7, 1);
    g.fillEllipse(20, 12, 28, 10);
    // Dome
    g.fillStyle(0x85c1e9, 0.8);
    g.beginPath();
    g.arc(20, 10, 10, Math.PI, 0, false);
    g.fillPath();
    // Lights
    g.fillStyle(0x2ecc71, 1);
    g.fillCircle(10, 14, 2);
    g.fillStyle(0xe74c3c, 1);
    g.fillCircle(20, 16, 2);
    g.fillStyle(0xf1c40f, 1);
    g.fillCircle(30, 14, 2);
    g.generateTexture('ufo', 40, 24);

    // Tractor beam (separate sprite for animation)
    g.clear();
    g.fillStyle(0x2ecc71, 0.3);
    g.beginPath();
    g.moveTo(10, 0);
    g.lineTo(30, 0);
    g.lineTo(40, 60);
    g.lineTo(0, 60);
    g.closePath();
    g.fillPath();
    g.lineStyle(2, 0x2ecc71, 0.6);
    g.strokePath();
    g.generateTexture('tractor_beam', 40, 60);

    // Bird (seagull) facing right
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(12, 10, 16, 8); // Body
    g.fillStyle(0xecf0f1, 1);
    // Wings up position
    g.beginPath();
    g.moveTo(8, 10);
    g.lineTo(0, 2);
    g.lineTo(16, 8);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(16, 10);
    g.lineTo(24, 2);
    g.lineTo(8, 8);
    g.closePath();
    g.fillPath();
    // Head
    g.fillStyle(0xffffff, 1);
    g.fillCircle(20, 8, 4);
    // Beak
    g.fillStyle(0xf39c12, 1);
    g.fillTriangle(24, 8, 28, 9, 24, 10);
    // Eye
    g.fillStyle(0x000000, 1);
    g.fillCircle(21, 7, 1);
    g.generateTexture('bird_right', 28, 16);

    // Bird facing left
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(16, 10, 16, 8);
    g.fillStyle(0xecf0f1, 1);
    g.beginPath();
    g.moveTo(20, 10);
    g.lineTo(28, 2);
    g.lineTo(12, 8);
    g.closePath();
    g.fillPath();
    g.beginPath();
    g.moveTo(12, 10);
    g.lineTo(4, 2);
    g.lineTo(20, 8);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 4);
    g.fillStyle(0xf39c12, 1);
    g.fillTriangle(4, 8, 0, 9, 4, 10);
    g.fillStyle(0x000000, 1);
    g.fillCircle(7, 7, 1);
    g.generateTexture('bird_left', 28, 16);

    g.destroy();
}
```

**Step 2: Verify**

Open game, check console.

**Step 3: Commit**

```bash
git add js/scenes/BootScene.js
git commit -m "feat: add UFO and bird sprites for sky hazards"
```

---

## Task 5: Create Crash Pile Sprite

**Files:**
- Modify: `js/scenes/BootScene.js`

**Step 1: Add crash pile sprite method**

Add after `createSkyHazardSprites()`:

```javascript
createCrashPileSprite() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Crash pile base (ground)
    const width = 100;
    const height = 40;

    // Ground
    g.fillStyle(0x27ae60, 1);
    g.fillRect(0, height - 10, width, 10);

    // Wreckage pile shape
    g.fillStyle(0x7f8c8d, 1);
    g.fillEllipse(width / 2, height - 15, 80, 20);
    g.fillStyle(0x95a5a6, 1);
    g.fillEllipse(width / 2 - 10, height - 18, 40, 12);
    g.fillEllipse(width / 2 + 15, height - 20, 30, 10);

    // Random debris colors
    g.fillStyle(0xe74c3c, 0.8);
    g.fillRect(20, height - 25, 8, 6);
    g.fillStyle(0x3498db, 0.8);
    g.fillRect(50, height - 22, 10, 5);
    g.fillStyle(0xf39c12, 0.8);
    g.fillRect(70, height - 20, 6, 4);

    // Broken propeller
    g.fillStyle(0x4a4a4a, 1);
    g.fillRect(35, height - 30, 3, 12);

    // Smoke puffs will be separate animated sprites
    g.generateTexture('crash_pile_base', width, height);

    // Smoke puff sprite
    g.clear();
    g.fillStyle(0x7f8c8d, 0.6);
    g.fillCircle(10, 10, 8);
    g.fillCircle(6, 8, 5);
    g.fillCircle(14, 7, 5);
    g.fillStyle(0x95a5a6, 0.4);
    g.fillCircle(10, 8, 5);
    g.generateTexture('smoke_puff', 20, 18);

    // "OOPS" sign
    g.clear();
    // Sign post
    g.fillStyle(0x8b4513, 1);
    g.fillRect(3, 10, 4, 20);
    // Sign board
    g.fillStyle(0xf1c40f, 1);
    g.fillRect(0, 0, 40, 14);
    g.fillStyle(0x000000, 1);
    g.lineStyle(2, 0x000000);
    g.strokeRect(0, 0, 40, 14);
    g.generateTexture('oops_sign', 40, 30);

    g.destroy();
}
```

**Step 2: Verify**

Open game, check console.

**Step 3: Commit**

```bash
git add js/scenes/BootScene.js
git commit -m "feat: add crash pile and smoke sprites"
```

---

## Task 6: Add Sky Battle Sounds

**Files:**
- Modify: `js/SoundGenerator.js`

**Step 1: Add new sound methods**

Add these methods after `playRatSqueak()`:

```javascript
playPropeller() {
    // Propeller hum - low frequency buzz
    if (!this.enabled || !this.audioContext) return;
    this.resumeContext();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, this.audioContext.currentTime);
    osc.frequency.setValueAtTime(100, this.audioContext.currentTime + 0.05);
    osc.frequency.setValueAtTime(80, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
}

playTurbulence() {
    // Whoosh sound - filtered noise sweep
    if (!this.enabled || !this.audioContext) return;
    this.resumeContext();

    const duration = 0.3;
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        const envelope = Math.sin((i / bufferSize) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
    }

    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();

    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, this.audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, this.audioContext.currentTime + duration);
    filter.Q.value = 2;

    source.connect(filter);
    filter.connect(this.audioContext.destination);

    source.start();
}

playUfoBeam() {
    // UFO tractor beam - sci-fi warble
    if (!this.enabled || !this.audioContext) return;
    this.resumeContext();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();

    lfo.frequency.value = 8;
    lfoGain.gain.value = 100;

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.5);

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    lfo.start();
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
    lfo.stop(this.audioContext.currentTime + 0.5);
}

playBirdSquawk() {
    // Bird squawk - high pitched chirp
    if (!this.enabled || !this.audioContext) return;
    this.resumeContext();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1500, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.05);
    osc.frequency.exponentialRampToValueAtTime(1400, this.audioContext.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.15);

    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
}

playCrash() {
    // Crash sound - noise burst with low thump
    if (!this.enabled || !this.audioContext) return;
    this.resumeContext();

    // Low thump
    const osc = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.2);

    oscGain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    osc.connect(oscGain);
    oscGain.connect(this.audioContext.destination);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);

    // Crash noise
    const duration = 0.25;
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.3;
    }

    const source = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();

    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    source.connect(filter);
    filter.connect(this.audioContext.destination);

    source.start();
}
```

**Step 2: Verify**

Open game, check console.

**Step 3: Commit**

```bash
git add js/SoundGenerator.js
git commit -m "feat: add sky battle sounds (propeller, turbulence, UFO, bird, crash)"
```

---

## Task 7: Create SkyBattleScene - Part 1 (Basic Structure)

**Files:**
- Create: `js/scenes/SkyBattleScene.js`

**Step 1: Create the scene file with basic structure**

```javascript
// ABOUTME: Sky Battle level scene - third level with aerial combat theme
// ABOUTME: Features biplanes, turbulence zones, UFO abductions, bird flocks, and crash pile

class SkyBattleScene extends GameScene {
    constructor() {
        super('SkyBattleScene');
    }

    init(data) {
        super.init(data);
        this.currentLevel = 3;
        this.levelName = 'Sky Battle';

        // Sky-specific timing for hazards
        this.ufoStartTime = 15000;      // 15 seconds
        this.birdStartTime = 25000;     // 25 seconds
        this.ufoSpawnInterval = 8000;   // Every 8 seconds
        this.birdSpawnInterval = 6000;  // Every 6 seconds

        // Sky-specific state
        this.activeUfo = null;
        this.birdFlocks = [];
        this.crashPile = [];
        this.lastUfoSpawn = 0;
        this.lastBirdSpawn = 0;
        this.gameStartTime = 0;
        this.abductedPlayer = null;

        // Crash pile location (bottom center)
        this.crashPileX = this.gridWidth * this.tileSize / 2;
        this.crashPileY = this.gridHeight * this.tileSize + 20;
    }

    create() {
        soundGenerator.init();
        this.gameStartTime = this.time.now;

        this.generateTerrain();
        this.drawBattlefield();
        this.drawCrashPile();
        this.createPlayers();
        this.setupInput();

        // Level title
        this.add.text(5, 5, 'SKY BATTLE', {
            fontSize: '12px',
            fill: '#87ceeb',
            fontFamily: 'Comic Sans MS',
            stroke: '#000',
            strokeThickness: 2
        });
    }

    generateTerrain() {
        // Initialize all as open sky (type 14)
        for (let y = 0; y < this.gridHeight; y++) {
            this.terrainMap[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.terrainMap[y][x] = 14; // Open sky
            }
        }

        // Cloud platform safe zones
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x <= 2; x++) {
                this.terrainMap[y][x] = 18; // Cloud platform (blue safe)
            }
            for (let x = 25; x <= 27; x++) {
                this.terrainMap[y][x] = 18; // Cloud platform (red safe)
            }
        }

        // Fluffy clouds (decorative, type 15)
        const cloudPositions = [
            { x: 5, y: 3 }, { x: 12, y: 2 }, { x: 20, y: 4 },
            { x: 7, y: 8 }, { x: 15, y: 10 }, { x: 22, y: 7 },
            { x: 6, y: 14 }, { x: 14, y: 16 }, { x: 21, y: 13 }
        ];
        for (const pos of cloudPositions) {
            if (pos.x > 2 && pos.x < 25) {
                this.terrainMap[pos.y][pos.x] = 15;
            }
        }

        // Turbulence zones (type 16)
        const turbulencePositions = [
            { x: 8, y: 5 }, { x: 19, y: 6 },
            { x: 10, y: 11 }, { x: 17, y: 12 },
            { x: 9, y: 15 }, { x: 18, y: 14 }
        ];
        for (const pos of turbulencePositions) {
            this.terrainMap[pos.y][pos.x] = 16;
        }

        // Hot air balloons - obstacles (type 17)
        const balloonPositions = [
            { x: 7, y: 2 }, { x: 20, y: 3 },
            { x: 11, y: 8 }, { x: 16, y: 9 },
            { x: 8, y: 13 }, { x: 19, y: 15 }
        ];
        for (const pos of balloonPositions) {
            this.terrainMap[pos.y][pos.x] = 17;
        }

        // Storm clouds - block shots (type 19)
        const stormPositions = [
            { x: 10, y: 4 }, { x: 17, y: 5 },
            { x: 13, y: 9 }, { x: 14, y: 9 },
            { x: 11, y: 14 }, { x: 16, y: 15 }
        ];
        for (const pos of stormPositions) {
            this.terrainMap[pos.y][pos.x] = 19;
        }
    }

    drawBattlefield() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const pixelX = x * this.tileSize;
                const pixelY = y * this.tileSize;

                let tileKey = 'tile_sky';
                const terrain = this.terrainMap[y][x];
                if (terrain === 15) {
                    tileKey = 'tile_cloud';
                } else if (terrain === 16) {
                    tileKey = 'tile_turbulence';
                } else if (terrain === 17) {
                    tileKey = 'tile_balloon';
                } else if (terrain === 18) {
                    tileKey = 'tile_cloud_platform';
                } else if (terrain === 19) {
                    tileKey = 'tile_storm';
                }

                this.add.image(pixelX + this.tileSize / 2, pixelY + this.tileSize / 2, tileKey);

                // Safe zone overlays
                if (x >= this.blueSafeZone.startX && x <= this.blueSafeZone.endX) {
                    this.add.image(pixelX + this.tileSize / 2, pixelY + this.tileSize / 2, 'safe_blue');
                }
                if (x >= this.redSafeZone.startX && x <= this.redSafeZone.endX) {
                    this.add.image(pixelX + this.tileSize / 2, pixelY + this.tileSize / 2, 'safe_red');
                }
            }
        }
    }

    drawCrashPile() {
        // Draw crash pile base
        this.add.image(this.crashPileX, this.crashPileY, 'crash_pile_base').setOrigin(0.5, 0.5);

        // Add OOPS sign
        this.add.image(this.crashPileX + 60, this.crashPileY - 5, 'oops_sign').setOrigin(0.5, 1);

        // Create recurring smoke animation
        this.time.addEvent({
            delay: 800,
            callback: () => this.spawnSmokePuff(),
            loop: true
        });
    }

    spawnSmokePuff() {
        const offsetX = Phaser.Math.Between(-30, 30);
        const smoke = this.add.image(this.crashPileX + offsetX, this.crashPileY - 15, 'smoke_puff');
        smoke.setAlpha(0.7);
        smoke.setScale(0.5);

        this.tweens.add({
            targets: smoke,
            y: smoke.y - 40,
            alpha: 0,
            scale: 1.2,
            duration: 1500,
            onComplete: () => smoke.destroy()
        });
    }

    // Override to use biplane sprites
    createPlayerSprite(team, direction) {
        return `biplane_${team}_${direction}`;
    }

    update(time, delta) {
        this.handleInput(time);
        if (this.chaosMode) {
            this.updateChaosAI(time);
        } else {
            this.updateAI(time);
        }
        this.updateProjectiles(delta);
        this.updateCrashPile(time);
        this.updatePowerUps(time);
        this.updatePowerUpEffects(time);

        // Sky hazards
        this.updateUfo(time);
        this.updateBirdFlocks(time, delta);
    }
}
```

**Step 2: Verify**

Check the file is created correctly.

**Step 3: Commit**

```bash
git add js/scenes/SkyBattleScene.js
git commit -m "feat: add SkyBattleScene basic structure and terrain"
```

---

## Task 8: SkyBattleScene - Part 2 (Movement & Projectiles)

**Files:**
- Modify: `js/scenes/SkyBattleScene.js`

**Step 1: Add movement override with turbulence effect**

Add after `update()` method:

```javascript
// Override movement to handle balloons (impassable) and turbulence
movePlayer(player, dx, dy) {
    const newGridX = player.gridX + dx;
    const newGridY = player.gridY + dy;

    // Check bounds
    if (newGridX < 0 || newGridX >= this.gridWidth || newGridY < 0 || newGridY >= this.gridHeight) {
        return false;
    }

    // Check enemy safe zone
    if (player.team === 'blue' && newGridX >= this.redSafeZone.startX && newGridX <= this.redSafeZone.endX) {
        return false;
    }
    if (player.team === 'red' && newGridX >= this.blueSafeZone.startX && newGridX <= this.blueSafeZone.endX) {
        return false;
    }

    // Check balloon (impassable)
    if (this.terrainMap[newGridY][newGridX] === 17) {
        return false;
    }

    // Check other players
    for (const other of this.players) {
        if (other !== player && other.isAlive && other.gridX === newGridX && other.gridY === newGridY) {
            return false;
        }
    }

    // Update direction
    if (dx === 1) player.direction = 'right';
    else if (dx === -1) player.direction = 'left';
    else if (dy === -1) player.direction = 'up';
    else if (dy === 1) player.direction = 'down';

    this.updatePlayerSprite(player);
    this.updateArrowDirection(player);

    player.isMoving = true;
    player.gridX = newGridX;
    player.gridY = newGridY;

    const newPixelX = newGridX * this.tileSize + this.tileSize / 2;
    const newPixelY = newGridY * this.tileSize + this.tileSize / 2;

    const moveDuration = 80;

    this.tweens.add({
        targets: [player.sprite, player.selectionRing],
        x: newPixelX,
        y: newPixelY,
        duration: moveDuration,
        ease: 'Linear',
        onComplete: () => {
            player.isMoving = false;
            // Check turbulence after movement completes
            if (this.terrainMap[newGridY][newGridX] === 16) {
                this.applyTurbulence(player);
            }
        }
    });

    this.tweens.add({
        targets: player.arrow,
        x: newPixelX,
        y: newPixelY - 16,
        duration: moveDuration,
        ease: 'Linear'
    });

    for (let h = 0; h < player.hearts.length; h++) {
        this.tweens.add({
            targets: player.hearts[h],
            x: newPixelX - 8 + h * 8,
            y: newPixelY - 20,
            duration: moveDuration,
            ease: 'Linear'
        });
    }

    return true;
}

applyTurbulence(player) {
    soundGenerator.playTurbulence();

    // Random displacement
    const directions = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
    ];
    const randomDir = directions[Math.floor(Math.random() * directions.length)];

    const newX = player.gridX + randomDir.dx;
    const newY = player.gridY + randomDir.dy;

    // Check if valid displacement
    if (newX < 0 || newX >= this.gridWidth || newY < 0 || newY >= this.gridHeight) {
        return;
    }
    if (this.terrainMap[newY][newX] === 17) { // Balloon
        return;
    }
    // Check enemy safe zones
    if (player.team === 'blue' && newX >= this.redSafeZone.startX && newX <= this.redSafeZone.endX) {
        return;
    }
    if (player.team === 'red' && newX >= this.blueSafeZone.startX && newX <= this.blueSafeZone.endX) {
        return;
    }

    // Show turbulence effect
    const turbText = this.add.text(player.sprite.x, player.sprite.y - 20, 'WHOOSH!', {
        fontSize: '10px', fill: '#b0c4de', fontFamily: 'Comic Sans MS', stroke: '#000', strokeThickness: 1
    }).setOrigin(0.5);

    this.tweens.add({
        targets: turbText,
        y: turbText.y - 20,
        alpha: 0,
        duration: 400,
        onComplete: () => turbText.destroy()
    });

    // Apply displacement
    player.gridX = newX;
    player.gridY = newY;

    const newPixelX = newX * this.tileSize + this.tileSize / 2;
    const newPixelY = newY * this.tileSize + this.tileSize / 2;

    this.tweens.add({
        targets: [player.sprite, player.selectionRing],
        x: newPixelX,
        y: newPixelY,
        duration: 100,
        ease: 'Back.easeOut'
    });

    this.tweens.add({
        targets: player.arrow,
        x: newPixelX,
        y: newPixelY - 16,
        duration: 100
    });

    for (let h = 0; h < player.hearts.length; h++) {
        this.tweens.add({
            targets: player.hearts[h],
            x: newPixelX - 8 + h * 8,
            y: newPixelY - 20,
            duration: 100
        });
    }
}

// Override tryMovePlayer for AI
tryMovePlayer(player, dx, dy) {
    const newGridX = player.gridX + dx;
    const newGridY = player.gridY + dy;

    if (newGridX < 0 || newGridX >= this.gridWidth || newGridY < 0 || newGridY >= this.gridHeight) {
        return false;
    }

    if (player.team === 'blue' && newGridX >= this.redSafeZone.startX && newGridX <= this.redSafeZone.endX) {
        return false;
    }
    if (player.team === 'red' && newGridX >= this.blueSafeZone.startX && newGridX <= this.blueSafeZone.endX) {
        return false;
    }

    // Check balloon (impassable)
    if (this.terrainMap[newGridY][newGridX] === 17) {
        return false;
    }

    for (const other of this.players) {
        if (other !== player && other.isAlive && other.gridX === newGridX && other.gridY === newGridY) {
            return false;
        }
    }

    return this.movePlayer(player, dx, dy);
}

// Override projectile collision for storm clouds blocking shots
updateProjectiles(delta) {
    const deltaSeconds = delta / 1000;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const proj = this.projectiles[i];
        if (!proj.active) continue;

        proj.sprite.x += proj.velocityX * deltaSeconds;
        proj.sprite.y += proj.velocityY * deltaSeconds;

        const gridX = Math.floor(proj.sprite.x / this.tileSize);
        const gridY = Math.floor(proj.sprite.y / this.tileSize);

        // Check bounds
        if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
            proj.sprite.destroy();
            proj.active = false;
            continue;
        }

        // Check balloon collision (blocks shots)
        if (this.terrainMap[gridY] && this.terrainMap[gridY][gridX] === 17) {
            this.createHitEffect(proj.sprite.x, proj.sprite.y);
            proj.sprite.destroy();
            proj.active = false;
            continue;
        }

        // Check storm cloud collision (blocks shots)
        if (this.terrainMap[gridY] && this.terrainMap[gridY][gridX] === 19) {
            this.createHitEffect(proj.sprite.x, proj.sprite.y);
            proj.sprite.destroy();
            proj.active = false;
            continue;
        }

        // Check safe zones
        if (proj.team === 'blue' && gridX >= this.redSafeZone.startX && gridX <= this.redSafeZone.endX) {
            proj.sprite.destroy();
            proj.active = false;
            continue;
        }
        if (proj.team === 'red' && gridX >= this.blueSafeZone.startX && gridX <= this.blueSafeZone.endX) {
            proj.sprite.destroy();
            proj.active = false;
            continue;
        }

        // Check bird flock collision
        for (let f = this.birdFlocks.length - 1; f >= 0; f--) {
            const flock = this.birdFlocks[f];
            if (!flock.active) continue;

            for (const bird of flock.birds) {
                const dist = Phaser.Math.Distance.Between(proj.sprite.x, proj.sprite.y, bird.x, bird.y);
                if (dist < 14) {
                    // Bird hit! Flock disperses
                    this.disperseFlock(flock);
                    this.createHitEffect(proj.sprite.x, proj.sprite.y);
                    proj.sprite.destroy();
                    proj.active = false;
                    break;
                }
            }
            if (!proj.active) break;
        }
        if (!proj.active) continue;

        // Check player collision
        for (const player of this.players) {
            if (!player.isAlive) continue;
            if (player.team === proj.team) continue;
            if (player.isAbducted) continue; // Can't hit abducted players

            const playerPixelX = player.gridX * this.tileSize + this.tileSize / 2;
            const playerPixelY = player.gridY * this.tileSize + this.tileSize / 2;

            const dist = Phaser.Math.Distance.Between(proj.sprite.x, proj.sprite.y, playerPixelX, playerPixelY);

            if (dist < 14) {
                this.damagePlayer(player, proj.damage);
                this.createHitEffect(proj.sprite.x, proj.sprite.y);
                proj.sprite.destroy();
                proj.active = false;
                break;
            }
        }
    }

    this.projectiles = this.projectiles.filter(p => p.active);
}
```

**Step 2: Verify file**

**Step 3: Commit**

```bash
git add js/scenes/SkyBattleScene.js
git commit -m "feat: add movement with turbulence and projectile collision for sky battle"
```

---

## Task 9: SkyBattleScene - Part 3 (UFO Hazard)

**Files:**
- Modify: `js/scenes/SkyBattleScene.js`

**Step 1: Add UFO hazard methods**

Add after `updateProjectiles()`:

```javascript
updateUfo(time) {
    const elapsed = time - this.gameStartTime;
    if (elapsed < this.ufoStartTime) return;

    // Handle active abduction
    if (this.activeUfo && this.activeUfo.state === 'abducting') {
        return; // Wait for abduction to complete
    }

    // Spawn new UFO
    if (!this.activeUfo && time > this.lastUfoSpawn + this.ufoSpawnInterval) {
        this.spawnUfo();
        this.lastUfoSpawn = time;
    }
}

spawnUfo() {
    // Find a random position in the play area
    const gridX = Phaser.Math.Between(4, 23);
    const gridY = Phaser.Math.Between(2, 15);
    const pixelX = gridX * this.tileSize + this.tileSize / 2;
    const pixelY = gridY * this.tileSize + this.tileSize / 2;

    const ufoSprite = this.add.sprite(pixelX, pixelY - 50, 'ufo');
    ufoSprite.setScale(0.8);
    ufoSprite.setAlpha(0);

    this.activeUfo = {
        sprite: ufoSprite,
        gridX: gridX,
        gridY: gridY,
        state: 'arriving',
        beam: null
    };

    // Arrive animation
    this.tweens.add({
        targets: ufoSprite,
        y: pixelY - 20,
        alpha: 1,
        duration: 500,
        ease: 'Back.easeOut',
        onComplete: () => {
            this.startAbduction();
        }
    });
}

startAbduction() {
    if (!this.activeUfo) return;

    soundGenerator.playUfoBeam();
    this.activeUfo.state = 'abducting';

    const pixelX = this.activeUfo.gridX * this.tileSize + this.tileSize / 2;
    const pixelY = this.activeUfo.gridY * this.tileSize + this.tileSize / 2;

    // Create tractor beam
    const beam = this.add.sprite(pixelX, pixelY, 'tractor_beam');
    beam.setOrigin(0.5, 0);
    beam.setAlpha(0);
    this.activeUfo.beam = beam;

    // Beam animation
    this.tweens.add({
        targets: beam,
        alpha: 0.8,
        duration: 300,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
            this.attemptAbduction();
        }
    });
}

attemptAbduction() {
    if (!this.activeUfo) return;

    // Find players within 2 tiles
    const nearbyPlayers = [];
    for (const player of this.players) {
        if (!player.isAlive || player.isAbducted) continue;
        const dist = Math.abs(player.gridX - this.activeUfo.gridX) + Math.abs(player.gridY - this.activeUfo.gridY);
        if (dist <= 2) {
            nearbyPlayers.push(player);
        }
    }

    if (nearbyPlayers.length > 0) {
        // Abduct random nearby player
        const victim = nearbyPlayers[Math.floor(Math.random() * nearbyPlayers.length)];
        this.abductPlayer(victim);
    } else {
        // No one to abduct, leave
        this.ufoLeave();
    }
}

abductPlayer(player) {
    player.isAbducted = true;
    this.abductedPlayer = player;

    // Hide player
    player.sprite.setVisible(false);
    player.arrow.setVisible(false);
    player.selectionRing.setVisible(false);
    for (const heart of player.hearts) {
        heart.setVisible(false);
    }

    // Show abduction text
    const abductText = this.add.text(player.sprite.x, player.sprite.y, 'ABDUCTED!', {
        fontSize: '12px', fill: '#2ecc71', fontFamily: 'Comic Sans MS', stroke: '#000', strokeThickness: 2
    }).setOrigin(0.5);

    this.tweens.add({
        targets: abductText,
        y: abductText.y - 30,
        alpha: 0,
        duration: 800,
        onComplete: () => abductText.destroy()
    });

    // UFO leaves with player, returns them after 3 seconds
    this.time.delayedCall(1000, () => {
        this.ufoLeave();
    });

    this.time.delayedCall(3000, () => {
        this.returnAbductedPlayer(player);
    });
}

ufoLeave() {
    if (!this.activeUfo) return;

    // Destroy beam
    if (this.activeUfo.beam) {
        this.activeUfo.beam.destroy();
    }

    // UFO flies away
    this.tweens.add({
        targets: this.activeUfo.sprite,
        x: this.activeUfo.sprite.x + 200,
        y: -50,
        alpha: 0,
        duration: 800,
        ease: 'Quad.easeIn',
        onComplete: () => {
            if (this.activeUfo) {
                this.activeUfo.sprite.destroy();
                this.activeUfo = null;
            }
        }
    });
}

returnAbductedPlayer(player) {
    if (!player.isAlive) return;

    player.isAbducted = false;
    this.abductedPlayer = null;

    // Show player again
    player.sprite.setVisible(true);
    player.arrow.setVisible(true);
    if (player === this.selectedPlayer) {
        player.selectionRing.setVisible(true);
    }
    for (const heart of player.hearts) {
        heart.setVisible(true);
    }

    // Brief invulnerability flash
    this.tweens.add({
        targets: player.sprite,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 5
    });

    // Show return text
    const returnText = this.add.text(player.sprite.x, player.sprite.y - 20, 'RETURNED!', {
        fontSize: '10px', fill: '#3498db', fontFamily: 'Comic Sans MS', stroke: '#000', strokeThickness: 1
    }).setOrigin(0.5);

    this.tweens.add({
        targets: returnText,
        y: returnText.y - 20,
        alpha: 0,
        duration: 500,
        onComplete: () => returnText.destroy()
    });
}
```

**Step 2: Verify**

**Step 3: Commit**

```bash
git add js/scenes/SkyBattleScene.js
git commit -m "feat: add UFO abduction hazard system"
```

---

## Task 10: SkyBattleScene - Part 4 (Bird Flocks)

**Files:**
- Modify: `js/scenes/SkyBattleScene.js`

**Step 1: Add bird flock methods**

Add after `returnAbductedPlayer()`:

```javascript
updateBirdFlocks(time, delta) {
    const elapsed = time - this.gameStartTime;
    if (elapsed < this.birdStartTime) return;

    // Spawn new flock
    if (time > this.lastBirdSpawn + this.birdSpawnInterval) {
        this.spawnBirdFlock();
        this.lastBirdSpawn = time;
    }

    // Update existing flocks
    const deltaSeconds = delta / 1000;
    for (let i = this.birdFlocks.length - 1; i >= 0; i--) {
        const flock = this.birdFlocks[i];
        if (!flock.active) continue;

        // Move flock
        for (const bird of flock.birds) {
            bird.x += flock.velocityX * deltaSeconds;
            bird.y += flock.velocityY * deltaSeconds;
        }

        // Check if flock is off screen
        const leaderX = flock.birds[0].x;
        if ((flock.velocityX > 0 && leaderX > this.gridWidth * this.tileSize + 50) ||
            (flock.velocityX < 0 && leaderX < -50)) {
            this.removeFlock(flock);
            continue;
        }

        // Check player collisions
        for (const player of this.players) {
            if (!player.isAlive || player.isAbducted) continue;

            const playerPixelX = player.gridX * this.tileSize + this.tileSize / 2;
            const playerPixelY = player.gridY * this.tileSize + this.tileSize / 2;

            for (const bird of flock.birds) {
                const dist = Phaser.Math.Distance.Between(bird.x, bird.y, playerPixelX, playerPixelY);
                if (dist < 20) {
                    this.birdHitPlayer(player, flock);
                    break;
                }
            }
        }
    }
}

spawnBirdFlock() {
    soundGenerator.playBirdSquawk();

    // Spawn from left or right edge
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -30 : this.gridWidth * this.tileSize + 30;
    const startY = Phaser.Math.Between(3, 15) * this.tileSize;
    const velocityX = fromLeft ? 150 : -150;
    const direction = fromLeft ? 'right' : 'left';

    const flock = {
        birds: [],
        velocityX: velocityX,
        velocityY: Phaser.Math.Between(-20, 20),
        active: true
    };

    // Create 3-4 birds in formation
    const birdCount = Phaser.Math.Between(3, 4);
    for (let i = 0; i < birdCount; i++) {
        const offsetX = fromLeft ? -i * 20 : i * 20;
        const offsetY = (i % 2 === 0 ? -1 : 1) * 8;

        const bird = this.add.sprite(startX + offsetX, startY + offsetY, `bird_${direction}`);
        bird.setScale(0.8);

        // Flapping animation
        this.tweens.add({
            targets: bird,
            y: bird.y + 5,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        flock.birds.push(bird);
    }

    this.birdFlocks.push(flock);
}

birdHitPlayer(player, flock) {
    soundGenerator.playBirdSquawk();

    // Damage player
    this.damagePlayer(player, 1);

    // Knockback
    const knockDir = flock.velocityX > 0 ? 1 : -1;
    const newX = player.gridX + knockDir;

    if (newX >= 0 && newX < this.gridWidth && this.terrainMap[player.gridY][newX] !== 17) {
        // Check safe zones
        const inEnemySafe = (player.team === 'blue' && newX >= this.redSafeZone.startX) ||
                           (player.team === 'red' && newX <= this.blueSafeZone.endX);
        if (!inEnemySafe) {
            player.gridX = newX;
            const newPixelX = newX * this.tileSize + this.tileSize / 2;

            this.tweens.add({
                targets: [player.sprite, player.selectionRing],
                x: newPixelX,
                duration: 100,
                ease: 'Back.easeOut'
            });
            this.tweens.add({
                targets: player.arrow,
                x: newPixelX,
                duration: 100
            });
            for (let h = 0; h < player.hearts.length; h++) {
                this.tweens.add({
                    targets: player.hearts[h],
                    x: newPixelX - 8 + h * 8,
                    duration: 100
                });
            }
        }
    }

    // Show hit text
    const hitText = this.add.text(player.sprite.x, player.sprite.y - 25, 'SQUAWK!', {
        fontSize: '10px', fill: '#f39c12', fontFamily: 'Comic Sans MS', stroke: '#000', strokeThickness: 1
    }).setOrigin(0.5);

    this.tweens.add({
        targets: hitText,
        y: hitText.y - 20,
        alpha: 0,
        duration: 400,
        onComplete: () => hitText.destroy()
    });

    // Disperse flock after hit
    this.disperseFlock(flock);
}

disperseFlock(flock) {
    flock.active = false;

    for (const bird of flock.birds) {
        // Birds scatter in random directions
        this.tweens.add({
            targets: bird,
            x: bird.x + Phaser.Math.Between(-100, 100),
            y: bird.y + Phaser.Math.Between(-80, -40),
            alpha: 0,
            scale: 0.3,
            duration: 400,
            onComplete: () => bird.destroy()
        });
    }
}

removeFlock(flock) {
    flock.active = false;
    for (const bird of flock.birds) {
        bird.destroy();
    }
}
```

**Step 2: Verify**

**Step 3: Commit**

```bash
git add js/scenes/SkyBattleScene.js
git commit -m "feat: add bird flock hazard system"
```

---

## Task 11: SkyBattleScene - Part 5 (Power-ups, Death, Game Over)

**Files:**
- Modify: `js/scenes/SkyBattleScene.js`

**Step 1: Add power-ups and death handling**

Add after `removeFlock()`:

```javascript
// Override power-up spawning with sky-themed power-ups
spawnPowerUp() {
    const validSpots = [];
    for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
            const terrain = this.terrainMap[y][x];
            // Spawn on open sky or cloud tiles only
            if (terrain !== 14 && terrain !== 15) continue;
            if (x >= this.blueSafeZone.startX && x <= this.blueSafeZone.endX) continue;
            if (x >= this.redSafeZone.startX && x <= this.redSafeZone.endX) continue;

            let occupied = false;
            for (const p of this.players) {
                if (p.isAlive && p.gridX === x && p.gridY === y) {
                    occupied = true;
                    break;
                }
            }
            for (const pu of this.powerUps) {
                if (pu.gridX === x && pu.gridY === y) {
                    occupied = true;
                    break;
                }
            }
            if (!occupied) validSpots.push({ x, y });
        }
    }

    if (validSpots.length === 0) return;

    const spot = validSpots[Math.floor(Math.random() * validSpots.length)];
    const types = ['fuel', 'nitro', 'radar', 'parachute'];
    const type = types[Math.floor(Math.random() * types.length)];

    const pixelX = spot.x * this.tileSize + this.tileSize / 2;
    const pixelY = spot.y * this.tileSize + this.tileSize / 2;

    const sprite = this.add.sprite(pixelX, pixelY, `powerup_${type}`);
    sprite.setScale(0.9);

    this.tweens.add({
        targets: sprite,
        y: pixelY - 4,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });

    this.powerUps.push({
        sprite: sprite,
        gridX: spot.x,
        gridY: spot.y,
        type: type
    });
}

// Override power-up collection for sky-themed power-ups
collectPowerUp(player, powerUp, time) {
    this.createPowerUpCollectEffect(powerUp.sprite.x, powerUp.sprite.y, powerUp.type);

    switch (powerUp.type) {
        case 'fuel': // Health restore
            if (player.health < player.maxHealth) {
                player.health = Math.min(player.health + 1, player.maxHealth);
                this.updateHealthDisplay(player);
            }
            break;
        case 'nitro': // Speed boost
            player.speedBoost = true;
            player.speedBoostEnd = time + 8000;
            this.showPowerUpIndicator(player, 'NITRO!', 0x3498db);
            break;
        case 'parachute': // Shield
            player.hasShield = true;
            this.createShieldVisual(player);
            this.showPowerUpIndicator(player, 'PROTECTED!', 0x27ae60);
            break;
        case 'radar': // Rapid fire
            player.rapidFire = true;
            player.rapidFireEnd = time + 8000;
            player.originalFireRate = player.weapon.fireRate;
            player.weapon.fireRate = Math.floor(player.weapon.fireRate / 3);
            this.showPowerUpIndicator(player, 'RADAR LOCK!', 0x9b59b6);
            break;
    }
}

createPowerUpCollectEffect(x, y, type) {
    const colors = {
        fuel: 0xc0392b,
        nitro: 0x3498db,
        radar: 0x9b59b6,
        parachute: 0x27ae60
    };
    const color = colors[type] || 0xffffff;

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const particle = this.add.circle(x, y, 4, color);
        this.tweens.add({
            targets: particle,
            x: x + Math.cos(angle) * 30,
            y: y + Math.sin(angle) * 30,
            alpha: 0,
            scale: 0.3,
            duration: 300,
            onComplete: () => particle.destroy()
        });
    }
}

// Crash pile death animation (replaces conga line)
addToCongaLine(player) {
    this.addToCrashPile(player);
}

addToCrashPile(player) {
    soundGenerator.playCrash();

    // Calculate position in crash pile
    const offsetX = (this.crashPile.length % 5 - 2) * 18;
    const offsetY = -Math.floor(this.crashPile.length / 5) * 8;
    const targetX = this.crashPileX + offsetX;
    const targetY = this.crashPileY - 20 + offsetY;

    // Create crashed plane sprite
    const crashedPlane = this.add.sprite(player.sprite.x, player.sprite.y, `biplane_${player.team}_right`);
    crashedPlane.setScale(0.5);
    crashedPlane.setTint(0x888888); // Damaged look

    // Spiral down animation
    this.tweens.add({
        targets: crashedPlane,
        x: targetX,
        y: targetY,
        angle: 720 + Phaser.Math.Between(0, 360),
        scale: 0.4,
        duration: 800,
        ease: 'Quad.easeIn'
    });

    this.crashPile.push({
        sprite: crashedPlane,
        team: player.team
    });
}

updateCrashPile(time) {
    // Gentle wobble for crash pile planes
    for (let i = 0; i < this.crashPile.length; i++) {
        const crashed = this.crashPile[i];
        crashed.sprite.rotation = Math.sin(time / 500 + i * 0.5) * 0.1;
    }
}

// Override game over for level progression
showGameOver(message, color) {
    soundGenerator.playVictory();

    const overlay = this.add.rectangle(
        this.gridWidth * this.tileSize / 2,
        this.gridHeight * this.tileSize / 2,
        this.gridWidth * this.tileSize,
        this.gridHeight * this.tileSize,
        0x000000,
        0.7
    );

    const text = this.add.text(
        this.gridWidth * this.tileSize / 2,
        this.gridHeight * this.tileSize / 2 - 30,
        message,
        {
            fontSize: '42px',
            fill: '#' + color.toString(16),
            fontFamily: 'Comic Sans MS',
            stroke: '#000000',
            strokeThickness: 4
        }
    ).setOrigin(0.5);

    const playerWon = color === 0x3498db;
    if (playerWon) {
        // Mark level 3 as complete
        const levelsCompleted = JSON.parse(localStorage.getItem('levelsCompleted') || '[]');
        if (!levelsCompleted.includes(3)) {
            levelsCompleted.push(3);
            localStorage.setItem('levelsCompleted', JSON.stringify(levelsCompleted));
        }
    }

    const restartBtn = this.add.text(
        this.gridWidth * this.tileSize / 2,
        this.gridHeight * this.tileSize / 2 + 30,
        playerWon ? 'Level Select' : 'Try Again',
        {
            fontSize: '20px',
            fill: '#f1c40f',
            fontFamily: 'Comic Sans MS'
        }
    ).setOrigin(0.5).setInteractive();

    restartBtn.on('pointerdown', () => {
        if (playerWon) {
            this.scene.start('LevelSelectScene');
        } else {
            this.scene.restart();
        }
    });

    restartBtn.on('pointerover', () => restartBtn.setScale(1.1));
    restartBtn.on('pointerout', () => restartBtn.setScale(1));
}
```

**Step 2: Verify**

**Step 3: Commit**

```bash
git add js/scenes/SkyBattleScene.js
git commit -m "feat: add power-ups, crash pile death animation, and game over for sky battle"
```

---

## Task 12: Update GameScene for Biplane Sprites

**Files:**
- Modify: `js/scenes/GameScene.js`

**Step 1: Add createPlayerSprite method**

Find the `createPlayer` method and add sprite selection. First, search for where sprites are created (around line 140-160 in createPlayers). Add this method to GameScene:

```javascript
// Add this method before createPlayers()
createPlayerSprite(team, direction) {
    // Default to soldier sprites - subclasses can override
    return `soldier_${team}_${direction}`;
}
```

**Step 2: Update createPlayers to use the method**

In `createPlayers()`, find where the sprite is created (look for `this.add.sprite`) and update to use the new method:

Change:
```javascript
const sprite = this.add.sprite(pixelX, pixelY, `soldier_${team}_right`);
```

To:
```javascript
const sprite = this.add.sprite(pixelX, pixelY, this.createPlayerSprite(team, 'right'));
```

**Step 3: Update updatePlayerSprite to use the method**

Find `updatePlayerSprite()` method and update:

Change:
```javascript
player.sprite.setTexture(`soldier_${player.team}_${player.direction}`);
```

To:
```javascript
player.sprite.setTexture(this.createPlayerSprite(player.team, player.direction));
```

**Step 4: Commit**

```bash
git add js/scenes/GameScene.js
git commit -m "refactor: add createPlayerSprite method for subclass overriding"
```

---

## Task 13: Update LevelSelectScene for Level 3

**Files:**
- Modify: `js/scenes/LevelSelectScene.js`

**Step 1: Add Level 3 button**

In `create()`, after the Level 2 button, add:

```javascript
// Level 3: Sky Battle (unlocked after completing level 2)
const level3Unlocked = levelsCompleted.includes(2);
this.createLevelButton(centerX, centerY + 100, 'Level 3: Sky Battle', 'SkyBattleScene', level3Unlocked, levelsCompleted.includes(3));
```

**Step 2: Adjust positions**

Move the chaos mode toggle and other elements down. Update:

```javascript
// Chaos Mode toggle - move down
this.createChaosModeToggle(centerX, centerY + 180);

// Instructions - move down
this.add.text(centerX, centerY + 240, 'Complete a level to unlock the next!', {
```

Also move the power-up legend:
```javascript
this.drawPowerUpLegend(centerX, centerY + 290);
```

**Step 3: Commit**

```bash
git add js/scenes/LevelSelectScene.js
git commit -m "feat: add Level 3 Sky Battle to level select menu"
```

---

## Task 14: Add Cheat Codes for Level 3

**Files:**
- Modify: `js/scenes/GameScene.js`
- Modify: `js/scenes/CityLifeScene.js`

**Step 1: Update GameScene secret code handler**

Find the secret code handler in `setupInput()` and update:

```javascript
// Secret codes to skip levels
if (this.secretCode === 'pizza' && this.currentLevel === 1) {
    this.activateSecretSkip('CityLifeScene', 'PIZZA TIME!');
}
if (this.secretCode === 'ufo' && this.currentLevel <= 2) {
    this.activateSecretSkip('SkyBattleScene', 'BEAM ME UP!');
}
```

**Step 2: Update activateSecretSkip to take parameters**

Find `activateSecretSkip()` and update signature:

```javascript
activateSecretSkip(targetScene, message) {
    // Unlock levels
    const levelsCompleted = JSON.parse(localStorage.getItem('levelsCompleted') || '[]');
    if (!levelsCompleted.includes(1)) {
        levelsCompleted.push(1);
    }
    if (targetScene === 'SkyBattleScene' && !levelsCompleted.includes(2)) {
        levelsCompleted.push(2);
    }
    localStorage.setItem('levelsCompleted', JSON.stringify(levelsCompleted));

    // Show message and transition
    const text = this.add.text(
        this.gridWidth * this.tileSize / 2,
        this.gridHeight * this.tileSize / 2,
        message,
        {
            fontSize: '32px',
            fill: '#f39c12',
            fontFamily: 'Comic Sans MS',
            stroke: '#000',
            strokeThickness: 4
        }
    ).setOrigin(0.5);

    this.time.delayedCall(1000, () => {
        this.scene.start(targetScene);
    });
}
```

**Step 3: Add secret code to CityLifeScene**

In CityLifeScene, the secret code handler is inherited. But we need to make sure it works. Add to `setupInput()` override if needed, or ensure the parent handles it.

Actually, since CityLifeScene extends GameScene and has `currentLevel = 2`, the parent's handler should work. But we need to also handle 'ufo' in level 2. The condition `this.currentLevel <= 2` handles this.

**Step 4: Commit**

```bash
git add js/scenes/GameScene.js
git commit -m "feat: add 'ufo' cheat code to skip to Level 3"
```

---

## Task 15: Register SkyBattleScene in main.js

**Files:**
- Modify: `js/main.js`

**Step 1: Add SkyBattleScene to scene list**

Update the scene array:

```javascript
scene: [BootScene, GameScene, CityLifeScene, SkyBattleScene, LevelSelectScene],
```

**Step 2: Commit**

```bash
git add js/main.js
git commit -m "feat: register SkyBattleScene in Phaser config"
```

---

## Task 16: Add script tag to index.html

**Files:**
- Modify: `index.html`

**Step 1: Add script tag for SkyBattleScene**

Add before the closing `</body>` tag, after CityLifeScene script:

```html
<script src="js/scenes/SkyBattleScene.js"></script>
```

**Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add SkyBattleScene script to index.html"
```

---

## Task 17: Update CLAUDE.md Documentation

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add Level 3 documentation**

Add after the Level 2 section:

```markdown
## Level 3: Sky Battle

Sky Battle is the third level that unlocks after beating level 2. It features:

**Terrain:**
- Open sky: Normal flight area
- Fluffy clouds: Decorative, no effect
- Turbulence zones: Random 1-tile displacement when entering
- Hot air balloons: Impassable obstacles (block movement and shots)
- Storm clouds: Block projectiles (line of sight blockers)
- Cloud platforms: Safe zone bases

**Progressive Hazards:**
- UFO Abduction: Spawns after 15 seconds, beams up random nearby player for 3 seconds (every 8s)
- Bird Flocks: Spawn after 25 seconds, fly across screen, deal 1 damage + knockback on hit (every 6s)

**Power-ups:** Fuel can (health), nitro (speed), radar (rapid fire), parachute (shield)

**Death Animation:** Crash pile - planes spiral down and stack in wreckage at bottom of screen

**Cheat Code:** Type "ufo" during level 1 or 2 to skip to level 3
```

**Step 2: Update terrain types list**

Add Level 3 terrain types:
```markdown
- Level 3 terrain types: 14=open sky, 15=fluffy cloud, 16=turbulence, 17=hot air balloon, 18=cloud platform, 19=storm cloud
```

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add Level 3 Sky Battle documentation"
```

---

## Task 18: Test and Verify

**Step 1: Open game in browser**

```bash
open index.html
```

**Step 2: Verify checklist**

- [ ] Game loads without console errors
- [ ] Level select shows Level 3 (locked initially)
- [ ] Type "pizza" on Level 1 to unlock Level 2
- [ ] Type "ufo" on Level 1 or 2 to skip to Level 3
- [ ] Biplane sprites display correctly in all 4 directions
- [ ] Sky terrain renders (clouds, turbulence, balloons, storms)
- [ ] Movement works, balloons block
- [ ] Turbulence zones cause random displacement
- [ ] Storm clouds block projectiles
- [ ] UFO spawns after 15 seconds and abducts players
- [ ] Bird flocks spawn after 25 seconds and damage on hit
- [ ] Power-ups spawn and work correctly
- [ ] Crash pile accumulates eliminated planes
- [ ] Smoke puffs animate from crash pile
- [ ] Game over shows correctly and saves progress
- [ ] Chaos mode works

**Step 3: Fix any issues found**

**Step 4: Final commit**

```bash
git add -A
git commit -m "test: verify Sky Battle level works correctly"
```

---

Plan complete and saved to `docs/plans/2026-01-11-sky-battle-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
