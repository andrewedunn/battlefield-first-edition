// ABOUTME: Main gameplay scene for Battlefield First Edition
// ABOUTME: Handles the battlefield grid, players, combat, and game logic

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Grid configuration
        this.gridWidth = 20;
        this.gridHeight = 14;
        this.tileSize = 40;

        // Safe zone columns (2 columns on each side)
        this.blueSafeZone = { startX: 0, endX: 1 };
        this.redSafeZone = { startX: 18, endX: 19 };

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
        // Generate the terrain map
        this.generateTerrain();

        // Draw the battlefield
        this.drawBattlefield();

        // Create players
        this.createPlayers();

        // Set up input
        this.setupInput();

        // Instructions text at top
        this.add.text(this.gridWidth * this.tileSize / 2, 10, 'Click a player to select, WASD/Arrows to move, Space to shoot!', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Comic Sans MS'
        }).setOrigin(0.5, 0);
    }

    generateTerrain() {
        // Initialize all grass
        for (let y = 0; y < this.gridHeight; y++) {
            this.terrainMap[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.terrainMap[y][x] = 0; // grass
            }
        }

        // Add trenches (horizontal lines for cover)
        // Trench 1: rows 4-5, columns 4-7
        for (let x = 4; x <= 7; x++) {
            this.terrainMap[4][x] = 1;
            this.terrainMap[5][x] = 1;
        }

        // Trench 2: rows 4-5, columns 12-15
        for (let x = 12; x <= 15; x++) {
            this.terrainMap[4][x] = 1;
            this.terrainMap[5][x] = 1;
        }

        // Trench 3: rows 8-9, columns 6-9
        for (let x = 6; x <= 9; x++) {
            this.terrainMap[8][x] = 1;
            this.terrainMap[9][x] = 1;
        }

        // Trench 4: rows 8-9, columns 10-13
        for (let x = 10; x <= 13; x++) {
            this.terrainMap[8][x] = 1;
            this.terrainMap[9][x] = 1;
        }

        // Add mountains (scattered for cover)
        const mountainPositions = [
            { x: 5, y: 2 }, { x: 14, y: 2 },
            { x: 8, y: 6 }, { x: 11, y: 6 },
            { x: 6, y: 11 }, { x: 13, y: 11 },
            { x: 9, y: 3 }, { x: 10, y: 10 }
        ];

        for (const pos of mountainPositions) {
            this.terrainMap[pos.y][pos.x] = 2;
        }
    }

    drawBattlefield() {
        // Draw terrain tiles
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const pixelX = x * this.tileSize;
                const pixelY = y * this.tileSize;

                // Base terrain
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
        // Weapon types with their properties
        this.weaponTypes = [
            { name: 'Banana Blaster', projectile: 'proj_banana', damage: 1, speed: 300, fireRate: 500 },
            { name: 'Water Balloon', projectile: 'proj_balloon', damage: 2, speed: 200, fireRate: 800 },
            { name: 'Confetti Cannon', projectile: 'proj_confetti', damage: 1, speed: 400, fireRate: 200 },
            { name: 'Rubber Chicken', projectile: 'proj_chicken', damage: 1, speed: 250, fireRate: 600 },
            { name: 'Pie Thrower', projectile: 'proj_pie', damage: 1, speed: 280, fireRate: 550 },
            { name: 'Bubble Gun', projectile: 'proj_balloon', damage: 1, speed: 350, fireRate: 400 },
            { name: 'Snowball', projectile: 'proj_balloon', damage: 1, speed: 320, fireRate: 450 },
            { name: 'Silly String', projectile: 'proj_confetti', damage: 1, speed: 500, fireRate: 100 },
            { name: 'Plunger', projectile: 'proj_chicken', damage: 2, speed: 200, fireRate: 1000 },
            { name: 'Tickle Ray', projectile: 'proj_confetti', damage: 1, speed: 450, fireRate: 150 }
        ];

        // Create blue team (player's team) on the left
        for (let i = 0; i < 10; i++) {
            const gridX = i < 5 ? 0 : 1;
            const gridY = 2 + (i % 5) * 2;
            const player = this.createPlayer(gridX, gridY, 'blue', i);
            this.blueTeam.push(player);
            this.players.push(player);
        }

        // Create red team (AI) on the right
        for (let i = 0; i < 10; i++) {
            const gridX = i < 5 ? 19 : 18;
            const gridY = 2 + (i % 5) * 2;
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

        const textureKey = team === 'blue' ? 'player_blue' : 'player_red';
        const sprite = this.add.sprite(pixelX, pixelY, textureKey);
        sprite.setInteractive();

        // Direction indicator
        const arrow = this.add.sprite(pixelX, pixelY - 20, 'direction_arrow');
        arrow.setScale(0.5);

        // Health hearts
        const hearts = [];
        for (let h = 0; h < 3; h++) {
            const heart = this.add.sprite(pixelX - 12 + h * 12, pixelY - 28, 'heart');
            heart.setScale(0.6);
            hearts.push(heart);
        }

        // Selection ring (hidden by default)
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
            direction: team === 'blue' ? 'right' : 'left',
            lastFireTime: 0,
            isAlive: true,
            isMoving: false
        };

        // Update arrow rotation based on direction
        this.updateArrowDirection(player);

        // Click handler
        sprite.on('pointerdown', () => {
            if (team === 'blue' && player.isAlive) {
                this.selectPlayer(player);
            }
        });

        return player;
    }

    selectPlayer(player) {
        // Deselect previous
        if (this.selectedPlayer) {
            this.selectedPlayer.selectionRing.setVisible(false);
        }

        // Select new player
        this.selectedPlayer = player;
        player.selectionRing.setVisible(true);

        // Show weapon name
        if (this.weaponText) {
            this.weaponText.destroy();
        }
        this.weaponText = this.add.text(
            this.gridWidth * this.tileSize / 2,
            this.gridHeight * this.tileSize + 10,
            `Weapon: ${player.weapon.name}`,
            { fontSize: '16px', fill: '#f39c12', fontFamily: 'Comic Sans MS' }
        ).setOrigin(0.5, 0);
    }

    setupInput() {
        // Keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            fire: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        // Movement cooldown
        this.lastMoveTime = 0;
        this.moveCooldown = 150; // ms between moves
    }

    update(time, delta) {
        // Handle player input
        this.handleInput(time);

        // Update AI
        this.updateAI(time);

        // Update projectiles
        this.updateProjectiles(delta);

        // Update conga line
        this.updateCongaLine(time);
    }

    handleInput(time) {
        if (!this.selectedPlayer || !this.selectedPlayer.isAlive) return;
        if (this.selectedPlayer.isMoving) return;

        // Movement
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

        // Shooting
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

        // Check if it's enemy safe zone
        if (player.team === 'blue' && newGridX >= this.redSafeZone.startX && newGridX <= this.redSafeZone.endX) {
            return;
        }
        if (player.team === 'red' && newGridX >= this.blueSafeZone.startX && newGridX <= this.blueSafeZone.endX) {
            return;
        }

        // Check for mountain (blocks movement)
        if (this.terrainMap[newGridY][newGridX] === 2) {
            return;
        }

        // Check for other players
        for (const other of this.players) {
            if (other !== player && other.isAlive && other.gridX === newGridX && other.gridY === newGridY) {
                return;
            }
        }

        // Update direction based on movement
        if (dx === 1) player.direction = 'right';
        else if (dx === -1) player.direction = 'left';
        else if (dy === -1) player.direction = 'up';
        else if (dy === 1) player.direction = 'down';

        this.updateArrowDirection(player);

        // Move the player
        player.isMoving = true;
        player.gridX = newGridX;
        player.gridY = newGridY;

        const newPixelX = newGridX * this.tileSize + this.tileSize / 2;
        const newPixelY = newGridY * this.tileSize + this.tileSize / 2;

        // Animate movement
        this.tweens.add({
            targets: [player.sprite, player.selectionRing],
            x: newPixelX,
            y: newPixelY,
            duration: 100,
            ease: 'Linear',
            onComplete: () => {
                player.isMoving = false;
            }
        });

        // Move arrow and hearts with player
        this.tweens.add({
            targets: player.arrow,
            x: newPixelX,
            y: newPixelY - 20,
            duration: 100,
            ease: 'Linear'
        });

        for (let h = 0; h < player.hearts.length; h++) {
            this.tweens.add({
                targets: player.hearts[h],
                x: newPixelX - 12 + h * 12,
                y: newPixelY - 28,
                duration: 100,
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
            return; // Still cooling down
        }

        player.lastFireTime = time;

        // Create projectile
        const pixelX = player.sprite.x;
        const pixelY = player.sprite.y;

        const projectile = this.add.sprite(pixelX, pixelY, player.weapon.projectile);

        let velocityX = 0, velocityY = 0;
        switch (player.direction) {
            case 'up':
                velocityY = -player.weapon.speed;
                break;
            case 'down':
                velocityY = player.weapon.speed;
                break;
            case 'left':
                velocityX = -player.weapon.speed;
                projectile.setFlipX(true);
                break;
            case 'right':
                velocityX = player.weapon.speed;
                break;
        }

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

            // Move projectile
            proj.sprite.x += proj.velocityX * deltaSeconds;
            proj.sprite.y += proj.velocityY * deltaSeconds;

            // Get grid position
            const gridX = Math.floor(proj.sprite.x / this.tileSize);
            const gridY = Math.floor(proj.sprite.y / this.tileSize);

            // Check bounds
            if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) {
                proj.sprite.destroy();
                proj.active = false;
                continue;
            }

            // Check for mountain collision
            if (this.terrainMap[gridY] && this.terrainMap[gridY][gridX] === 2) {
                this.createHitEffect(proj.sprite.x, proj.sprite.y);
                proj.sprite.destroy();
                proj.active = false;
                continue;
            }

            // Check safe zone (projectiles can't enter enemy safe zone)
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
                if (player.team === proj.team) continue; // Don't hit teammates

                const playerPixelX = player.gridX * this.tileSize + this.tileSize / 2;
                const playerPixelY = player.gridY * this.tileSize + this.tileSize / 2;

                const dist = Phaser.Math.Distance.Between(proj.sprite.x, proj.sprite.y, playerPixelX, playerPixelY);

                if (dist < 20) {
                    // Hit!
                    this.damagePlayer(player, proj.damage);
                    this.createHitEffect(proj.sprite.x, proj.sprite.y);
                    proj.sprite.destroy();
                    proj.active = false;
                    break;
                }
            }
        }

        // Clean up inactive projectiles
        this.projectiles = this.projectiles.filter(p => p.active);
    }

    damagePlayer(player, damage) {
        player.health -= damage;

        // Update hearts display
        for (let h = 0; h < player.maxHealth; h++) {
            if (h < player.health) {
                player.hearts[h].setTexture('heart');
            } else {
                player.hearts[h].setTexture('heart_empty');
            }
        }

        // Flash the player
        this.tweens.add({
            targets: player.sprite,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 2
        });

        if (player.health <= 0) {
            this.eliminatePlayer(player);
        }
    }

    createHitEffect(x, y) {
        // Simple particle burst
        const particles = [];
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(x, y, 4, 0xf1c40f);
            const angle = (i / 8) * Math.PI * 2;
            const speed = 50 + Math.random() * 50;

            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scale: 0.5,
                duration: 300,
                onComplete: () => particle.destroy()
            });
        }
    }

    eliminatePlayer(player) {
        player.isAlive = false;

        // If this was the selected player, deselect
        if (this.selectedPlayer === player) {
            this.selectedPlayer = null;
            // Select next alive blue player
            for (const p of this.blueTeam) {
                if (p.isAlive) {
                    this.selectPlayer(p);
                    break;
                }
            }
        }

        // Fun elimination animation
        this.tweens.add({
            targets: [player.sprite, player.arrow, ...player.hearts, player.selectionRing],
            y: '-=50',
            alpha: 0,
            scale: 0.5,
            angle: 360,
            duration: 500,
            ease: 'Back.easeIn',
            onComplete: () => {
                // Add to conga line
                this.addToCongaLine(player);
            }
        });

        // Check win condition
        this.checkWinCondition();
    }

    addToCongaLine(player) {
        const congaIndex = this.congaLine.length;

        // Create a new sprite for the conga line (smaller, dancing)
        const startX = -20;
        const startY = this.gridHeight * this.tileSize + 30;

        const congaSprite = this.add.sprite(startX, startY, player.team === 'blue' ? 'player_blue' : 'player_red');
        congaSprite.setScale(0.7);

        this.congaLine.push({
            sprite: congaSprite,
            team: player.team,
            congaIndex: congaIndex,
            angle: 0
        });
    }

    updateCongaLine(time) {
        if (this.congaLine.length === 0) return;

        const speed = 50;
        const spacing = 30;
        const pathWidth = this.gridWidth * this.tileSize + 40;
        const pathHeight = this.gridHeight * this.tileSize + 60;

        for (let i = 0; i < this.congaLine.length; i++) {
            const member = this.congaLine[i];

            // Calculate position along the path
            const offset = (time / 1000 * speed - i * spacing) % (2 * (pathWidth + pathHeight));
            let x, y;

            if (offset < pathWidth) {
                // Top edge (moving right)
                x = offset - 20;
                y = this.gridHeight * this.tileSize + 30;
            } else if (offset < pathWidth + pathHeight) {
                // Right edge (moving up)
                x = pathWidth - 20;
                y = this.gridHeight * this.tileSize + 30 - (offset - pathWidth);
            } else if (offset < 2 * pathWidth + pathHeight) {
                // Bottom edge going back (actually top of screen, moving left)
                x = pathWidth - 20 - (offset - pathWidth - pathHeight);
                y = this.gridHeight * this.tileSize + 30 - pathHeight;
            } else {
                // Left edge (moving down)
                x = -20;
                y = this.gridHeight * this.tileSize + 30 - pathHeight + (offset - 2 * pathWidth - pathHeight);
            }

            member.sprite.x = x;
            member.sprite.y = y;

            // Dance animation (bobbing)
            member.sprite.y += Math.sin(time / 100 + i) * 3;
            member.sprite.rotation = Math.sin(time / 150 + i) * 0.2;
        }
    }

    updateAI(time) {
        // Simple AI: randomly select a player, move toward enemies, shoot when facing one

        if (!this.aiSelectedPlayer || !this.aiSelectedPlayer.isAlive) {
            // Select a random alive red player
            const alivePlayers = this.redTeam.filter(p => p.isAlive);
            if (alivePlayers.length === 0) return;
            this.aiSelectedPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
        }

        // AI move cooldown
        if (!this.aiLastMoveTime) this.aiLastMoveTime = 0;
        if (time < this.aiLastMoveTime + 300) return;

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

        // Decide action: shoot if facing enemy, otherwise move toward them
        const dx = nearestBlue.gridX - player.gridX;
        const dy = nearestBlue.gridY - player.gridY;

        // Check if facing the enemy and can shoot
        let canShoot = false;
        if (player.direction === 'left' && dx < 0 && Math.abs(dy) <= 1) canShoot = true;
        if (player.direction === 'right' && dx > 0 && Math.abs(dy) <= 1) canShoot = true;
        if (player.direction === 'up' && dy < 0 && Math.abs(dx) <= 1) canShoot = true;
        if (player.direction === 'down' && dy > 0 && Math.abs(dx) <= 1) canShoot = true;

        if (canShoot && Math.random() > 0.3) {
            this.fireWeapon(player, time);
        } else {
            // Move toward enemy
            let moveX = 0, moveY = 0;

            if (Math.random() > 0.5) {
                // Prioritize X movement
                if (dx < 0) moveX = -1;
                else if (dx > 0) moveX = 1;
                else if (dy < 0) moveY = -1;
                else if (dy > 0) moveY = 1;
            } else {
                // Prioritize Y movement
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

        // Occasionally switch to a different player
        if (Math.random() < 0.01) {
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
        // Darken the screen
        const overlay = this.add.rectangle(
            this.gridWidth * this.tileSize / 2,
            this.gridHeight * this.tileSize / 2,
            this.gridWidth * this.tileSize,
            this.gridHeight * this.tileSize,
            0x000000,
            0.7
        );

        // Show message
        const text = this.add.text(
            this.gridWidth * this.tileSize / 2,
            this.gridHeight * this.tileSize / 2 - 30,
            message,
            {
                fontSize: '48px',
                fill: '#' + color.toString(16),
                fontFamily: 'Comic Sans MS',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5);

        // Add restart button
        const restartBtn = this.add.text(
            this.gridWidth * this.tileSize / 2,
            this.gridHeight * this.tileSize / 2 + 40,
            'Click to Play Again!',
            {
                fontSize: '24px',
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
