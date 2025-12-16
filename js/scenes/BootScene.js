// ABOUTME: Boot scene for loading game assets before gameplay begins
// ABOUTME: Shows a loading bar while sprites, sounds, and other resources load

class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Show loading text
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontSize: '32px',
            fill: '#f39c12',
            fontFamily: 'Comic Sans MS'
        });
        loadingText.setOrigin(0.5);

        // Loading bar background
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2, 320, 30);

        // Update loading bar as assets load
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

        // For now, we'll generate sprites programmatically
        // Later we can add actual image assets here
        // this.load.image('player', 'assets/sprites/player.png');
    }

    create() {
        // Generate placeholder graphics for game entities
        this.createPlaceholderGraphics();

        // Start the main game scene
        this.scene.start('GameScene');
    }

    createPlaceholderGraphics() {
        // Create a simple player texture (colored circle)
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });

        // Blue team player
        playerGraphics.fillStyle(0x3498db, 1);
        playerGraphics.fillCircle(16, 16, 14);
        playerGraphics.lineStyle(2, 0x2980b9);
        playerGraphics.strokeCircle(16, 16, 14);
        playerGraphics.generateTexture('player_blue', 32, 32);

        // Red team player
        playerGraphics.clear();
        playerGraphics.fillStyle(0xe74c3c, 1);
        playerGraphics.fillCircle(16, 16, 14);
        playerGraphics.lineStyle(2, 0xc0392b);
        playerGraphics.strokeCircle(16, 16, 14);
        playerGraphics.generateTexture('player_red', 32, 32);

        // Selection highlight ring
        playerGraphics.clear();
        playerGraphics.lineStyle(3, 0xf1c40f);
        playerGraphics.strokeCircle(16, 16, 18);
        playerGraphics.generateTexture('selection_ring', 32, 32);

        // Heart for health
        const heartGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        heartGraphics.fillStyle(0xe74c3c, 1);
        // Simple heart shape using circles and triangle
        heartGraphics.fillCircle(5, 4, 4);
        heartGraphics.fillCircle(11, 4, 4);
        heartGraphics.fillTriangle(0, 5, 16, 5, 8, 14);
        heartGraphics.generateTexture('heart', 16, 16);

        // Empty heart (for lost health)
        heartGraphics.clear();
        heartGraphics.lineStyle(1, 0xe74c3c);
        heartGraphics.strokeCircle(5, 4, 4);
        heartGraphics.strokeCircle(11, 4, 4);
        heartGraphics.strokeTriangle(0, 5, 16, 5, 8, 14);
        heartGraphics.generateTexture('heart_empty', 16, 16);

        // Direction indicator (small triangle)
        const arrowGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        arrowGraphics.fillStyle(0xffffff, 1);
        arrowGraphics.fillTriangle(8, 0, 0, 12, 16, 12);
        arrowGraphics.generateTexture('direction_arrow', 16, 16);

        // Grass tile
        const tileGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        tileGraphics.fillStyle(0x27ae60, 1);
        tileGraphics.fillRect(0, 0, 40, 40);
        tileGraphics.lineStyle(1, 0x229954);
        tileGraphics.strokeRect(0, 0, 40, 40);
        tileGraphics.generateTexture('tile_grass', 40, 40);

        // Trench tile (darker, cover)
        tileGraphics.clear();
        tileGraphics.fillStyle(0x6d4c41, 1);
        tileGraphics.fillRect(0, 0, 40, 40);
        tileGraphics.fillStyle(0x5d4037, 1);
        tileGraphics.fillRect(4, 4, 32, 32);
        tileGraphics.lineStyle(1, 0x4e342e);
        tileGraphics.strokeRect(0, 0, 40, 40);
        tileGraphics.generateTexture('tile_trench', 40, 40);

        // Mountain tile (blocks movement and shots)
        tileGraphics.clear();
        tileGraphics.fillStyle(0x7f8c8d, 1);
        tileGraphics.fillTriangle(20, 2, 2, 38, 38, 38);
        tileGraphics.fillStyle(0x95a5a6, 1);
        tileGraphics.fillTriangle(20, 8, 8, 36, 32, 36);
        tileGraphics.generateTexture('tile_mountain', 40, 40);

        // Safe zone overlay (semi-transparent blue for player team)
        const safeGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        safeGraphics.fillStyle(0x3498db, 0.3);
        safeGraphics.fillRect(0, 0, 40, 40);
        safeGraphics.generateTexture('safe_blue', 40, 40);

        // Safe zone overlay (semi-transparent red for enemy team)
        safeGraphics.clear();
        safeGraphics.fillStyle(0xe74c3c, 0.3);
        safeGraphics.fillRect(0, 0, 40, 40);
        safeGraphics.generateTexture('safe_red', 40, 40);

        // Banana projectile
        const bananaGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        bananaGraphics.fillStyle(0xf1c40f, 1);
        bananaGraphics.fillEllipse(8, 6, 14, 8);
        bananaGraphics.generateTexture('proj_banana', 16, 16);

        // Water balloon projectile
        bananaGraphics.clear();
        bananaGraphics.fillStyle(0x3498db, 1);
        bananaGraphics.fillCircle(8, 8, 7);
        bananaGraphics.fillStyle(0x85c1e9, 1);
        bananaGraphics.fillCircle(6, 6, 3);
        bananaGraphics.generateTexture('proj_balloon', 16, 16);

        // Confetti projectile
        bananaGraphics.clear();
        bananaGraphics.fillStyle(0xe74c3c, 1);
        bananaGraphics.fillRect(2, 6, 4, 4);
        bananaGraphics.fillStyle(0xf1c40f, 1);
        bananaGraphics.fillRect(7, 4, 4, 4);
        bananaGraphics.fillStyle(0x9b59b6, 1);
        bananaGraphics.fillRect(10, 8, 4, 4);
        bananaGraphics.generateTexture('proj_confetti', 16, 16);

        // Rubber chicken projectile
        bananaGraphics.clear();
        bananaGraphics.fillStyle(0xf5b041, 1);
        bananaGraphics.fillEllipse(8, 8, 12, 8);
        bananaGraphics.fillStyle(0xe74c3c, 1);
        bananaGraphics.fillTriangle(14, 6, 16, 8, 14, 10);
        bananaGraphics.generateTexture('proj_chicken', 16, 16);

        // Pie projectile
        bananaGraphics.clear();
        bananaGraphics.fillStyle(0xfdebd0, 1);
        bananaGraphics.fillCircle(8, 8, 7);
        bananaGraphics.fillStyle(0x8b4513, 1);
        bananaGraphics.lineStyle(2, 0x8b4513);
        bananaGraphics.strokeCircle(8, 8, 7);
        bananaGraphics.generateTexture('proj_pie', 16, 16);

        playerGraphics.destroy();
        heartGraphics.destroy();
        arrowGraphics.destroy();
        tileGraphics.destroy();
        safeGraphics.destroy();
        bananaGraphics.destroy();
    }
}
