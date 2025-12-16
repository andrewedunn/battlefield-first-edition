// ABOUTME: Entry point for Battlefield First Edition game
// ABOUTME: Configures and initializes the Phaser game engine

const config = {
    type: Phaser.AUTO,
    width: 800,  // 20 tiles * 40 pixels
    height: 600, // 14 tiles * 40 pixels + some extra for UI
    parent: 'game',
    backgroundColor: '#1a1a2e',
    scene: [BootScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Create the game!
const game = new Phaser.Game(config);
