// ABOUTME: Entry point for Battlefield First Edition game
// ABOUTME: Configures and initializes the Phaser game engine

const config = {
    type: Phaser.AUTO,
    width: 784,  // 28 tiles * 28 pixels
    height: 540, // 18 tiles * 28 pixels + extra for UI
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
