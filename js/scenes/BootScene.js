/**
 * 启动场景
 * 负责初始化基本配置和加载启动资源
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // 加载启动Logo用于预加载场景显示
        this.load.image('loading-logo', Assets.IMAGES.LOADING_LOGO);
    }

    create() {
        // 初始化全局游戏数据
        GameData.highScore = StorageManager.getHighScore();
        GameData.soundEnabled = StorageManager.getSoundEnabled();
        GameData.melodyEnabled = StorageManager.getMelodyEnabled();

        // 跳转到预加载场景
        this.scene.start('PreloadScene');
    }
}
