// ABOUTME: Main gameplay scene for Battlefield First Edition
// ABOUTME: Handles the battlefield grid, players, combat, and game logic

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Grid configuration - bigger battlefield!
        this.gridWidth = 28;
        this.gridHeight = 18;
        this.tileSize = 28;

        // Safe zone columns (3 columns on each side for more players)
        this.blueSafeZone = { startX: 0, endX: 2 };
        this.redSafeZone = { startX: 25, endX: 27 };

        // Number of players per team
        this.playersPerTeam = 15;

        // Game state
        this.players = [];
        this.selectedPlayer = null;
        this.projectiles = [];

        // Teams
        this.blueTeam = [];
        this.redTeam = [];

        // Conga line for eliminated players
        this.congaLine = [];

        // Terrain map (0 = grass, 1 = trench, 2 = mountain, 3 = mud, 4 = bounce, 5 = teleporter)
        this.terrainMap = [];

        // Power-ups
        this.powerUps = [];
        this.lastPowerUpSpawn = 0;
        this.powerUpSpawnInterval = 12000; // Spawn every 12 seconds
        this.maxPowerUps = 4;

        // Teleporter pair positions
        this.teleporterPair = [];
    }

    create() {
        // Initialize sound generator
        soundGenerator.init();

        this.generateTerrain();
        this.drawBattlefield();
        this.createPlayers();
        this.setupInput();

        // Instructions text at top
        this.add.text(this.gridWidth * this.tileSize / 2, 8, 'Click a player to select | WASD/Arrows to move | Space to shoot!', {
            fontSize: '12px',
            fill: '#ffffff',
            fontFamily: 'Comic Sans MS'
        }).setOrigin(0.5, 0);
    }

    generateTerrain() {
        // Initialize all grass
        for (let y = 0; y < this.gridHeight; y++) {
            this.terrainMap[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.terrainMap[y][x] = 0;
            }
        }

        // Add trenches - more spread out for bigger map
        // Left side trenches
        for (let x = 4; x <= 7; x++) {
            this.terrainMap[4][x] = 1;
            this.terrainMap[5][x] = 1;
        }
        for (let x = 5; x <= 8; x++) {
            this.terrainMap[12][x] = 1;
            this.terrainMap[13][x] = 1;
        }

        // Center trenches
        for (let x = 11; x <= 16; x++) {
            this.terrainMap[7][x] = 1;
            this.terrainMap[8][x] = 1;
        }
        for (let x = 12; x <= 15; x++) {
            this.terrainMap[10][x] = 1;
            this.terrainMap[11][x] = 1;
        }

        // Right side trenches
        for (let x = 20; x <= 23; x++) {
            this.terrainMap[4][x] = 1;
            this.terrainMap[5][x] = 1;
        }
        for (let x = 19; x <= 22; x++) {
            this.terrainMap[12][x] = 1;
            this.terrainMap[13][x] = 1;
        }

        // Add mountains scattered across the map
        const mountainPositions = [
            // Left area
            { x: 5, y: 2 }, { x: 7, y: 8 }, { x: 4, y: 15 },
            // Center-left
            { x: 10, y: 3 }, { x: 9, y: 9 }, { x: 11, y: 14 },
            // Center
            { x: 13, y: 2 }, { x: 14, y: 15 },
            // Center-right
            { x: 17, y: 3 }, { x: 18, y: 9 }, { x: 16, y: 14 },
            // Right area
            { x: 22, y: 2 }, { x: 20, y: 8 }, { x: 23, y: 15 }
        ];

        for (const pos of mountainPositions) {
            this.terrainMap[pos.y][pos.x] = 2;
        }

        // Add mud puddles (terrain type 3) - slows movement
        const mudPositions = [
            { x: 6, y: 6 }, { x: 8, y: 14 },
            { x: 14, y: 5 }, { x: 13, y: 13 },
            { x: 19, y: 6 }, { x: 21, y: 14 }
        ];
        for (const pos of mudPositions) {
            this.terrainMap[pos.y][pos.x] = 3;
        }

        // Add bounce pads (terrain type 4) - launch players
        const bouncePositions = [
            { x: 9, y: 1 }, { x: 18, y: 1 },
            { x: 9, y: 16 }, { x: 18, y: 16 }
        ];
        for (const pos of bouncePositions) {
            this.terrainMap[pos.y][pos.x] = 4;
        }

        // Add teleporter pair (terrain type 5)
        this.teleporterPair = [
            { x: 6, y: 9 },
            { x: 21, y: 9 }
        ];
        for (const pos of this.teleporterPair) {
            this.terrainMap[pos.y][pos.x] = 5;
        }
    }

    drawBattlefield() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const pixelX = x * this.tileSize;
                const pixelY = y * this.tileSize;

                let tileKey = 'tile_grass';
                const terrain = this.terrainMap[y][x];
                if (terrain === 1) {
                    tileKey = 'tile_trench';
                } else if (terrain === 2) {
                    tileKey = 'tile_mountain';
                } else if (terrain === 3) {
                    tileKey = 'tile_mud';
                } else if (terrain === 4) {
                    tileKey = 'tile_bounce';
                } else if (terrain === 5) {
                    tileKey = 'tile_teleporter';
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

    createPlayers() {
        // Weapon types with unique projectiles for each
        this.weaponTypes = [
            { name: 'Banana Blaster', projectile: 'proj_banana', damage: 1, speed: 280, fireRate: 500 },
            { name: 'Water Balloon', projectile: 'proj_balloon', damage: 2, speed: 180, fireRate: 900 },
            { name: 'Confetti Cannon', projectile: 'proj_confetti', damage: 1, speed: 350, fireRate: 200 },
            { name: 'Rubber Chicken', projectile: 'proj_chicken', damage: 1, speed: 220, fireRate: 600 },
            { name: 'Pie Thrower', projectile: 'proj_pie', damage: 1, speed: 250, fireRate: 550 },
            { name: 'Bubble Gun', projectile: 'proj_bubble', damage: 1, speed: 300, fireRate: 400 },
            { name: 'Snowball Shooter', projectile: 'proj_snowball', damage: 1, speed: 290, fireRate: 450 },
            { name: 'Silly String', projectile: 'proj_string', damage: 1, speed: 400, fireRate: 100 },
            { name: 'Plunger Launcher', projectile: 'proj_plunger', damage: 2, speed: 180, fireRate: 1000 },
            { name: 'Tickle Ray', projectile: 'proj_tickle', damage: 1, speed: 380, fireRate: 150 }
        ];

        // Create blue team (player's team) on the left - spread across 3 columns
        for (let i = 0; i < this.playersPerTeam; i++) {
            const col = Math.floor(i / 5); // 0, 1, or 2
            const row = i % 5;
            const gridX = col;
            const gridY = 2 + row * 3;
            const player = this.createPlayer(gridX, gridY, 'blue', i);
            this.blueTeam.push(player);
            this.players.push(player);
        }

        // Create red team (AI) on the right - spread across 3 columns
        for (let i = 0; i < this.playersPerTeam; i++) {
            const col = Math.floor(i / 5);
            const row = i % 5;
            const gridX = 27 - col;
            const gridY = 2 + row * 3;
            const player = this.createPlayer(gridX, gridY, 'red', i);
            this.redTeam.push(player);
            this.players.push(player);
        }

        // Select first blue player by default
        this.selectPlayer(this.blueTeam[0]);
    }

    createPlayer(gridX, gridY, team, weaponIndex) {
        const pixelX = gridX * this.tileSize + this.tileSize / 2;
        const pixelY = gridY * this.tileSize + this.tileSize / 2;

        // Use directional soldier sprite
        const direction = team === 'blue' ? 'right' : 'left';
        const textureKey = `soldier_${team}_${direction}`;
        const sprite = this.add.sprite(pixelX, pixelY, textureKey);
        sprite.setInteractive();

        // Direction indicator arrow (smaller for new sprites)
        const arrow = this.add.sprite(pixelX, pixelY - 16, 'direction_arrow');
        arrow.setScale(0.4);

        // Health hearts (smaller and tighter)
        const hearts = [];
        for (let h = 0; h < 3; h++) {
            const heart = this.add.sprite(pixelX - 8 + h * 8, pixelY - 20, 'heart');
            heart.setScale(0.4);
            hearts.push(heart);
        }

        // Selection ring
        const selectionRing = this.add.sprite(pixelX, pixelY, 'selection_ring');
        selectionRing.setVisible(false);

        const player = {
            sprite: sprite,
            arrow: arrow,
            hearts: hearts,
            selectionRing: selectionRing,
            gridX: gridX,
            gridY: gridY,
            team: team,
            health: 3,
            maxHealth: 3,
            weapon: this.weaponTypes[weaponIndex % this.weaponTypes.length],
            direction: direction,
            lastFireTime: 0,
            isAlive: true,
            isMoving: false
        };

        this.updatePlayerSprite(player);
        this.updateArrowDirection(player);

        sprite.on('pointerdown', () => {
            if (team === 'blue' && player.isAlive) {
                this.selectPlayer(player);
            }
        });

        return player;
    }

    updatePlayerSprite(player) {
        // Update the soldier sprite based on direction
        const textureKey = `soldier_${player.team}_${player.direction}`;
        player.sprite.setTexture(textureKey);
    }

    selectPlayer(player) {
        if (this.selectedPlayer) {
            this.selectedPlayer.selectionRing.setVisible(false);
        }

        this.selectedPlayer = player;
        player.selectionRing.setVisible(true);

        if (this.weaponText) {
            this.weaponText.destroy();
        }
        this.weaponText = this.add.text(
            this.gridWidth * this.tileSize / 2,
            this.gridHeight * this.tileSize + 8,
            `Weapon: ${player.weapon.name}`,
            { fontSize: '14px', fill: '#f39c12', fontFamily: 'Comic Sans MS' }
        ).setOrigin(0.5, 0);
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            fire: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        this.lastMoveTime = 0;
        this.moveCooldown = 120; // Slightly faster movement for bigger map
    }

    update(time, delta) {
        this.handleInput(time);
        this.updateAI(time);
        this.updateProjectiles(delta);
        this.updateCongaLine(time);
        this.updatePowerUps(time);
        this.updatePowerUpEffects(time);
    }

    handleInput(time) {
        if (!this.selectedPlayer || !this.selectedPlayer.isAlive) return;
        if (this.selectedPlayer.isMoving) return;

        // Apply speed boost if active (halve cooldown)
        const effectiveCooldown = this.selectedPlayer.speedBoost ? this.moveCooldown / 2 : this.moveCooldown;

        if (time > this.lastMoveTime + effectiveCooldown) {
            let dx = 0, dy = 0;

            if (this.cursors.left.isDown || this.wasd.left.isDown) {
                dx = -1;
            } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
                dx = 1;
            } else if (this.cursors.up.isDown || this.wasd.up.isDown) {
                dy = -1;
            } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
                dy = 1;
            }

            if (dx !== 0 || dy !== 0) {
                this.movePlayer(this.selectedPlayer, dx, dy);
                this.lastMoveTime = time;
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.wasd.fire)) {
            this.fireWeapon(this.selectedPlayer, time);
        }
    }

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

        // Check mountain
        if (this.terrainMap[newGridY][newGridX] === 2) {
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

        // Check if entering mud (slower animation)
        const terrain = this.terrainMap[newGridY][newGridX];
        const inMud = terrain === 3;
        const moveDuration = inMud ? 200 : 80;

        this.tweens.add({
            targets: [player.sprite, player.selectionRing],
            x: newPixelX,
            y: newPixelY,
            duration: moveDuration,
            ease: 'Linear',
            onComplete: () => {
                player.isMoving = false;
                // Check for terrain effects after landing
                this.handleTerrainEffect(player, newGridX, newGridY);
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

        // Show "SQUELCH" when entering mud
        if (inMud) {
            const mudText = this.add.text(newPixelX, newPixelY - 20, 'SQUELCH!', {
                fontSize: '10px', fill: '#6d4c41', fontFamily: 'Comic Sans MS', stroke: '#000', strokeThickness: 1
            }).setOrigin(0.5);

            this.tweens.add({
                targets: mudText,
                y: mudText.y - 20,
                alpha: 0,
                duration: 400,
                onComplete: () => mudText.destroy()
            });
        }

        return true;
    }

    updateArrowDirection(player) {
        switch (player.direction) {
            case 'up':
                player.arrow.setRotation(0);
                break;
            case 'down':
                player.arrow.setRotation(Math.PI);
                break;
            case 'left':
                player.arrow.setRotation(-Math.PI / 2);
                break;
            case 'right':
                player.arrow.setRotation(Math.PI / 2);
                break;
        }
    }

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
        projectile.setScale(0.7); // Slightly smaller projectiles

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

        // Check if shooter is in a trench (affects hit detection)
        const shooterInTrench = this.terrainMap[player.gridY][player.gridX] === 1;

        this.projectiles.push({
            sprite: projectile,
            velocityX: velocityX,
            velocityY: velocityY,
            damage: player.weapon.damage,
            team: player.team,
            firedFromTrench: shooterInTrench,
            active: true
        });
    }

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

            // Check mountain collision
            if (this.terrainMap[gridY] && this.terrainMap[gridY][gridX] === 2) {
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

            // Check player collision
            for (const player of this.players) {
                if (!player.isAlive) continue;
                if (player.team === proj.team) continue;

                const playerPixelX = player.gridX * this.tileSize + this.tileSize / 2;
                const playerPixelY = player.gridY * this.tileSize + this.tileSize / 2;

                const dist = Phaser.Math.Distance.Between(proj.sprite.x, proj.sprite.y, playerPixelX, playerPixelY);

                if (dist < 14) { // Smaller hitbox for smaller sprites
                    // Check trench protection: if target is in trench and shooter wasn't, shot passes over
                    const targetInTrench = this.terrainMap[player.gridY][player.gridX] === 1;

                    if (targetInTrench && !proj.firedFromTrench) {
                        // Shot flies over the player's head! Show a "whoosh" effect
                        this.createMissEffect(proj.sprite.x, proj.sprite.y);
                        // Don't destroy projectile, let it keep going
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

    damagePlayer(player, damage) {
        // Check for shield - blocks the hit
        if (player.hasShield) {
            player.hasShield = false;
            if (player.shieldVisual) {
                // Shield break effect
                const shieldX = player.shieldVisual.x;
                const shieldY = player.shieldVisual.y;
                player.shieldVisual.destroy();
                player.shieldVisual = null;

                // Shield shatter particles
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const shard = this.add.circle(shieldX, shieldY, 4, 0x3498db);
                    this.tweens.add({
                        targets: shard,
                        x: shieldX + Math.cos(angle) * 25,
                        y: shieldY + Math.sin(angle) * 25,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => shard.destroy()
                    });
                }

                // Shield blocked text
                const blockText = this.add.text(shieldX, shieldY - 20, 'BLOCKED!', {
                    fontSize: '12px', fill: '#3498db', fontFamily: 'Comic Sans MS', stroke: '#000', strokeThickness: 2
                }).setOrigin(0.5);

                this.tweens.add({
                    targets: blockText,
                    y: blockText.y - 30,
                    alpha: 0,
                    duration: 600,
                    onComplete: () => blockText.destroy()
                });
            }
            return; // Damage blocked!
        }

        player.health -= damage;

        // Play hit sound
        soundGenerator.playHit();

        for (let h = 0; h < player.maxHealth; h++) {
            if (h < player.health) {
                player.hearts[h].setTexture('heart');
            } else {
                player.hearts[h].setTexture('heart_empty');
            }
        }

        // Flash the player red
        this.tweens.add({
            targets: player.sprite,
            alpha: 0.3,
            duration: 80,
            yoyo: true,
            repeat: 2
        });

        if (player.health <= 0) {
            this.eliminatePlayer(player);
        }
    }

    createHitEffect(x, y) {
        // Colorful star burst
        const colors = [0xf1c40f, 0xe74c3c, 0x9b59b6, 0x3498db, 0x2ecc71];
        for (let i = 0; i < 6; i++) {
            const color = colors[i % colors.length];
            const particle = this.add.star(x, y, 5, 2, 5, color);
            const angle = (i / 6) * Math.PI * 2;
            const speed = 30 + Math.random() * 30;

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0.3,
                rotation: Math.PI,
                duration: 250,
                onComplete: () => particle.destroy()
            });
        }
    }

    createMissEffect(x, y) {
        // "Whoosh" effect - shot flies over head
        const text = this.add.text(x, y - 10, 'WHOOSH!', {
            fontSize: '10px',
            fill: '#ffffff',
            fontFamily: 'Comic Sans MS'
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: y - 30,
            alpha: 0,
            duration: 400,
            onComplete: () => text.destroy()
        });
    }

    eliminatePlayer(player) {
        player.isAlive = false;

        // Play elimination sound
        soundGenerator.playEliminate();

        // Clean up shield visual if present
        if (player.shieldVisual) {
            player.shieldVisual.destroy();
            player.shieldVisual = null;
        }

        if (this.selectedPlayer === player) {
            this.selectedPlayer = null;
            for (const p of this.blueTeam) {
                if (p.isAlive) {
                    this.selectPlayer(p);
                    break;
                }
            }
        }

        // Fun spinning elimination
        this.tweens.add({
            targets: [player.sprite, player.arrow, ...player.hearts, player.selectionRing],
            y: '-=40',
            alpha: 0,
            scale: 0.3,
            angle: 720,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.addToCongaLine(player);
            }
        });

        this.checkWinCondition();
    }

    addToCongaLine(player) {
        const startX = -20;
        const startY = this.gridHeight * this.tileSize + 20;

        // Use the soldier sprite facing right for conga line
        const congaSprite = this.add.sprite(startX, startY, `soldier_${player.team}_right`);
        congaSprite.setScale(0.6);

        this.congaLine.push({
            sprite: congaSprite,
            team: player.team
        });
    }

    updateCongaLine(time) {
        if (this.congaLine.length === 0) return;

        const speed = 40;
        const spacing = 25;
        const pathWidth = this.gridWidth * this.tileSize + 40;
        const pathHeight = this.gridHeight * this.tileSize + 40;

        for (let i = 0; i < this.congaLine.length; i++) {
            const member = this.congaLine[i];

            const offset = (time / 1000 * speed - i * spacing) % (2 * (pathWidth + pathHeight));
            let x, y;

            if (offset < pathWidth) {
                x = offset - 20;
                y = this.gridHeight * this.tileSize + 20;
            } else if (offset < pathWidth + pathHeight) {
                x = pathWidth - 20;
                y = this.gridHeight * this.tileSize + 20 - (offset - pathWidth);
            } else if (offset < 2 * pathWidth + pathHeight) {
                x = pathWidth - 20 - (offset - pathWidth - pathHeight);
                y = this.gridHeight * this.tileSize + 20 - pathHeight;
            } else {
                x = -20;
                y = this.gridHeight * this.tileSize + 20 - pathHeight + (offset - 2 * pathWidth - pathHeight);
            }

            member.sprite.x = x;
            member.sprite.y = y;

            // Dancing bob
            member.sprite.y += Math.sin(time / 80 + i * 0.5) * 4;
            member.sprite.rotation = Math.sin(time / 120 + i * 0.5) * 0.25;
        }
    }

    updateAI(time) {
        // Control AI players - balanced for fair gameplay
        if (!this.aiLastUpdateTime) this.aiLastUpdateTime = 0;
        if (time < this.aiLastUpdateTime + 250) return; // Slower to give humans time to react
        this.aiLastUpdateTime = time;

        const alivePlayers = this.redTeam.filter(p => p.isAlive && !p.isMoving);
        if (alivePlayers.length === 0) return;

        // Update 1-2 AI players per frame - humans need time to switch players
        const numToUpdate = Math.min(2, alivePlayers.length);
        const shuffled = alivePlayers.sort(() => Math.random() - 0.5);

        for (let i = 0; i < numToUpdate; i++) {
            this.updateSingleAI(shuffled[i], time);
        }
    }

    updateSingleAI(player, time) {
        // First priority: if in our own safe zone, move out! Can't shoot from there
        const inOwnSafeZone = player.gridX >= this.redSafeZone.startX && player.gridX <= this.redSafeZone.endX;
        if (inOwnSafeZone) {
            // Move left to exit safe zone
            this.tryMovePlayer(player, -1, 0) || this.tryMovePlayer(player, 0, Math.random() > 0.5 ? 1 : -1);
            return;
        }

        // Find best target - must be alive and NOT in their safe zone
        let bestTarget = null;
        let bestScore = -Infinity;

        for (const blue of this.blueTeam) {
            if (!blue.isAlive) continue;

            // Skip targets in safe zone - can't hit them anyway!
            if (blue.gridX >= this.blueSafeZone.startX && blue.gridX <= this.blueSafeZone.endX) {
                continue;
            }

            const dist = Math.abs(blue.gridX - player.gridX) + Math.abs(blue.gridY - player.gridY);
            const alignedX = blue.gridY === player.gridY;
            const alignedY = blue.gridX === player.gridX;

            // Score: prefer aligned targets, then closer ones
            let score = 100 - dist;
            if (alignedX || alignedY) score += 50;
            if (blue.health === 1) score += 30; // Finish off weak targets

            if (score > bestScore) {
                bestScore = score;
                bestTarget = blue;
            }
        }

        if (!bestTarget) return;

        const dx = bestTarget.gridX - player.gridX;
        const dy = bestTarget.gridY - player.gridY;

        // Check if perfectly aligned for shooting (same row or column)
        const alignedHorizontally = dy === 0;
        const alignedVertically = dx === 0;

        // Determine if we can shoot
        let canShoot = false;
        let shouldTurn = false;
        let targetDirection = player.direction;

        if (alignedHorizontally && dx !== 0) {
            targetDirection = dx < 0 ? 'left' : 'right';
            canShoot = player.direction === targetDirection;
            shouldTurn = !canShoot;
        } else if (alignedVertically && dy !== 0) {
            targetDirection = dy > 0 ? 'down' : 'up';
            canShoot = player.direction === targetDirection;
            shouldTurn = !canShoot;
        }

        // Decide action - be aggressive!
        if (canShoot) {
            // Shoot!
            this.fireWeapon(player, time);
        } else if (shouldTurn) {
            // Turn to face target
            player.direction = targetDirection;
            this.updatePlayerSprite(player);
            this.updateArrowDirection(player);
            // Also try to shoot immediately after turning
            this.fireWeapon(player, time);
        } else {
            // Move toward target aggressively
            let moveX = 0, moveY = 0;

            // Prefer closing distance over getting aligned
            if (Math.random() > 0.4) {
                // Move toward target (close distance)
                moveX = dx < 0 ? -1 : dx > 0 ? 1 : 0;
                if (moveX === 0) {
                    moveY = dy < 0 ? -1 : dy > 0 ? 1 : 0;
                }
            } else {
                // Try to get aligned for a shot
                if (!alignedHorizontally && !alignedVertically) {
                    if (Math.random() > 0.5) {
                        moveY = dy > 0 ? 1 : dy < 0 ? -1 : 0;
                    } else {
                        moveX = dx < 0 ? -1 : dx > 0 ? 1 : 0;
                    }
                }
            }

            // Always try to move if we have a direction
            if (moveX !== 0 || moveY !== 0) {
                if (!this.tryMovePlayer(player, moveX, moveY)) {
                    // If blocked, try alternate direction
                    if (moveX !== 0) {
                        this.tryMovePlayer(player, 0, Math.random() > 0.5 ? 1 : -1);
                    } else {
                        this.tryMovePlayer(player, Math.random() > 0.5 ? 1 : -1, 0);
                    }
                }
            }
        }
    }

    tryMovePlayer(player, dx, dy) {
        // Try to move, return true if successful
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

        // Check mountain
        if (this.terrainMap[newGridY][newGridX] === 2) {
            return false;
        }

        // Check other players
        for (const other of this.players) {
            if (other !== player && other.isAlive && other.gridX === newGridX && other.gridY === newGridY) {
                return false;
            }
        }

        // Move!
        this.movePlayer(player, dx, dy);
        return true;
    }

    updatePowerUps(time) {
        // Spawn new power-ups periodically
        if (time > this.lastPowerUpSpawn + this.powerUpSpawnInterval && this.powerUps.length < this.maxPowerUps) {
            this.spawnPowerUp();
            this.lastPowerUpSpawn = time;
        }

        // Check for collection by players
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];

            for (const player of this.players) {
                if (!player.isAlive) continue;
                if (player.gridX === powerUp.gridX && player.gridY === powerUp.gridY) {
                    this.collectPowerUp(player, powerUp, time);
                    powerUp.sprite.destroy();
                    this.powerUps.splice(i, 1);
                    break;
                }
            }
        }
    }

    spawnPowerUp() {
        // Find a valid spawn location (grass only, not in safe zones)
        const validSpots = [];
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                // Only grass tiles, outside safe zones
                if (this.terrainMap[y][x] !== 0) continue;
                if (x >= this.blueSafeZone.startX && x <= this.blueSafeZone.endX) continue;
                if (x >= this.redSafeZone.startX && x <= this.redSafeZone.endX) continue;

                // Not occupied by player or existing power-up
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
        const types = ['speed', 'shield', 'rapid', 'health'];
        const type = types[Math.floor(Math.random() * types.length)];

        const pixelX = spot.x * this.tileSize + this.tileSize / 2;
        const pixelY = spot.y * this.tileSize + this.tileSize / 2;

        const sprite = this.add.sprite(pixelX, pixelY, `powerup_${type}`);
        sprite.setScale(0.9);

        // Bobbing animation
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

    collectPowerUp(player, powerUp, time) {
        // Visual collection effect
        this.createPowerUpCollectEffect(powerUp.sprite.x, powerUp.sprite.y, powerUp.type);

        switch (powerUp.type) {
            case 'health':
                // Instant heal
                if (player.health < player.maxHealth) {
                    player.health = Math.min(player.health + 1, player.maxHealth);
                    this.updateHealthDisplay(player);
                }
                break;
            case 'speed':
                // Speed boost for 8 seconds
                player.speedBoost = true;
                player.speedBoostEnd = time + 8000;
                this.showPowerUpIndicator(player, 'SPEED!', 0xf1c40f);
                break;
            case 'shield':
                // Shield blocks next hit
                player.hasShield = true;
                this.createShieldVisual(player);
                this.showPowerUpIndicator(player, 'SHIELD!', 0x3498db);
                break;
            case 'rapid':
                // Rapid fire for 8 seconds
                player.rapidFire = true;
                player.rapidFireEnd = time + 8000;
                player.originalFireRate = player.weapon.fireRate;
                player.weapon.fireRate = Math.floor(player.weapon.fireRate / 3);
                this.showPowerUpIndicator(player, 'RAPID!', 0xe74c3c);
                break;
        }
    }

    createPowerUpCollectEffect(x, y, type) {
        const colors = {
            speed: 0xf1c40f,
            shield: 0x3498db,
            rapid: 0xe74c3c,
            health: 0x2ecc71
        };
        const color = colors[type] || 0xffffff;

        // Sparkle burst
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

    showPowerUpIndicator(player, text, color) {
        const indicator = this.add.text(
            player.sprite.x,
            player.sprite.y - 30,
            text,
            { fontSize: '12px', fill: '#' + color.toString(16), fontFamily: 'Comic Sans MS', stroke: '#000', strokeThickness: 2 }
        ).setOrigin(0.5);

        this.tweens.add({
            targets: indicator,
            y: player.sprite.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => indicator.destroy()
        });
    }

    createShieldVisual(player) {
        // Shield ring around player
        const shield = this.add.circle(player.sprite.x, player.sprite.y, 16, 0x3498db, 0.3);
        shield.setStrokeStyle(2, 0x3498db);
        player.shieldVisual = shield;
    }

    updateHealthDisplay(player) {
        for (let h = 0; h < player.maxHealth; h++) {
            if (h < player.health) {
                player.hearts[h].setTexture('heart');
            } else {
                player.hearts[h].setTexture('heart_empty');
            }
        }
    }

    updatePowerUpEffects(time) {
        for (const player of this.players) {
            if (!player.isAlive) continue;

            // Update shield visual position
            if (player.shieldVisual) {
                player.shieldVisual.x = player.sprite.x;
                player.shieldVisual.y = player.sprite.y;
            }

            // Check speed boost expiration
            if (player.speedBoost && time > player.speedBoostEnd) {
                player.speedBoost = false;
            }

            // Check rapid fire expiration
            if (player.rapidFire && time > player.rapidFireEnd) {
                player.rapidFire = false;
                player.weapon.fireRate = player.originalFireRate;
            }
        }
    }

    handleTerrainEffect(player, gridX, gridY) {
        const terrain = this.terrainMap[gridY][gridX];

        // Bounce pad - launch player
        if (terrain === 4) {
            this.launchPlayer(player);
            return true;
        }

        // Teleporter - warp to other portal
        if (terrain === 5) {
            this.teleportPlayer(player, gridX, gridY);
            return true;
        }

        return false;
    }

    launchPlayer(player) {
        // Find landing spot 3 squares in facing direction
        let dx = 0, dy = 0;
        switch (player.direction) {
            case 'up': dy = -3; break;
            case 'down': dy = 3; break;
            case 'left': dx = -3; break;
            case 'right': dx = 3; break;
        }

        let targetX = player.gridX + dx;
        let targetY = player.gridY + dy;

        // Clamp to bounds and find valid landing
        targetX = Math.max(0, Math.min(this.gridWidth - 1, targetX));
        targetY = Math.max(0, Math.min(this.gridHeight - 1, targetY));

        // Check for obstacles and find nearest valid spot
        while ((this.terrainMap[targetY][targetX] === 2 || this.isOccupied(targetX, targetY, player)) &&
               (targetX !== player.gridX || targetY !== player.gridY)) {
            if (dx > 0) targetX--;
            else if (dx < 0) targetX++;
            else if (dy > 0) targetY--;
            else if (dy < 0) targetY++;
        }

        // Don't launch into safe zones
        if (player.team === 'blue' && targetX >= this.redSafeZone.startX) {
            targetX = this.redSafeZone.startX - 1;
        }
        if (player.team === 'red' && targetX <= this.blueSafeZone.endX) {
            targetX = this.blueSafeZone.endX + 1;
        }

        player.gridX = targetX;
        player.gridY = targetY;

        const newPixelX = targetX * this.tileSize + this.tileSize / 2;
        const newPixelY = targetY * this.tileSize + this.tileSize / 2;

        // Bouncy arc animation
        this.tweens.add({
            targets: [player.sprite, player.selectionRing],
            x: newPixelX,
            y: newPixelY,
            duration: 300,
            ease: 'Bounce.easeOut'
        });

        this.tweens.add({
            targets: player.arrow,
            x: newPixelX,
            y: newPixelY - 16,
            duration: 300,
            ease: 'Bounce.easeOut'
        });

        for (let h = 0; h < player.hearts.length; h++) {
            this.tweens.add({
                targets: player.hearts[h],
                x: newPixelX - 8 + h * 8,
                y: newPixelY - 20,
                duration: 300,
                ease: 'Bounce.easeOut'
            });
        }

        // Boing text
        const boingText = this.add.text(player.sprite.x, player.sprite.y - 20, 'BOING!', {
            fontSize: '14px', fill: '#f39c12', fontFamily: 'Comic Sans MS', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: boingText,
            y: boingText.y - 30,
            alpha: 0,
            duration: 500,
            onComplete: () => boingText.destroy()
        });
    }

    teleportPlayer(player, fromX, fromY) {
        // Find the other teleporter
        let targetTeleporter = null;
        for (const tp of this.teleporterPair) {
            if (tp.x !== fromX || tp.y !== fromY) {
                targetTeleporter = tp;
                break;
            }
        }

        if (!targetTeleporter) return;

        // Find adjacent empty spot near destination
        const adjacentOffsets = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];

        let landingX = targetTeleporter.x;
        let landingY = targetTeleporter.y;

        for (const offset of adjacentOffsets) {
            const checkX = targetTeleporter.x + offset.dx;
            const checkY = targetTeleporter.y + offset.dy;
            if (checkX >= 0 && checkX < this.gridWidth && checkY >= 0 && checkY < this.gridHeight) {
                if (this.terrainMap[checkY][checkX] !== 2 && !this.isOccupied(checkX, checkY, player)) {
                    // Check safe zones
                    if (player.team === 'blue' && checkX >= this.redSafeZone.startX) continue;
                    if (player.team === 'red' && checkX <= this.blueSafeZone.endX) continue;
                    landingX = checkX;
                    landingY = checkY;
                    break;
                }
            }
        }

        player.gridX = landingX;
        player.gridY = landingY;

        const newPixelX = landingX * this.tileSize + this.tileSize / 2;
        const newPixelY = landingY * this.tileSize + this.tileSize / 2;

        // Teleport effect - flash and appear
        player.sprite.setAlpha(0);
        player.arrow.setAlpha(0);
        player.hearts.forEach(h => h.setAlpha(0));

        // Move instantly
        player.sprite.x = newPixelX;
        player.sprite.y = newPixelY;
        player.arrow.x = newPixelX;
        player.arrow.y = newPixelY - 16;
        player.selectionRing.x = newPixelX;
        player.selectionRing.y = newPixelY;
        for (let h = 0; h < player.hearts.length; h++) {
            player.hearts[h].x = newPixelX - 8 + h * 8;
            player.hearts[h].y = newPixelY - 20;
        }

        // Fade in
        this.tweens.add({
            targets: [player.sprite, player.arrow, ...player.hearts],
            alpha: 1,
            duration: 200
        });

        // Warp text
        const warpText = this.add.text(newPixelX, newPixelY - 20, 'WARP!', {
            fontSize: '14px', fill: '#9b59b6', fontFamily: 'Comic Sans MS', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: warpText,
            y: warpText.y - 30,
            alpha: 0,
            duration: 500,
            onComplete: () => warpText.destroy()
        });
    }

    isOccupied(gridX, gridY, excludePlayer) {
        for (const p of this.players) {
            if (p !== excludePlayer && p.isAlive && p.gridX === gridX && p.gridY === gridY) {
                return true;
            }
        }
        return false;
    }

    checkWinCondition() {
        const blueAlive = this.blueTeam.filter(p => p.isAlive).length;
        const redAlive = this.redTeam.filter(p => p.isAlive).length;

        if (blueAlive === 0) {
            this.showGameOver('Red Team Wins!', 0xe74c3c);
        } else if (redAlive === 0) {
            this.showGameOver('Blue Team Wins!', 0x3498db);
        }
    }

    showGameOver(message, color) {
        // Play victory fanfare
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

        const restartBtn = this.add.text(
            this.gridWidth * this.tileSize / 2,
            this.gridHeight * this.tileSize / 2 + 30,
            'Click to Play Again!',
            {
                fontSize: '20px',
                fill: '#f1c40f',
                fontFamily: 'Comic Sans MS'
            }
        ).setOrigin(0.5).setInteractive();

        restartBtn.on('pointerdown', () => {
            this.scene.restart();
        });

        restartBtn.on('pointerover', () => {
            restartBtn.setScale(1.1);
        });

        restartBtn.on('pointerout', () => {
            restartBtn.setScale(1);
        });
    }
}
