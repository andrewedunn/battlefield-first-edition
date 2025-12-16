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

        // Safe zone columns (2 columns on each side)
        this.blueSafeZone = { startX: 0, endX: 1 };
        this.redSafeZone = { startX: 26, endX: 27 };

        // Game state
        this.players = [];
        this.selectedPlayer = null;
        this.projectiles = [];

        // Teams
        this.blueTeam = [];
        this.redTeam = [];

        // Conga line for eliminated players
        this.congaLine = [];

        // Terrain map (0 = grass, 1 = trench, 2 = mountain)
        this.terrainMap = [];
    }

    create() {
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
    }

    drawBattlefield() {
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const pixelX = x * this.tileSize;
                const pixelY = y * this.tileSize;

                let tileKey = 'tile_grass';
                if (this.terrainMap[y][x] === 1) {
                    tileKey = 'tile_trench';
                } else if (this.terrainMap[y][x] === 2) {
                    tileKey = 'tile_mountain';
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

        // Create blue team (player's team) on the left - spread across the safe zone
        for (let i = 0; i < 10; i++) {
            const gridX = i < 5 ? 0 : 1;
            const gridY = 2 + (i % 5) * 3; // More spread out vertically
            const player = this.createPlayer(gridX, gridY, 'blue', i);
            this.blueTeam.push(player);
            this.players.push(player);
        }

        // Create red team (AI) on the right
        for (let i = 0; i < 10; i++) {
            const gridX = i < 5 ? 27 : 26;
            const gridY = 2 + (i % 5) * 3;
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
    }

    handleInput(time) {
        if (!this.selectedPlayer || !this.selectedPlayer.isAlive) return;
        if (this.selectedPlayer.isMoving) return;

        if (time > this.lastMoveTime + this.moveCooldown) {
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
            return;
        }

        // Check enemy safe zone
        if (player.team === 'blue' && newGridX >= this.redSafeZone.startX && newGridX <= this.redSafeZone.endX) {
            return;
        }
        if (player.team === 'red' && newGridX >= this.blueSafeZone.startX && newGridX <= this.blueSafeZone.endX) {
            return;
        }

        // Check mountain
        if (this.terrainMap[newGridY][newGridX] === 2) {
            return;
        }

        // Check other players
        for (const other of this.players) {
            if (other !== player && other.isAlive && other.gridX === newGridX && other.gridY === newGridY) {
                return;
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

        this.tweens.add({
            targets: [player.sprite, player.selectionRing],
            x: newPixelX,
            y: newPixelY,
            duration: 80,
            ease: 'Linear',
            onComplete: () => {
                player.isMoving = false;
            }
        });

        this.tweens.add({
            targets: player.arrow,
            x: newPixelX,
            y: newPixelY - 16,
            duration: 80,
            ease: 'Linear'
        });

        for (let h = 0; h < player.hearts.length; h++) {
            this.tweens.add({
                targets: player.hearts[h],
                x: newPixelX - 8 + h * 8,
                y: newPixelY - 20,
                duration: 80,
                ease: 'Linear'
            });
        }
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

        player.lastFireTime = time;

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

        this.projectiles.push({
            sprite: projectile,
            velocityX: velocityX,
            velocityY: velocityY,
            damage: player.weapon.damage,
            team: player.team,
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
        player.health -= damage;

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

    eliminatePlayer(player) {
        player.isAlive = false;

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
        if (!this.aiSelectedPlayer || !this.aiSelectedPlayer.isAlive) {
            const alivePlayers = this.redTeam.filter(p => p.isAlive);
            if (alivePlayers.length === 0) return;
            this.aiSelectedPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        }

        if (!this.aiLastMoveTime) this.aiLastMoveTime = 0;
        if (time < this.aiLastMoveTime + 250) return;

        const player = this.aiSelectedPlayer;

        // Find nearest blue player
        let nearestBlue = null;
        let nearestDist = Infinity;
        for (const blue of this.blueTeam) {
            if (!blue.isAlive) continue;
            const dist = Math.abs(blue.gridX - player.gridX) + Math.abs(blue.gridY - player.gridY);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestBlue = blue;
            }
        }

        if (!nearestBlue) return;

        const dx = nearestBlue.gridX - player.gridX;
        const dy = nearestBlue.gridY - player.gridY;

        // Check if can shoot
        let canShoot = false;
        if (player.direction === 'left' && dx < 0 && Math.abs(dy) <= 1) canShoot = true;
        if (player.direction === 'right' && dx > 0 && Math.abs(dy) <= 1) canShoot = true;
        if (player.direction === 'up' && dy < 0 && Math.abs(dx) <= 1) canShoot = true;
        if (player.direction === 'down' && dy > 0 && Math.abs(dx) <= 1) canShoot = true;

        if (canShoot && Math.random() > 0.4) {
            this.fireWeapon(player, time);
        } else {
            let moveX = 0, moveY = 0;

            if (Math.random() > 0.5) {
                if (dx < 0) moveX = -1;
                else if (dx > 0) moveX = 1;
                else if (dy < 0) moveY = -1;
                else if (dy > 0) moveY = 1;
            } else {
                if (dy < 0) moveY = -1;
                else if (dy > 0) moveY = 1;
                else if (dx < 0) moveX = -1;
                else if (dx > 0) moveX = 1;
            }

            if (moveX !== 0 || moveY !== 0) {
                this.movePlayer(player, moveX, moveY);
                this.aiLastMoveTime = time;
            }
        }

        // Switch players occasionally
        if (Math.random() < 0.015) {
            this.aiSelectedPlayer = null;
        }
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
