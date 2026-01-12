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
        // Initialize sound generator
        soundGenerator.init();

        this.gameStartTime = this.time.now;

        this.generateTerrain();
        this.drawBattlefield();
        this.drawCrashPile();
        this.createPlayers();
        this.setupInput();

        // Level title (top corner, out of the way)
        this.add.text(5, 5, 'SKY BATTLE', {
            fontSize: '12px',
            fill: '#87ceeb',
            fontFamily: 'Comic Sans MS',
            stroke: '#000',
            strokeThickness: 2
        });

        // Chaos mode indicator
        if (this.chaosMode) {
            this.add.text(this.gridWidth * this.tileSize - 10, 8, 'CHAOS MODE', {
                fontSize: '14px',
                fill: '#e74c3c',
                fontFamily: 'Comic Sans MS',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(1, 0);
        }
    }

    generateTerrain() {
        // Initialize all as open sky (type 14)
        for (let y = 0; y < this.gridHeight; y++) {
            this.terrainMap[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.terrainMap[y][x] = 14; // Open sky
            }
        }

        // Cloud platform safe zones (type 18)
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

    // Stub: Update crash pile animations and crashed planes
    updateCrashPile(time) {
        // To be implemented in Task 8: Handle crash pile animations
    }

    // Stub: Update UFO behavior and abductions
    updateUfo(time) {
        // To be implemented in Task 9: Handle UFO spawning, movement, and abductions
    }

    // Stub: Update bird flock movements and collisions
    updateBirdFlocks(time, delta) {
        // To be implemented in Task 10: Handle bird flock spawning and movement
    }
}
