// ABOUTME: Level selection menu scene
// ABOUTME: Allows players to choose between unlocked levels

class LevelSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LevelSelectScene' });
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Title
        this.add.text(centerX, 60, 'SELECT LEVEL', {
            fontSize: '36px',
            fill: '#f39c12',
            fontFamily: 'Comic Sans MS',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Get completed levels
        const levelsCompleted = JSON.parse(localStorage.getItem('levelsCompleted') || '[]');

        // Level 1: Battlefield (always unlocked)
        this.createLevelButton(centerX, centerY - 60, 'Level 1: Battlefield', 'GameScene', true, levelsCompleted.includes(1));

        // Level 2: City Life (unlocked after completing level 1)
        const level2Unlocked = levelsCompleted.includes(1);
        this.createLevelButton(centerX, centerY + 20, 'Level 2: City Life', 'CityLifeScene', level2Unlocked, levelsCompleted.includes(2));

        // Chaos Mode toggle
        this.createChaosModeToggle(centerX, centerY + 100);

        // Instructions
        this.add.text(centerX, centerY + 160, 'Complete a level to unlock the next!', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Comic Sans MS'
        }).setOrigin(0.5);

        // Power-up legend
        this.drawPowerUpLegend(centerX, centerY + 210);

        // Reset progress button (small, bottom corner)
        const resetBtn = this.add.text(20, this.cameras.main.height - 30, 'Reset Progress', {
            fontSize: '12px',
            fill: '#7f8c8d',
            fontFamily: 'Comic Sans MS'
        }).setInteractive();

        resetBtn.on('pointerdown', () => {
            localStorage.removeItem('levelsCompleted');
            this.scene.restart();
        });

        resetBtn.on('pointerover', () => {
            resetBtn.setFill('#e74c3c');
        });

        resetBtn.on('pointerout', () => {
            resetBtn.setFill('#7f8c8d');
        });
    }

    createLevelButton(x, y, text, sceneKey, unlocked, completed) {
        const btnWidth = 280;
        const btnHeight = 50;

        // Button background
        const bg = this.add.rectangle(x, y, btnWidth, btnHeight, unlocked ? 0x3498db : 0x7f8c8d, 1);
        bg.setStrokeStyle(3, unlocked ? 0x2980b9 : 0x5d6d7e);

        // Button text
        const label = this.add.text(x, y, text, {
            fontSize: '20px',
            fill: unlocked ? '#ffffff' : '#bdc3c7',
            fontFamily: 'Comic Sans MS'
        }).setOrigin(0.5);

        // Completed checkmark
        if (completed) {
            this.add.text(x + btnWidth / 2 - 20, y, '✓', {
                fontSize: '24px',
                fill: '#2ecc71',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        }

        // Lock icon for locked levels
        if (!unlocked) {
            this.add.text(x - btnWidth / 2 + 25, y, '🔒', {
                fontSize: '20px'
            }).setOrigin(0.5);
        }

        if (unlocked) {
            bg.setInteractive();

            bg.on('pointerover', () => {
                bg.setFillStyle(0x2980b9);
                label.setScale(1.05);
            });

            bg.on('pointerout', () => {
                bg.setFillStyle(0x3498db);
                label.setScale(1);
            });

            bg.on('pointerdown', () => {
                const chaosMode = localStorage.getItem('chaosMode') === 'true';
                this.scene.start(sceneKey, { chaosMode: chaosMode });
            });
        }
    }

    createChaosModeToggle(x, y) {
        const chaosMode = localStorage.getItem('chaosMode') === 'true';

        // Toggle background
        const toggleBg = this.add.rectangle(x, y, 220, 40, chaosMode ? 0xe74c3c : 0x2c3e50, 1);
        toggleBg.setStrokeStyle(3, chaosMode ? 0xc0392b : 0x1a252f);
        toggleBg.setInteractive();

        // Toggle text
        const toggleText = this.add.text(x, y, chaosMode ? 'CHAOS MODE: ON' : 'CHAOS MODE: OFF', {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Comic Sans MS'
        }).setOrigin(0.5);

        // Description
        const descText = this.add.text(x, y + 30, 'Everyone moves & shoots together!', {
            fontSize: '11px',
            fill: '#95a5a6',
            fontFamily: 'Comic Sans MS'
        }).setOrigin(0.5);

        toggleBg.on('pointerdown', () => {
            const newState = localStorage.getItem('chaosMode') !== 'true';
            localStorage.setItem('chaosMode', newState.toString());

            // Update visuals
            toggleBg.setFillStyle(newState ? 0xe74c3c : 0x2c3e50);
            toggleBg.setStrokeStyle(3, newState ? 0xc0392b : 0x1a252f);
            toggleText.setText(newState ? 'CHAOS MODE: ON' : 'CHAOS MODE: OFF');
        });

        toggleBg.on('pointerover', () => {
            toggleBg.setAlpha(0.8);
        });

        toggleBg.on('pointerout', () => {
            toggleBg.setAlpha(1);
        });
    }

    drawPowerUpLegend(centerX, y) {
        this.add.text(centerX, y, 'Power-Ups:', {
            fontSize: '14px',
            fill: '#f39c12',
            fontFamily: 'Comic Sans MS'
        }).setOrigin(0.5);

        const powerUps = [
            { text: 'Heart/Pizza = +1 Health', color: '#e74c3c' },
            { text: 'Star/Hotdog = Speed Boost', color: '#f1c40f' },
            { text: 'Shield/Cone = Block Hit', color: '#3498db' },
            { text: 'Lightning/Coffee = Rapid Fire', color: '#9b59b6' }
        ];

        const startX = centerX - 180;
        for (let i = 0; i < powerUps.length; i++) {
            const x = startX + (i % 2) * 180;
            const row = Math.floor(i / 2);
            this.add.text(x, y + 20 + row * 18, powerUps[i].text, {
                fontSize: '11px',
                fill: powerUps[i].color,
                fontFamily: 'Comic Sans MS'
            });
        }
    }
}
