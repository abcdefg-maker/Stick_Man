/**
 * 棍兵 - Stick Samurai
 * Phaser 3 游戏主入口
 */

// Phaser 3 游戏配置
const config = {
    type: Phaser.AUTO,
    width: GameConfig.WIDTH,
    height: GameConfig.HEIGHT,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [BootScene, PreloadScene, MenuScene, GameScene],
    render: {
        pixelArt: false,
        antialias: true
    }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 全局游戏数据
const GameData = {
    score: 0,
    highScore: 0,
    soundEnabled: true,
    melodyEnabled: true
};
