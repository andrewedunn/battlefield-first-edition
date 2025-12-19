// ABOUTME: City Life level scene - second level with urban theme
// ABOUTME: Features buildings, cars, rats, roadkill, and pizza line death animation

class CityLifeScene extends GameScene {
    constructor() {
        super('CityLifeScene');
    }

    init(data) {
        super.init(data);
        this.currentLevel = 2;
        this.levelName = 'City Life';

        // City-specific timing for progressive hazards
        this.roadkillStartTime = 10000;  // 10 seconds
        this.ratStartTime = 20000;       // 20 seconds
        this.roadkillSpawnInterval = 5000; // Every 5 seconds
        this.ratSpawnInterval = 4000;    // Every 4 seconds
        this.maxRoadkill = 6;
        this.maxRats = 4;

        // City-specific state
        this.roadkillTiles = [];
        this.rats = [];
        this.pizzaLine = [];
        this.lastRoadkillSpawn = 0;
        this.lastRatSpawn = 0;
        this.sewerPositions = [];
        this.gameStartTime = 0;

        // Pizzeria location (bottom-left, just outside play grid)
        this.pizzeriaX = 40;
        this.pizzeriaY = this.gridHeight * this.tileSize + 25;
    }

    create() {
        // Initialize sound generator
        soundGenerator.init();

        this.gameStartTime = this.time.now;

        this.generateTerrain();
        this.drawBattlefield();
        this.drawPizzeria();
        this.createPlayers();
        this.setupInput();

        // Level title (top corner, out of the way)
        this.add.text(5, 5, 'CITY LIFE', {
            fontSize: '12px',
            fill: '#f39c12',
            fontFamily: 'Comic Sans MS',
            stroke: '#000',
            strokeThickness: 2
        });
    }

    generateTerrain() {
        // Initialize all as sidewalk/grass (type 0 - reuse grass as sidewalk base)
        for (let y = 0; y < this.gridHeight; y++) {
            this.terrainMap[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.terrainMap[y][x] = 11; // Sidewalk
            }
        }

        // Main streets - horizontal (type 13) and vertical (type 6) roads
        // Horizontal streets (type 13)
        for (let x = 3; x < 25; x++) {
            this.terrainMap[4][x] = 13;
            this.terrainMap[5][x] = 13;
            this.terrainMap[12][x] = 13;
            this.terrainMap[13][x] = 13;
        }
        // Vertical streets (type 6)
        for (let y = 0; y < this.gridHeight; y++) {
            this.terrainMap[y][8] = 6;
            this.terrainMap[y][9] = 6;
            this.terrainMap[y][18] = 6;
            this.terrainMap[y][19] = 6;
        }

        // Park area (type 12) - central green space
        for (let y = 7; y <= 10; y++) {
            for (let x = 12; x <= 16; x++) {
                this.terrainMap[y][x] = 12; // Park
            }
        }

        // Building clusters (type 7) - 2x2 or 3x2 building areas
        // Left side buildings
        this.addBuildingCluster(4, 1, 2, 2);
        this.addBuildingCluster(4, 7, 2, 3);
        this.addBuildingCluster(4, 15, 3, 2);

        // Center buildings (around park)
        this.addBuildingCluster(11, 1, 3, 2);
        this.addBuildingCluster(14, 1, 3, 2);
        this.addBuildingCluster(11, 15, 2, 2);
        this.addBuildingCluster(15, 15, 2, 2);

        // Right side buildings
        this.addBuildingCluster(21, 1, 2, 2);
        this.addBuildingCluster(21, 7, 2, 3);
        this.addBuildingCluster(21, 15, 2, 2);

        // Cars (type 8) - obstacles on streets only
        const carPositions = [
            { x: 8, y: 2 }, { x: 18, y: 3 },
            { x: 5, y: 4 }, { x: 15, y: 5 },
            { x: 22, y: 12 }, { x: 11, y: 13 },
            { x: 9, y: 15 }, { x: 19, y: 16 }
        ];
        for (const pos of carPositions) {
            const t = this.terrainMap[pos.y][pos.x];
            if (t === 6 || t === 13) {
                this.terrainMap[pos.y][pos.x] = 8;
            }
        }

        // Potholes (type 9) - like trenches, provide cover (on streets)
        const potholePositions = [
            { x: 8, y: 7 }, { x: 19, y: 6 },
            { x: 9, y: 11 }, { x: 18, y: 10 },
            { x: 12, y: 12 }, { x: 16, y: 4 }
        ];
        for (const pos of potholePositions) {
            const t = this.terrainMap[pos.y][pos.x];
            if (t === 6 || t === 13) {
                this.terrainMap[pos.y][pos.x] = 9;
            }
        }

        // Sewer grates (type 10) - rat spawn points (on streets)
        this.sewerPositions = [
            { x: 8, y: 4 }, { x: 19, y: 5 },
            { x: 9, y: 13 }, { x: 18, y: 12 }
        ];
        for (const pos of this.sewerPositions) {
            const t = this.terrainMap[pos.y][pos.x];
            if (t === 6 || t === 13) {
                this.terrainMap[pos.y][pos.x] = 10;
            }
        }
    }

    addBuildingCluster(startX, startY, width, height) {
        for (let y = startY; y < startY + height && y < this.gridHeight; y++) {
            for (let x = startX; x < startX + width && x < this.gridWidth; x++) {
                // Don't place buildings in safe zones
                if (x >= this.blueSafeZone.startX && x <= this.blueSafeZone.endX) continue;
                if (x >= this.redSafeZone.startX && x <= this.redSafeZone.endX) continue;
                this.terrainMap[y][x] = 7; // Building
            }
        }
    }

    drawBattlefield() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const pixelX = x * this.tileSize;
                const pixelY = y * this.tileSize;

                let tileKey = 'tile_sidewalk';
                const terrain = this.terrainMap[y][x];
                if (terrain === 6) {
                    tileKey = 'tile_street_v'; // Vertical street
                } else if (terrain === 13) {
                    tileKey = 'tile_street_h'; // Horizontal street
                } else if (terrain === 7) {
                    tileKey = 'tile_building';
                } else if (terrain === 8) {
                    tileKey = 'tile_car';
                } else if (terrain === 9) {
                    tileKey = 'tile_pothole';
                } else if (terrain === 10) {
                    tileKey = 'tile_sewer';
                } else if (terrain === 11) {
                    tileKey = 'tile_sidewalk';
                } else if (terrain === 12) {
                    tileKey = 'tile_park';
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

    drawPizzeria() {
        this.add.image(this.pizzeriaX, this.pizzeriaY, 'pizzeria').setOrigin(0, 0.5);
    }

    update(time, delta) {
        this.handleInput(time);
        // In chaos mode, AI moves all red players together
        if (this.chaosMode) {
            this.updateChaosAI(time);
        } else {
            this.updateAI(time);
        }
        this.updateProjectiles(delta);
        this.updatePizzaLine(time);
        this.updatePowerUps(time);
        this.updatePowerUpEffects(time);

        // Progressive hazards
        this.updateRoadkill(time);
        this.updateRats(time, delta);
    }

    // Override movement to block cars (impassable obstacles)
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

        // Check car (impassable)
        if (this.terrainMap[newGridY][newGridX] === 8) {
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

        // Check terrain slowdown (roadkill = slow like mud)
        const terrain = this.terrainMap[newGridY][newGridX];
        const onRoadkill = this.roadkillTiles.some(r => r.x === newGridX && r.y === newGridY);
        const moveDuration = onRoadkill ? 200 : 80;

        this.tweens.add({
            targets: [player.sprite, player.selectionRing],
            x: newPixelX,
            y: newPixelY,
            duration: moveDuration,
            ease: 'Linear',
            onComplete: () => {
                player.isMoving = false;
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

        // Show "GROSS!" when stepping on roadkill
        if (onRoadkill) {
            const grossText = this.add.text(newPixelX, newPixelY - 20, 'GROSS!', {
                fontSize: '10px', fill: '#6d4c41', fontFamily: 'Comic Sans MS', stroke: '#000', strokeThickness: 1
            }).setOrigin(0.5);

            this.tweens.add({
                targets: grossText,
                y: grossText.y - 20,
                alpha: 0,
                duration: 400,
                onComplete: () => grossText.destroy()
            });
        }

        return true;
    }

    // Override projectile collision for height-based combat
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

            // Check car collision (blocks shots)
            if (this.terrainMap[gridY] && this.terrainMap[gridY][gridX] === 8) {
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

            // Check rat collision
            for (let r = this.rats.length - 1; r >= 0; r--) {
                const rat = this.rats[r];
                if (!rat.isAlive) continue;

                const ratPixelX = rat.gridX * this.tileSize + this.tileSize / 2;
                const ratPixelY = rat.gridY * this.tileSize + this.tileSize / 2;
                const dist = Phaser.Math.Distance.Between(proj.sprite.x, proj.sprite.y, ratPixelX, ratPixelY);

                if (dist < 14) {
                    this.eliminateRat(rat);
                    this.createHitEffect(proj.sprite.x, proj.sprite.y);
                    proj.sprite.destroy();
                    proj.active = false;
                    break;
                }
            }
            if (!proj.active) continue;

            // Check player collision
            for (const player of this.players) {
                if (!player.isAlive) continue;
                if (player.team === proj.team) continue;

                const playerPixelX = player.gridX * this.tileSize + this.tileSize / 2;
                const playerPixelY = player.gridY * this.tileSize + this.tileSize / 2;

                const dist = Phaser.Math.Distance.Between(proj.sprite.x, proj.sprite.y, playerPixelX, playerPixelY);

                if (dist < 14) {
                    // Height-based combat: buildings provide elevation
                    const shooterElevated = proj.shooterElevated;
                    const targetElevated = this.terrainMap[player.gridY][player.gridX] === 7;

                    // Ground shooter can't hit elevated target
                    if (!shooterElevated && targetElevated) {
                        this.createMissEffect(proj.sprite.x, proj.sprite.y);
                        continue; // Shot passes under
                    }

                    // Pothole protection (like trenches)
                    const targetInPothole = this.terrainMap[player.gridY][player.gridX] === 9;
                    if (targetInPothole && !proj.firedFromPothole) {
                        this.createMissEffect(proj.sprite.x, proj.sprite.y);
                        continue;
                    }

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

    // Override fireWeapon to track shooter elevation
    fireWeapon(player, time) {
        if (time < player.lastFireTime + player.weapon.fireRate) {
            return;
        }

        // Cannot shoot from inside your own safe zone
        if (player.team === 'blue' && player.gridX >= this.blueSafeZone.startX && player.gridX <= this.blueSafeZone.endX) {
            return;
        }
        if (player.team === 'red' && player.gridX >= this.redSafeZone.startX && player.gridX <= this.redSafeZone.endX) {
            return;
        }

        player.lastFireTime = time;

        // Play weapon sound
        soundGenerator.play(player.weapon.projectile);

        const pixelX = player.sprite.x;
        const pixelY = player.sprite.y;

        const projectile = this.add.sprite(pixelX, pixelY, player.weapon.projectile);
        projectile.setScale(0.7);

        let velocityX = 0, velocityY = 0;
        let rotation = 0;

        switch (player.direction) {
            case 'up':
                velocityY = -player.weapon.speed;
                rotation = -Math.PI / 2;
                break;
            case 'down':
                velocityY = player.weapon.speed;
                rotation = Math.PI / 2;
                break;
            case 'left':
                velocityX = -player.weapon.speed;
                rotation = Math.PI;
                break;
            case 'right':
                velocityX = player.weapon.speed;
                rotation = 0;
                break;
        }

        projectile.setRotation(rotation);

        // Track elevation and pothole status
        const shooterElevated = this.terrainMap[player.gridY][player.gridX] === 7;
        const firedFromPothole = this.terrainMap[player.gridY][player.gridX] === 9;

        this.projectiles.push({
            sprite: projectile,
            velocityX: velocityX,
            velocityY: velocityY,
            damage: player.weapon.damage,
            team: player.team,
            shooterElevated: shooterElevated,
            firedFromPothole: firedFromPothole,
            active: true
        });
    }

    // Override tryMovePlayer for AI to respect cars
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

        // Check car (impassable)
        if (this.terrainMap[newGridY][newGridX] === 8) {
            return false;
        }

        for (const other of this.players) {
            if (other !== player && other.isAlive && other.gridX === newGridX && other.gridY === newGridY) {
                return false;
            }
        }

        this.movePlayer(player, dx, dy);
        return true;
    }

    // Roadkill spawning
    updateRoadkill(time) {
        const elapsed = time - this.gameStartTime;
        if (elapsed < this.roadkillStartTime) return;

        if (time > this.lastRoadkillSpawn + this.roadkillSpawnInterval && this.roadkillTiles.length < this.maxRoadkill) {
            this.spawnRoadkill();
            this.lastRoadkillSpawn = time;
        }
    }

    spawnRoadkill() {
        // Find valid street tiles (both horizontal and vertical)
        const validSpots = [];
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const t = this.terrainMap[y][x];
                if (t !== 6 && t !== 13) continue; // Only on streets
                if (x >= this.blueSafeZone.startX && x <= this.blueSafeZone.endX) continue;
                if (x >= this.redSafeZone.startX && x <= this.redSafeZone.endX) continue;

                // Not already roadkill
                if (this.roadkillTiles.some(r => r.x === x && r.y === y)) continue;

                validSpots.push({ x, y });
            }
        }

        if (validSpots.length === 0) return;

        const spot = validSpots[Math.floor(Math.random() * validSpots.length)];
        const pixelX = spot.x * this.tileSize + this.tileSize / 2;
        const pixelY = spot.y * this.tileSize + this.tileSize / 2;

        // Add roadkill sprite on top of street
        const sprite = this.add.image(pixelX, pixelY, 'tile_roadkill');

        this.roadkillTiles.push({
            x: spot.x,
            y: spot.y,
            sprite: sprite
        });
    }

    // Rat system
    updateRats(time, delta) {
        const elapsed = time - this.gameStartTime;
        if (elapsed < this.ratStartTime) return;

        // Spawn new rats
        if (time > this.lastRatSpawn + this.ratSpawnInterval && this.rats.filter(r => r.isAlive).length < this.maxRats) {
            this.spawnRat();
            this.lastRatSpawn = time;
        }

        // Update existing rats
        for (const rat of this.rats) {
            if (!rat.isAlive || rat.isMoving) continue;
            this.updateSingleRat(rat, time);
        }
    }

    spawnRat() {
        if (this.sewerPositions.length === 0) return;

        const sewer = this.sewerPositions[Math.floor(Math.random() * this.sewerPositions.length)];
        const pixelX = sewer.x * this.tileSize + this.tileSize / 2;
        const pixelY = sewer.y * this.tileSize + this.tileSize / 2;

        const sprite = this.add.sprite(pixelX, pixelY, 'rat_right');
        sprite.setScale(0.8);

        // Spawn animation - rise from sewer
        sprite.setAlpha(0);
        this.tweens.add({
            targets: sprite,
            alpha: 1,
            duration: 300
        });

        this.rats.push({
            sprite: sprite,
            gridX: sewer.x,
            gridY: sewer.y,
            direction: 'right',
            state: 'hunting', // 'hunting' or 'returning'
            isAlive: true,
            isMoving: false,
            hasBitten: false,
            targetPlayer: null
        });
    }

    updateSingleRat(rat, time) {
        if (rat.state === 'hunting') {
            // Find nearest player to hunt (not in safe zone)
            let nearestPlayer = null;
            let nearestDist = Infinity;

            for (const player of this.players) {
                if (!player.isAlive) continue;
                // Skip players in safe zones
                if (player.team === 'blue' && player.gridX >= this.blueSafeZone.startX && player.gridX <= this.blueSafeZone.endX) continue;
                if (player.team === 'red' && player.gridX >= this.redSafeZone.startX && player.gridX <= this.redSafeZone.endX) continue;

                const dist = Math.abs(player.gridX - rat.gridX) + Math.abs(player.gridY - rat.gridY);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestPlayer = player;
                }
            }

            if (!nearestPlayer) return;

            // Check if adjacent to target - bite! (double-check not in safe zone)
            const inBlueSafe = nearestPlayer.gridX >= this.blueSafeZone.startX && nearestPlayer.gridX <= this.blueSafeZone.endX;
            const inRedSafe = nearestPlayer.gridX >= this.redSafeZone.startX && nearestPlayer.gridX <= this.redSafeZone.endX;
            if (nearestDist === 1 && !inBlueSafe && !inRedSafe) {
                this.ratBite(rat, nearestPlayer);
                return;
            }

            // Move toward target
            const dx = nearestPlayer.gridX - rat.gridX;
            const dy = nearestPlayer.gridY - rat.gridY;

            let moveX = 0, moveY = 0;
            if (Math.abs(dx) > Math.abs(dy)) {
                moveX = dx > 0 ? 1 : -1;
            } else {
                moveY = dy > 0 ? 1 : -1;
            }

            this.tryMoveRat(rat, moveX, moveY);

        } else if (rat.state === 'returning') {
            // Return to nearest sewer
            let nearestSewer = null;
            let nearestDist = Infinity;

            for (const sewer of this.sewerPositions) {
                const dist = Math.abs(sewer.x - rat.gridX) + Math.abs(sewer.y - rat.gridY);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestSewer = sewer;
                }
            }

            if (!nearestSewer) return;

            // At sewer - despawn
            if (rat.gridX === nearestSewer.x && rat.gridY === nearestSewer.y) {
                this.despawnRat(rat);
                return;
            }

            // Move toward sewer
            const dx = nearestSewer.x - rat.gridX;
            const dy = nearestSewer.y - rat.gridY;

            let moveX = 0, moveY = 0;
            if (Math.abs(dx) > Math.abs(dy)) {
                moveX = dx > 0 ? 1 : -1;
            } else {
                moveY = dy > 0 ? 1 : -1;
            }

            this.tryMoveRat(rat, moveX, moveY);
        }
    }

    tryMoveRat(rat, dx, dy) {
        const newGridX = rat.gridX + dx;
        const newGridY = rat.gridY + dy;

        // Check bounds
        if (newGridX < 0 || newGridX >= this.gridWidth || newGridY < 0 || newGridY >= this.gridHeight) {
            return false;
        }

        // Check impassable terrain (cars, buildings)
        const terrain = this.terrainMap[newGridY][newGridX];
        if (terrain === 7 || terrain === 8) {
            return false;
        }

        // Update direction
        if (dx === 1) rat.direction = 'right';
        else if (dx === -1) rat.direction = 'left';

        rat.sprite.setTexture(`rat_${rat.direction}`);

        rat.isMoving = true;
        rat.gridX = newGridX;
        rat.gridY = newGridY;

        const newPixelX = newGridX * this.tileSize + this.tileSize / 2;
        const newPixelY = newGridY * this.tileSize + this.tileSize / 2;

        this.tweens.add({
            targets: rat.sprite,
            x: newPixelX,
            y: newPixelY,
            duration: 150,
            ease: 'Linear',
            onComplete: () => {
                rat.isMoving = false;
            }
        });

        return true;
    }

    ratBite(rat, player) {
        // Bite the player!
        soundGenerator.playRatSqueak();

        // Show bite effect
        const biteText = this.add.text(player.sprite.x, player.sprite.y - 30, 'OUCH! RAT BITE!', {
            fontSize: '10px', fill: '#e74c3c', fontFamily: 'Comic Sans MS', stroke: '#000', strokeThickness: 1
        }).setOrigin(0.5);

        this.tweens.add({
            targets: biteText,
            y: biteText.y - 20,
            alpha: 0,
            duration: 600,
            onComplete: () => biteText.destroy()
        });

        // Deal 1 damage
        this.damagePlayer(player, 1);

        // Start returning to sewer
        rat.state = 'returning';
        rat.hasBitten = true;
    }

    despawnRat(rat) {
        // Sink into sewer animation
        this.tweens.add({
            targets: rat.sprite,
            alpha: 0,
            scaleY: 0.3,
            duration: 300,
            onComplete: () => {
                rat.sprite.destroy();
                rat.isAlive = false;
            }
        });
    }

    eliminateRat(rat) {
        rat.isAlive = false;

        // Fun spinning elimination like players
        this.tweens.add({
            targets: rat.sprite,
            y: '-=30',
            alpha: 0,
            scale: 0.3,
            angle: 720,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => {
                rat.sprite.destroy();
                this.addRatToPizzaLine();
            }
        });
    }

    // Pizza line (replaces conga line)
    addToCongaLine(player) {
        // Override to use pizza line instead
        this.addToPizzaLine(player);
    }

    addToPizzaLine(player) {
        // Horizontal line starting from right of pizzeria
        const baseX = this.pizzeriaX + 90;
        const lineX = baseX + (this.pizzaLine.length * 22);
        const lineY = this.pizzeriaY;

        const sprite = this.add.sprite(baseX, lineY - 30, `soldier_${player.team}_right`);
        sprite.setScale(0.6);

        // Slide into line animation (drop down and slide right)
        this.tweens.add({
            targets: sprite,
            x: lineX,
            y: lineY,
            duration: 400,
            ease: 'Back.easeOut'
        });

        this.pizzaLine.push({
            sprite: sprite,
            team: player.team,
            isRat: false,
            baseX: lineX
        });
    }

    addRatToPizzaLine() {
        const baseX = this.pizzeriaX + 90;
        const lineX = baseX + (this.pizzaLine.length * 22); // Same spacing as soldiers
        const lineY = this.pizzeriaY + 5; // Slightly lower for rats

        const sprite = this.add.sprite(baseX, lineY - 20, 'rat_right');
        sprite.setScale(0.5);

        // Slide into line animation
        this.tweens.add({
            targets: sprite,
            x: lineX,
            y: lineY,
            duration: 400,
            ease: 'Back.easeOut'
        });

        this.pizzaLine.push({
            sprite: sprite,
            team: 'rat',
            isRat: true,
            baseX: lineX
        });
    }

    updatePizzaLine(time) {
        // Gentle bobbing animation for pizza line (horizontal)
        for (let i = 0; i < this.pizzaLine.length; i++) {
            const member = this.pizzaLine[i];
            const baseY = member.isRat ? this.pizzeriaY + 5 : this.pizzeriaY;
            member.sprite.y = baseY + Math.sin(time / 200 + i * 0.3) * 2;
        }
    }

    updateCongaLine(time) {
        // Override with pizza line update
        this.updatePizzaLine(time);
    }

    // Override power-up spawning with city-themed power-ups
    spawnPowerUp() {
        const validSpots = [];
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                // Street or sewer tiles only
                const terrain = this.terrainMap[y][x];
                if (terrain !== 6 && terrain !== 10) continue;
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
        // City-themed power-ups
        const types = ['pizza', 'hotdog', 'coffee', 'trafficcone'];
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

    // Override power-up collection for city-themed power-ups
    collectPowerUp(player, powerUp, time) {
        this.createPowerUpCollectEffect(powerUp.sprite.x, powerUp.sprite.y, powerUp.type);

        switch (powerUp.type) {
            case 'pizza': // Health restore
                if (player.health < player.maxHealth) {
                    player.health = Math.min(player.health + 1, player.maxHealth);
                    this.updateHealthDisplay(player);
                }
                break;
            case 'hotdog': // Speed boost
                player.speedBoost = true;
                player.speedBoostEnd = time + 8000;
                this.showPowerUpIndicator(player, 'SPEED!', 0xf1c40f);
                break;
            case 'trafficcone': // Shield
                player.hasShield = true;
                this.createShieldVisual(player);
                this.showPowerUpIndicator(player, 'PROTECTED!', 0xe67e22);
                break;
            case 'coffee': // Rapid fire
                player.rapidFire = true;
                player.rapidFireEnd = time + 8000;
                player.originalFireRate = player.weapon.fireRate;
                player.weapon.fireRate = Math.floor(player.weapon.fireRate / 3);
                this.showPowerUpIndicator(player, 'CAFFEINE!', 0x8b4513);
                break;
        }
    }

    createPowerUpCollectEffect(x, y, type) {
        const colors = {
            pizza: 0xe67e22,
            hotdog: 0xf1c40f,
            coffee: 0x8b4513,
            trafficcone: 0xe67e22
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

    // Override game over to handle level progression
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

        // If player won, save completion and go to level select
        const playerWon = color === 0x3498db;
        if (playerWon) {
            // Mark level 2 as complete
            const levelsCompleted = JSON.parse(localStorage.getItem('levelsCompleted') || '[]');
            if (!levelsCompleted.includes(2)) {
                levelsCompleted.push(2);
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

        restartBtn.on('pointerover', () => {
            restartBtn.setScale(1.1);
        });

        restartBtn.on('pointerout', () => {
            restartBtn.setScale(1);
        });
    }
}
