/**
 * 资源预加载场景
 * 负责加载所有游戏资源并显示加载进度
 *
 * 【配置文件依赖】
 * - AssetsConfig.js: 美术资源配置
 * - LayoutConfig.js: 布局配置
 */
class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        const layout = LayoutConfig.LOADING;

        // 显示加载Logo
        const logo = this.add.image(
            LayoutConfig.getCenterX(),
            layout.LOGO_Y,
            'loading-logo'
        );

        // 创建进度条背景
        const progressBarBg = this.add.graphics();
        progressBarBg.fillStyle(layout.PROGRESS_BAR.BG_COLOR, layout.PROGRESS_BAR.BG_ALPHA);
        progressBarBg.fillRect(
            LayoutConfig.getCenterX() - layout.PROGRESS_BAR.WIDTH / 2,
            layout.PROGRESS_BAR.Y,
            layout.PROGRESS_BAR.WIDTH,
            layout.PROGRESS_BAR.HEIGHT
        );

        // 创建进度条
        const progressBar = this.add.graphics();
        const barPadding = layout.PROGRESS_BAR.PADDING;
        const fillWidth = layout.PROGRESS_BAR.WIDTH - barPadding * 2;
        const fillHeight = layout.PROGRESS_BAR.HEIGHT - barPadding * 2;

        // 加载进度文本
        const loadingText = this.add.text(
            LayoutConfig.getCenterX(),
            layout.TEXT_Y,
            '加载中... 0%',
            LayoutConfig.TEXT_STYLES.LOADING
        ).setOrigin(0.5);

        // 监听加载进度
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(layout.PROGRESS_BAR.FILL_COLOR, 1);
            progressBar.fillRect(
                LayoutConfig.getCenterX() - layout.PROGRESS_BAR.WIDTH / 2 + barPadding,
                layout.PROGRESS_BAR.Y + barPadding,
                fillWidth * value,
                fillHeight
            );
            loadingText.setText(`加载中... ${Math.floor(value * 100)}%`);
        });

        // 加载完成
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBarBg.destroy();
            loadingText.setText('加载完成！');
        });

        // 使用AssetsConfig加载所有资源
        this.loadImages();
        this.loadAudio();
    }

    /**
     * 加载所有图片资源
     * 从AssetsConfig.IMAGES读取配置
     */
    loadImages() {
        const images = AssetsConfig.IMAGES;

        // 遍历所有图片配置
        Object.keys(images).forEach(key => {
            const config = images[key];
            const path = AssetsConfig.getImagePath(key);

            if (config.isSprite && config.frameConfig) {
                // 加载精灵表
                this.load.spritesheet(config.key, path, config.frameConfig);
            } else {
                // 加载普通图片
                this.load.image(config.key, path);
            }
        });
    }

    /**
     * 加载所有音频资源
     * 从AssetsConfig.AUDIO读取配置
     */
    loadAudio() {
        const audio = AssetsConfig.AUDIO;

        // 遍历所有音频配置
        Object.keys(audio).forEach(key => {
            const config = audio[key];
            const paths = AssetsConfig.getAudioPaths(key);
            this.load.audio(config.key, paths);
        });
    }

    create() {
        // 创建士兵动画
        this.createAnimations();

        // 设置广告数据
        AdvertiseManager.setAdData({
            gameName: "Wuthering Waves",
            iconUrl: "https://llm-api.synsight.ai/aiad/a0airvana/art/icons/adgames/WutheringWaves.png",
            gameAdUrl: "https://mc.kurogames.com/main#main",
            score: 30
        });

        // 启动广告计时器（全局计时，不受场景切换影响）
        AdvertiseManager.start();

        // 短暂延迟后跳转到菜单场景
        this.time.delayedCall(500, () => {
            this.scene.start('MenuScene');
        });
    }

    /**
     * 创建动画
     * 从AssetsConfig.ANIMATIONS读取配置
     */
    createAnimations() {
        const animations = AssetsConfig.ANIMATIONS;

        Object.keys(animations).forEach(key => {
            const config = animations[key];

            // 检查动画是否已存在
            if (this.anims.exists(config.key)) {
                return;
            }

            let frames;

            if (config.customFrames) {
                // 使用自定义帧序列（跨精灵表）
                frames = config.customFrames;
            } else if (config.frames) {
                // 使用帧范围生成
                frames = this.anims.generateFrameNumbers(config.spriteKey, config.frames);
            }

            this.anims.create({
                key: config.key,
                frames: frames,
                frameRate: config.frameRate,
                repeat: config.repeat
            });
        });
    }
}
