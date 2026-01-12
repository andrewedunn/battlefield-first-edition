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

    // Disperse a bird flock when hit by projectile or after hitting a player
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

    // Gentle wobble animation for crashed planes in the pile
    updateCrashPile(time) {
        for (let i = 0; i < this.crashPile.length; i++) {
            const crashed = this.crashPile[i];
            crashed.sprite.rotation = Math.sin(time / 500 + i * 0.5) * 0.1;
        }
    }

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

    // Update UFO behavior and abductions
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

    // Update bird flock movements and collisions
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

    removeFlock(flock) {
        flock.active = false;
        for (const bird of flock.birds) {
            bird.destroy();
        }
    }
}
