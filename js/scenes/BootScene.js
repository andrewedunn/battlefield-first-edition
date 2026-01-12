// ABOUTME: Boot scene for loading game assets before gameplay begins
// ABOUTME: Creates detailed soldier sprites and weapon projectiles programmatically

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
        this.tileSize = 28; // Smaller tiles for bigger battlefield
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Recruiting Soldiers...', {
            fontSize: '32px',
            fill: '#f39c12',
            fontFamily: 'Comic Sans MS'
        });
        loadingText.setOrigin(0.5);

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xf39c12, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 + 5, 300 * value, 20);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    create() {
        this.createSoldierSprites();
        this.createTerrainTiles();
        this.createProjectileSprites();
        this.createUISprites();
        this.createPowerUpSprites();
        this.createSpecialTerrainSprites();
        this.createCityTerrainSprites();
        this.createCityPowerUpSprites();
        this.createRatSprites();
        this.createPizzeriaSprite();
        this.createSkyBattleSprites();
        this.scene.start('LevelSelectScene');
    }

    createSoldierSprites() {
        // Create soldiers for both teams facing each direction
        const teams = [
            { name: 'blue', bodyColor: 0x3498db, uniformColor: 0x2980b9, helmetColor: 0x1a5276 },
            { name: 'red', bodyColor: 0xe74c3c, uniformColor: 0xc0392b, helmetColor: 0x922b21 }
        ];

        const directions = ['right', 'left', 'up', 'down'];

        for (const team of teams) {
            for (const dir of directions) {
                this.createSoldier(team, dir);
            }
        }

        // Selection ring
        const ringG = this.make.graphics({ x: 0, y: 0, add: false });
        ringG.lineStyle(2, 0xf1c40f);
        ringG.strokeCircle(14, 14, 13);
        ringG.lineStyle(1, 0xffffff);
        ringG.strokeCircle(14, 14, 11);
        ringG.generateTexture('selection_ring', 28, 28);
        ringG.destroy();
    }

    createSoldier(team, direction) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const size = 28;
        const cx = size / 2;
        const cy = size / 2;

        // Skin color
        const skinColor = 0xfdbf6f;
        const skinDark = 0xe5a84b;

        // Draw based on direction
        if (direction === 'right' || direction === 'left') {
            const flip = direction === 'left';
            const facing = flip ? -1 : 1;
            const offsetX = flip ? size : 0;

            // Legs (brown boots)
            g.fillStyle(0x5d4037, 1);
            g.fillRect(flip ? 16 : 8, 20, 4, 6); // back leg
            g.fillRect(flip ? 10 : 14, 20, 4, 6); // front leg

            // Body (uniform)
            g.fillStyle(team.uniformColor, 1);
            g.fillRoundedRect(9, 10, 10, 12, 2);

            // Body highlight
            g.fillStyle(team.bodyColor, 1);
            g.fillRoundedRect(10, 11, 8, 10, 2);

            // Arm holding weapon (back arm)
            g.fillStyle(team.uniformColor, 1);
            g.fillRect(flip ? 17 : 6, 12, 5, 4);

            // Head
            g.fillStyle(skinColor, 1);
            g.fillCircle(cx, 8, 5);

            // Helmet
            g.fillStyle(team.helmetColor, 1);
            g.fillRect(9, 2, 10, 6);
            g.fillRect(8, 5, 12, 3);

            // Eye
            g.fillStyle(0x000000, 1);
            g.fillCircle(flip ? 11 : 17, 7, 1);

            // Weapon in front arm
            this.drawWeaponOnSoldier(g, team, direction);

        } else if (direction === 'up') {
            // Back view - soldier facing away

            // Legs
            g.fillStyle(0x5d4037, 1);
            g.fillRect(10, 20, 3, 6);
            g.fillRect(15, 20, 3, 6);

            // Body
            g.fillStyle(team.uniformColor, 1);
            g.fillRoundedRect(9, 10, 10, 12, 2);
            g.fillStyle(team.bodyColor, 1);
            g.fillRoundedRect(10, 11, 8, 10, 2);

            // Back of head
            g.fillStyle(skinDark, 1);
            g.fillCircle(cx, 8, 5);

            // Helmet from back
            g.fillStyle(team.helmetColor, 1);
            g.fillRect(9, 2, 10, 7);

            // Backpack/gear
            g.fillStyle(0x6d4c41, 1);
            g.fillRect(11, 12, 6, 5);

        } else if (direction === 'down') {
            // Front view - soldier facing toward us

            // Legs
            g.fillStyle(0x5d4037, 1);
            g.fillRect(10, 20, 3, 6);
            g.fillRect(15, 20, 3, 6);

            // Body
            g.fillStyle(team.uniformColor, 1);
            g.fillRoundedRect(9, 10, 10, 12, 2);
            g.fillStyle(team.bodyColor, 1);
            g.fillRoundedRect(10, 11, 8, 10, 2);

            // Arms at sides
            g.fillStyle(team.uniformColor, 1);
            g.fillRect(5, 12, 4, 6);
            g.fillRect(19, 12, 4, 6);

            // Hands
            g.fillStyle(skinColor, 1);
            g.fillCircle(7, 19, 2);
            g.fillCircle(21, 19, 2);

            // Head
            g.fillStyle(skinColor, 1);
            g.fillCircle(cx, 8, 5);

            // Helmet
            g.fillStyle(team.helmetColor, 1);
            g.fillRect(9, 1, 10, 6);
            g.fillRect(8, 4, 12, 3);

            // Eyes
            g.fillStyle(0x000000, 1);
            g.fillCircle(12, 7, 1);
            g.fillCircle(16, 7, 1);

            // Smile
            g.lineStyle(1, 0x000000);
            g.beginPath();
            g.arc(cx, 10, 2, 0.2, Math.PI - 0.2);
            g.strokePath();
        }

        g.generateTexture(`soldier_${team.name}_${direction}`, size, size);
        g.destroy();
    }

    drawWeaponOnSoldier(g, team, direction) {
        const flip = direction === 'left';

        // Draw a generic weapon shape (gun-like)
        // Front arm
        g.fillStyle(team.uniformColor, 1);
        g.fillRect(flip ? 6 : 17, 13, 5, 4);

        // Hand
        g.fillStyle(0xfdbf6f, 1);
        g.fillCircle(flip ? 5 : 23, 15, 2);

        // Weapon (simple gun shape)
        g.fillStyle(0x4a4a4a, 1);
        if (flip) {
            g.fillRect(0, 13, 6, 3); // barrel
            g.fillRect(4, 12, 4, 5); // body
        } else {
            g.fillRect(22, 13, 6, 3); // barrel
            g.fillRect(20, 12, 4, 5); // body
        }
    }

    createTerrainTiles() {
        const ts = this.tileSize;
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Grass tile with texture
        g.fillStyle(0x27ae60, 1);
        g.fillRect(0, 0, ts, ts);
        // Add grass detail
        g.fillStyle(0x2ecc71, 1);
        g.fillRect(4, 8, 2, 4);
        g.fillRect(12, 4, 2, 5);
        g.fillRect(20, 14, 2, 4);
        g.fillRect(8, 18, 2, 3);
        g.lineStyle(1, 0x229954, 0.5);
        g.strokeRect(0, 0, ts, ts);
        g.generateTexture('tile_grass', ts, ts);

        // Trench tile
        g.clear();
        g.fillStyle(0x5d4037, 1);
        g.fillRect(0, 0, ts, ts);
        g.fillStyle(0x4e342e, 1);
        g.fillRect(3, 3, ts - 6, ts - 6);
        // Sandbags
        g.fillStyle(0x8d6e63, 1);
        g.fillEllipse(7, 4, 8, 4);
        g.fillEllipse(21, 4, 8, 4);
        g.fillEllipse(7, ts - 4, 8, 4);
        g.fillEllipse(21, ts - 4, 8, 4);
        g.lineStyle(1, 0x3e2723);
        g.strokeRect(0, 0, ts, ts);
        g.generateTexture('tile_trench', ts, ts);

        // Mountain tile
        g.clear();
        // Base grass
        g.fillStyle(0x27ae60, 1);
        g.fillRect(0, 0, ts, ts);
        // Mountain shape
        g.fillStyle(0x7f8c8d, 1);
        g.fillTriangle(ts / 2, 2, 2, ts - 2, ts - 2, ts - 2);
        // Snow cap
        g.fillStyle(0xecf0f1, 1);
        g.fillTriangle(ts / 2, 2, ts / 2 - 5, 10, ts / 2 + 5, 10);
        // Rocky texture
        g.fillStyle(0x95a5a6, 1);
        g.fillTriangle(8, ts - 4, 4, ts - 2, 12, ts - 2);
        g.fillTriangle(ts - 8, ts - 4, ts - 12, ts - 2, ts - 4, ts - 2);
        g.generateTexture('tile_mountain', ts, ts);

        // Safe zone overlays
        g.clear();
        g.fillStyle(0x3498db, 0.25);
        g.fillRect(0, 0, ts, ts);
        g.lineStyle(1, 0x3498db, 0.5);
        g.strokeRect(0, 0, ts, ts);
        g.generateTexture('safe_blue', ts, ts);

        g.clear();
        g.fillStyle(0xe74c3c, 0.25);
        g.fillRect(0, 0, ts, ts);
        g.lineStyle(1, 0xe74c3c, 0.5);
        g.strokeRect(0, 0, ts, ts);
        g.generateTexture('safe_red', ts, ts);

        g.destroy();
    }

    createProjectileSprites() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // 1. Banana - curved yellow shape
        g.fillStyle(0xf1c40f, 1);
        g.beginPath();
        g.arc(10, 8, 8, -0.5, Math.PI + 0.5, false);
        g.fillPath();
        g.fillStyle(0xd4ac0d, 1);
        g.fillRect(4, 7, 12, 2);
        // Banana tips
        g.fillStyle(0x6e4b1a, 1);
        g.fillCircle(3, 8, 2);
        g.fillCircle(17, 8, 2);
        g.generateTexture('proj_banana', 20, 16);

        // 2. Water Balloon - blue balloon with knot
        g.clear();
        g.fillStyle(0x3498db, 1);
        g.fillCircle(10, 10, 8);
        g.fillStyle(0x85c1e9, 1);
        g.fillCircle(7, 7, 3); // shine
        g.fillStyle(0x2980b9, 1);
        g.fillTriangle(10, 17, 8, 20, 12, 20); // knot
        g.generateTexture('proj_balloon', 20, 22);

        // 3. Confetti - colorful scattered bits
        g.clear();
        g.fillStyle(0xe74c3c, 1);
        g.fillRect(2, 4, 4, 4);
        g.fillStyle(0xf1c40f, 1);
        g.fillRect(8, 2, 4, 4);
        g.fillStyle(0x9b59b6, 1);
        g.fillRect(14, 5, 4, 4);
        g.fillStyle(0x2ecc71, 1);
        g.fillRect(5, 10, 4, 4);
        g.fillStyle(0x3498db, 1);
        g.fillRect(11, 9, 4, 4);
        g.generateTexture('proj_confetti', 20, 16);

        // 4. Rubber Chicken - yellow chicken shape
        g.clear();
        // Body
        g.fillStyle(0xf5b041, 1);
        g.fillEllipse(10, 10, 14, 10);
        // Head
        g.fillCircle(18, 6, 5);
        // Beak
        g.fillStyle(0xe67e22, 1);
        g.fillTriangle(22, 5, 26, 6, 22, 8);
        // Eye
        g.fillStyle(0x000000, 1);
        g.fillCircle(19, 5, 1);
        // Comb
        g.fillStyle(0xe74c3c, 1);
        g.fillCircle(17, 2, 2);
        g.fillCircle(19, 1, 2);
        // Feet
        g.fillStyle(0xe67e22, 1);
        g.fillRect(6, 14, 2, 4);
        g.fillRect(12, 14, 2, 4);
        g.generateTexture('proj_chicken', 28, 20);

        // 5. Pie - cream pie with tin
        g.clear();
        // Tin
        g.fillStyle(0xbdc3c7, 1);
        g.fillEllipse(12, 14, 22, 8);
        // Crust
        g.fillStyle(0xd4a574, 1);
        g.fillEllipse(12, 12, 20, 10);
        // Cream
        g.fillStyle(0xfdfefe, 1);
        g.fillEllipse(12, 10, 16, 10);
        // Cream swirl
        g.fillCircle(12, 8, 4);
        g.fillCircle(8, 10, 3);
        g.fillCircle(16, 10, 3);
        // Cherry on top
        g.fillStyle(0xe74c3c, 1);
        g.fillCircle(12, 5, 3);
        g.generateTexture('proj_pie', 24, 20);

        // 6. Bubble - transparent soap bubble
        g.clear();
        g.fillStyle(0x85c1e9, 0.4);
        g.fillCircle(10, 10, 9);
        g.lineStyle(2, 0x3498db, 0.6);
        g.strokeCircle(10, 10, 9);
        // Shine
        g.fillStyle(0xffffff, 0.7);
        g.fillCircle(7, 7, 3);
        g.generateTexture('proj_bubble', 20, 20);

        // 7. Snowball - white with texture
        g.clear();
        g.fillStyle(0xffffff, 1);
        g.fillCircle(10, 10, 8);
        g.fillStyle(0xecf0f1, 1);
        g.fillCircle(7, 8, 3);
        g.fillCircle(13, 12, 2);
        g.fillStyle(0xbdc3c7, 1);
        g.fillCircle(12, 7, 2);
        g.generateTexture('proj_snowball', 20, 20);

        // 8. Silly String - squiggly colorful line
        g.clear();
        g.lineStyle(3, 0xff69b4);
        g.beginPath();
        g.moveTo(0, 8);
        g.lineTo(5, 4);
        g.lineTo(10, 12);
        g.lineTo(15, 4);
        g.lineTo(20, 8);
        g.strokePath();
        g.generateTexture('proj_string', 22, 16);

        // 9. Plunger - wooden handle and rubber cup
        g.clear();
        // Handle
        g.fillStyle(0xd4a574, 1);
        g.fillRect(8, 0, 4, 14);
        // Cup
        g.fillStyle(0xc0392b, 1);
        g.fillEllipse(10, 16, 14, 8);
        g.fillRect(3, 12, 14, 4);
        g.generateTexture('proj_plunger', 20, 22);

        // 10. Tickle Ray - sparkly beam
        g.clear();
        g.fillStyle(0xff69b4, 0.8);
        g.fillEllipse(12, 8, 20, 6);
        // Sparkles (small diamonds)
        g.fillStyle(0xffff00, 1);
        g.fillTriangle(6, 5, 4, 8, 6, 11); // left half
        g.fillTriangle(6, 5, 8, 8, 6, 11); // right half
        g.fillTriangle(12, 4, 10, 6, 12, 8);
        g.fillTriangle(12, 4, 14, 6, 12, 8);
        g.fillTriangle(18, 6, 16, 9, 18, 12);
        g.fillTriangle(18, 6, 20, 9, 18, 12);
        g.generateTexture('proj_tickle', 24, 16);

        g.destroy();
    }

    createUISprites() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Heart (full)
        g.fillStyle(0xe74c3c, 1);
        g.fillCircle(5, 4, 4);
        g.fillCircle(11, 4, 4);
        g.fillTriangle(0, 6, 16, 6, 8, 15);
        // Shine
        g.fillStyle(0xffffff, 0.4);
        g.fillCircle(4, 3, 2);
        g.generateTexture('heart', 16, 16);

        // Heart (empty)
        g.clear();
        g.lineStyle(1.5, 0xe74c3c);
        g.strokeCircle(5, 4, 3);
        g.strokeCircle(11, 4, 3);
        g.beginPath();
        g.moveTo(1, 5);
        g.lineTo(8, 14);
        g.lineTo(15, 5);
        g.strokePath();
        g.generateTexture('heart_empty', 16, 16);

        // Direction arrow
        g.clear();
        g.fillStyle(0xf1c40f, 1);
        g.fillTriangle(8, 0, 2, 10, 14, 10);
        g.fillStyle(0xffffff, 1);
        g.fillTriangle(8, 2, 4, 9, 12, 9);
        g.generateTexture('direction_arrow', 16, 12);

        g.destroy();
    }

    createPowerUpSprites() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const size = 24;

        // Speed Boost - lightning bolt (yellow)
        g.fillStyle(0xf1c40f, 1);
        g.beginPath();
        g.moveTo(14, 2);
        g.lineTo(8, 10);
        g.lineTo(12, 10);
        g.lineTo(10, 22);
        g.lineTo(16, 12);
        g.lineTo(12, 12);
        g.lineTo(14, 2);
        g.closePath();
        g.fillPath();
        // Glow circle behind
        g.fillStyle(0xf39c12, 0.3);
        g.fillCircle(12, 12, 11);
        g.generateTexture('powerup_speed', size, size);

        // Shield - blue shield shape
        g.clear();
        g.fillStyle(0x3498db, 0.3);
        g.fillCircle(12, 12, 11);
        g.fillStyle(0x3498db, 1);
        g.beginPath();
        g.moveTo(12, 3);
        g.lineTo(20, 7);
        g.lineTo(20, 14);
        g.lineTo(12, 21);
        g.lineTo(4, 14);
        g.lineTo(4, 7);
        g.closePath();
        g.fillPath();
        g.fillStyle(0x85c1e9, 1);
        g.beginPath();
        g.moveTo(12, 6);
        g.lineTo(17, 9);
        g.lineTo(17, 13);
        g.lineTo(12, 18);
        g.lineTo(7, 13);
        g.lineTo(7, 9);
        g.closePath();
        g.fillPath();
        g.generateTexture('powerup_shield', size, size);

        // Rapid Fire - red double arrows
        g.clear();
        g.fillStyle(0xe74c3c, 0.3);
        g.fillCircle(12, 12, 11);
        g.fillStyle(0xe74c3c, 1);
        g.fillTriangle(6, 8, 12, 4, 12, 12);
        g.fillTriangle(6, 16, 12, 12, 12, 20);
        g.fillTriangle(12, 8, 18, 4, 18, 12);
        g.fillTriangle(12, 16, 18, 12, 18, 20);
        g.generateTexture('powerup_rapid', size, size);

        // Health Pack - green cross/plus
        g.clear();
        g.fillStyle(0x2ecc71, 0.3);
        g.fillCircle(12, 12, 11);
        g.fillStyle(0x2ecc71, 1);
        g.fillRect(9, 4, 6, 16);
        g.fillRect(4, 9, 16, 6);
        g.fillStyle(0xffffff, 1);
        g.fillRect(10, 5, 4, 14);
        g.fillRect(5, 10, 14, 4);
        g.generateTexture('powerup_health', size, size);

        g.destroy();
    }

    createSpecialTerrainSprites() {
        const ts = this.tileSize;
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Mud puddle - brown splotch
        g.fillStyle(0x27ae60, 1);
        g.fillRect(0, 0, ts, ts);
        g.fillStyle(0x6d4c41, 1);
        g.fillEllipse(ts / 2, ts / 2, ts - 4, ts - 6);
        g.fillStyle(0x5d4037, 1);
        g.fillEllipse(ts / 2, ts / 2, ts - 8, ts - 10);
        // Mud bubbles
        g.fillStyle(0x8d6e63, 0.6);
        g.fillCircle(8, 10, 3);
        g.fillCircle(18, 16, 2);
        g.generateTexture('tile_mud', ts, ts);

        // Bounce pad - spring platform
        g.clear();
        g.fillStyle(0x27ae60, 1);
        g.fillRect(0, 0, ts, ts);
        // Base plate
        g.fillStyle(0x7f8c8d, 1);
        g.fillRect(4, 18, ts - 8, 6);
        // Spring coils
        g.lineStyle(2, 0xf39c12);
        g.beginPath();
        g.moveTo(8, 18);
        g.lineTo(10, 14);
        g.lineTo(8, 10);
        g.lineTo(10, 6);
        g.strokePath();
        g.beginPath();
        g.moveTo(ts - 8, 18);
        g.lineTo(ts - 10, 14);
        g.lineTo(ts - 8, 10);
        g.lineTo(ts - 10, 6);
        g.strokePath();
        // Top platform
        g.fillStyle(0xe74c3c, 1);
        g.fillRect(4, 4, ts - 8, 4);
        // Arrow up
        g.fillStyle(0xffffff, 1);
        g.fillTriangle(ts / 2, 0, ts / 2 - 4, 4, ts / 2 + 4, 4);
        g.generateTexture('tile_bounce', ts, ts);

        // Teleporter - glowing portal
        g.clear();
        g.fillStyle(0x27ae60, 1);
        g.fillRect(0, 0, ts, ts);
        // Outer glow
        g.fillStyle(0x9b59b6, 0.3);
        g.fillCircle(ts / 2, ts / 2, 12);
        // Inner portal
        g.fillStyle(0x8e44ad, 0.6);
        g.fillCircle(ts / 2, ts / 2, 9);
        g.fillStyle(0xbb8fce, 0.8);
        g.fillCircle(ts / 2, ts / 2, 6);
        // Center swirl
        g.fillStyle(0xffffff, 1);
        g.fillCircle(ts / 2, ts / 2, 3);
        g.generateTexture('tile_teleporter', ts, ts);

        g.destroy();
    }

    createCityTerrainSprites() {
        const ts = this.tileSize;
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Street tile (vertical) - gray asphalt with vertical lane markings
        g.fillStyle(0x4a4a4a, 1);
        g.fillRect(0, 0, ts, ts);
        // Road texture
        g.fillStyle(0x3d3d3d, 1);
        g.fillRect(2, 2, ts - 4, ts - 4);
        // Dashed lane line (vertical)
        g.fillStyle(0xf1c40f, 1);
        g.fillRect(ts / 2 - 1, 2, 2, 6);
        g.fillRect(ts / 2 - 1, 12, 2, 6);
        g.fillRect(ts / 2 - 1, 22, 2, 4);
        g.generateTexture('tile_street', ts, ts);
        g.generateTexture('tile_street_v', ts, ts);

        // Street tile (horizontal) - gray asphalt with horizontal lane markings
        g.clear();
        g.fillStyle(0x4a4a4a, 1);
        g.fillRect(0, 0, ts, ts);
        g.fillStyle(0x3d3d3d, 1);
        g.fillRect(2, 2, ts - 4, ts - 4);
        // Dashed lane line (horizontal)
        g.fillStyle(0xf1c40f, 1);
        g.fillRect(2, ts / 2 - 1, 6, 2);
        g.fillRect(12, ts / 2 - 1, 6, 2);
        g.fillRect(22, ts / 2 - 1, 4, 2);
        g.generateTexture('tile_street_h', ts, ts);

        // Building tile - rooftop view with edges
        g.clear();
        g.fillStyle(0x8b7355, 1);
        g.fillRect(0, 0, ts, ts);
        // Darker center (roof)
        g.fillStyle(0x6b5344, 1);
        g.fillRect(2, 2, ts - 4, ts - 4);
        // Edge highlight
        g.fillStyle(0xa08060, 1);
        g.fillRect(0, 0, ts, 2);
        g.fillRect(0, 0, 2, ts);
        // Rooftop details (vents/units)
        g.fillStyle(0x5d4037, 1);
        g.fillRect(6, 6, 6, 6);
        g.fillRect(16, 16, 6, 6);
        g.generateTexture('tile_building', ts, ts);

        // Car tile - colorful car (obstacle)
        g.clear();
        // Street background
        g.fillStyle(0x4a4a4a, 1);
        g.fillRect(0, 0, ts, ts);
        g.fillStyle(0x3d3d3d, 1);
        g.fillRect(2, 2, ts - 4, ts - 4);
        // Car body (random looking but static red car)
        g.fillStyle(0xe74c3c, 1);
        g.fillRoundedRect(4, 8, 20, 12, 3);
        // Car roof
        g.fillStyle(0xc0392b, 1);
        g.fillRoundedRect(8, 6, 12, 8, 2);
        // Windows
        g.fillStyle(0x85c1e9, 1);
        g.fillRect(9, 7, 4, 5);
        g.fillRect(15, 7, 4, 5);
        // Wheels
        g.fillStyle(0x2c3e50, 1);
        g.fillCircle(8, 20, 3);
        g.fillCircle(20, 20, 3);
        g.generateTexture('tile_car', ts, ts);

        // Pothole tile - dark hole in asphalt
        g.clear();
        g.fillStyle(0x4a4a4a, 1);
        g.fillRect(0, 0, ts, ts);
        g.fillStyle(0x3d3d3d, 1);
        g.fillRect(2, 2, ts - 4, ts - 4);
        // Pothole
        g.fillStyle(0x1a1a1a, 1);
        g.fillEllipse(ts / 2, ts / 2, ts - 8, ts - 10);
        // Cracked edges
        g.fillStyle(0x2d2d2d, 1);
        g.fillEllipse(ts / 2, ts / 2, ts - 12, ts - 14);
        g.generateTexture('tile_pothole', ts, ts);

        // Sewer grate tile - metal grate pattern
        g.clear();
        g.fillStyle(0x4a4a4a, 1);
        g.fillRect(0, 0, ts, ts);
        // Grate frame
        g.fillStyle(0x7f8c8d, 1);
        g.fillRect(4, 4, ts - 8, ts - 8);
        // Grate bars
        g.fillStyle(0x2c3e50, 1);
        g.fillRect(6, 4, 2, ts - 8);
        g.fillRect(12, 4, 2, ts - 8);
        g.fillRect(18, 4, 2, ts - 8);
        // Dark below
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(8, 6, 3, ts - 12);
        g.fillRect(14, 6, 3, ts - 12);
        g.generateTexture('tile_sewer', ts, ts);

        // Roadkill tile - flat splat on street
        g.clear();
        g.fillStyle(0x4a4a4a, 1);
        g.fillRect(0, 0, ts, ts);
        g.fillStyle(0x3d3d3d, 1);
        g.fillRect(2, 2, ts - 4, ts - 4);
        // Splat shape (keeping it kid-friendly - just a flat blob)
        g.fillStyle(0x6d4c41, 1);
        g.fillEllipse(ts / 2, ts / 2, ts - 10, ts - 14);
        g.fillStyle(0x5d4037, 1);
        g.fillEllipse(ts / 2 - 2, ts / 2, 6, 4);
        g.fillEllipse(ts / 2 + 4, ts / 2 + 2, 4, 3);
        g.generateTexture('tile_roadkill', ts, ts);

        // Sidewalk tile - light gray pavement with cracks
        g.clear();
        g.fillStyle(0x9e9e9e, 1);
        g.fillRect(0, 0, ts, ts);
        g.fillStyle(0x8a8a8a, 1);
        g.fillRect(1, 1, ts - 2, ts - 2);
        // Grid lines (pavement squares)
        g.lineStyle(1, 0x757575, 0.5);
        g.strokeRect(2, 2, ts / 2 - 2, ts / 2 - 2);
        g.strokeRect(ts / 2, 2, ts / 2 - 2, ts / 2 - 2);
        g.strokeRect(2, ts / 2, ts / 2 - 2, ts / 2 - 2);
        g.strokeRect(ts / 2, ts / 2, ts / 2 - 2, ts / 2 - 2);
        g.generateTexture('tile_sidewalk', ts, ts);

        // Park tile - green grass with flowers
        g.clear();
        g.fillStyle(0x4caf50, 1);
        g.fillRect(0, 0, ts, ts);
        g.fillStyle(0x66bb6a, 1);
        g.fillRect(2, 2, ts - 4, ts - 4);
        // Grass blades
        g.fillStyle(0x81c784, 1);
        g.fillRect(5, 8, 2, 5);
        g.fillRect(14, 5, 2, 6);
        g.fillRect(20, 12, 2, 5);
        g.fillRect(9, 18, 2, 4);
        // Little flowers
        g.fillStyle(0xffeb3b, 1);
        g.fillCircle(8, 6, 2);
        g.fillCircle(20, 8, 2);
        g.fillStyle(0xff7043, 1);
        g.fillCircle(16, 16, 2);
        g.fillCircle(6, 20, 2);
        g.generateTexture('tile_park', ts, ts);

        g.destroy();
    }

    createCityPowerUpSprites() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const size = 24;

        // Pizza slice - triangle with toppings
        g.fillStyle(0xe67e22, 0.3);
        g.fillCircle(12, 12, 11);
        // Crust
        g.fillStyle(0xd4a574, 1);
        g.beginPath();
        g.moveTo(12, 2);
        g.lineTo(22, 20);
        g.lineTo(2, 20);
        g.closePath();
        g.fillPath();
        // Cheese
        g.fillStyle(0xf1c40f, 1);
        g.beginPath();
        g.moveTo(12, 5);
        g.lineTo(19, 18);
        g.lineTo(5, 18);
        g.closePath();
        g.fillPath();
        // Pepperoni
        g.fillStyle(0xc0392b, 1);
        g.fillCircle(10, 12, 2);
        g.fillCircle(14, 14, 2);
        g.fillCircle(12, 9, 1.5);
        g.generateTexture('powerup_pizza', size, size);

        // Hot dog - bun with sausage
        g.clear();
        g.fillStyle(0xe67e22, 0.3);
        g.fillCircle(12, 12, 11);
        // Bun
        g.fillStyle(0xd4a574, 1);
        g.fillEllipse(12, 12, 18, 10);
        // Bun split
        g.fillStyle(0xc9a066, 1);
        g.fillRect(4, 11, 16, 2);
        // Sausage
        g.fillStyle(0xc0392b, 1);
        g.fillEllipse(12, 12, 14, 6);
        // Mustard zigzag
        g.lineStyle(2, 0xf1c40f);
        g.beginPath();
        g.moveTo(5, 12);
        g.lineTo(8, 10);
        g.lineTo(11, 14);
        g.lineTo(14, 10);
        g.lineTo(17, 14);
        g.lineTo(19, 12);
        g.strokePath();
        g.generateTexture('powerup_hotdog', size, size);

        // Coffee cup - paper cup with steam
        g.clear();
        g.fillStyle(0x8b4513, 0.3);
        g.fillCircle(12, 12, 11);
        // Cup body
        g.fillStyle(0xffffff, 1);
        g.beginPath();
        g.moveTo(6, 6);
        g.lineTo(18, 6);
        g.lineTo(16, 20);
        g.lineTo(8, 20);
        g.closePath();
        g.fillPath();
        // Cup sleeve
        g.fillStyle(0x8b4513, 1);
        g.beginPath();
        g.moveTo(7, 10);
        g.lineTo(17, 10);
        g.lineTo(16, 16);
        g.lineTo(8, 16);
        g.closePath();
        g.fillPath();
        // Coffee top
        g.fillStyle(0x4a2c0a, 1);
        g.fillEllipse(12, 6, 12, 4);
        // Steam
        g.lineStyle(1.5, 0xbdc3c7);
        g.beginPath();
        g.moveTo(10, 4);
        g.lineTo(9, 2);
        g.strokePath();
        g.beginPath();
        g.moveTo(14, 4);
        g.lineTo(15, 1);
        g.strokePath();
        g.generateTexture('powerup_coffee', size, size);

        // Traffic cone - orange cone
        g.clear();
        g.fillStyle(0xe67e22, 0.3);
        g.fillCircle(12, 12, 11);
        // Cone body
        g.fillStyle(0xe67e22, 1);
        g.beginPath();
        g.moveTo(12, 3);
        g.lineTo(19, 19);
        g.lineTo(5, 19);
        g.closePath();
        g.fillPath();
        // White stripes
        g.fillStyle(0xffffff, 1);
        g.beginPath();
        g.moveTo(10, 8);
        g.lineTo(14, 8);
        g.lineTo(15, 11);
        g.lineTo(9, 11);
        g.closePath();
        g.fillPath();
        g.beginPath();
        g.moveTo(8, 14);
        g.lineTo(16, 14);
        g.lineTo(17, 17);
        g.lineTo(7, 17);
        g.closePath();
        g.fillPath();
        // Base
        g.fillStyle(0x2c3e50, 1);
        g.fillRect(4, 19, 16, 3);
        g.generateTexture('powerup_trafficcone', size, size);

        g.destroy();
    }

    createRatSprites() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Rat facing right
        // Body
        g.fillStyle(0x7f8c8d, 1);
        g.fillEllipse(10, 10, 14, 10);
        // Head
        g.fillStyle(0x95a5a6, 1);
        g.fillEllipse(18, 8, 8, 6);
        // Snout
        g.fillStyle(0xffb6c1, 1);
        g.fillCircle(22, 8, 2);
        // Eye
        g.fillStyle(0x000000, 1);
        g.fillCircle(17, 7, 1);
        // Ears
        g.fillStyle(0xffb6c1, 1);
        g.fillCircle(14, 4, 3);
        g.fillCircle(18, 3, 3);
        // Tail
        g.lineStyle(2, 0xffb6c1);
        g.beginPath();
        g.moveTo(3, 10);
        g.lineTo(0, 8);
        g.lineTo(2, 12);
        g.strokePath();
        // Feet
        g.fillStyle(0xffb6c1, 1);
        g.fillCircle(6, 14, 2);
        g.fillCircle(14, 14, 2);
        g.generateTexture('rat_right', 24, 18);

        // Rat facing left (mirror)
        g.clear();
        // Body
        g.fillStyle(0x7f8c8d, 1);
        g.fillEllipse(14, 10, 14, 10);
        // Head
        g.fillStyle(0x95a5a6, 1);
        g.fillEllipse(6, 8, 8, 6);
        // Snout
        g.fillStyle(0xffb6c1, 1);
        g.fillCircle(2, 8, 2);
        // Eye
        g.fillStyle(0x000000, 1);
        g.fillCircle(7, 7, 1);
        // Ears
        g.fillStyle(0xffb6c1, 1);
        g.fillCircle(10, 4, 3);
        g.fillCircle(6, 3, 3);
        // Tail
        g.lineStyle(2, 0xffb6c1);
        g.beginPath();
        g.moveTo(21, 10);
        g.lineTo(24, 8);
        g.lineTo(22, 12);
        g.strokePath();
        // Feet
        g.fillStyle(0xffb6c1, 1);
        g.fillCircle(18, 14, 2);
        g.fillCircle(10, 14, 2);
        g.generateTexture('rat_left', 24, 18);

        g.destroy();
    }

    createPizzeriaSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });

        // Pizzeria storefront (wider sprite for the pizza line destination)
        const width = 80;
        const height = 50;

        // Building facade
        g.fillStyle(0xc0392b, 1);
        g.fillRect(0, 0, width, height);
        // Awning
        g.fillStyle(0x27ae60, 1);
        g.fillRect(0, 0, width, 12);
        // Awning stripes
        g.fillStyle(0xffffff, 1);
        for (let i = 0; i < width; i += 10) {
            g.fillRect(i, 0, 5, 12);
        }
        // Window
        g.fillStyle(0xf5deb3, 1);
        g.fillRect(5, 16, 30, 25);
        // Door
        g.fillStyle(0x8b4513, 1);
        g.fillRect(45, 16, 25, 34);
        // Door handle
        g.fillStyle(0xf1c40f, 1);
        g.fillCircle(65, 35, 2);
        // Pizza sign
        g.fillStyle(0xf1c40f, 1);
        g.fillCircle(20, 28, 10);
        // Pizza toppings on sign
        g.fillStyle(0xc0392b, 1);
        g.fillCircle(17, 26, 2);
        g.fillCircle(23, 30, 2);
        g.fillCircle(20, 24, 1.5);

        g.generateTexture('pizzeria', width, height);

        g.destroy();
    }

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

    createCrashPileSprite() {
        // Will be implemented in Task 5
    }
}
