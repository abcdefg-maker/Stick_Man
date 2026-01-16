/**
 * 主菜单场景
 * 显示游戏Logo、开始按钮和设置按钮
 *
 * 【配置文件依赖】
 * - LayoutConfig.js: UI布局配置
 * - GameplayConfig.js: 雪花等特效参数
 */
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const layout = LayoutConfig.MENU;
        const canvas = LayoutConfig.CANVAS;

        // 添加背景
        this.add.image(layout.BACKGROUND.x, layout.BACKGROUND.y, 'background')
            .setScale(layout.BACKGROUND.scale);

        // 添加太阳装饰（旋转动画）
        this.sunLogo = this.add.image(layout.SUN_LOGO.x, layout.SUN_LOGO.y, 'sun-logo')
            .setScale(layout.SUN_LOGO.scale);

        // 太阳旋转动画
        if (layout.SUN_LOGO.rotation.enabled) {
            this.tweens.add({
                targets: this.sunLogo,
                angle: 360,
                duration: layout.SUN_LOGO.rotation.duration,
                repeat: -1
            });
        }

        // 添加游戏Logo
        this.add.image(layout.GAME_LOGO.x, layout.GAME_LOGO.y, 'game-logo')
            .setScale(layout.GAME_LOGO.scale);

        // 添加开始按钮（带上下晃动动画）
        const playBtnConfig = layout.PLAY_BUTTON;
        this.playButton = this.add.image(playBtnConfig.x, playBtnConfig.y, 'btn-play')
            .setScale(playBtnConfig.scale)
            .setInteractive({ useHandCursor: true });

        // 播放按钮晃动动画
        if (playBtnConfig.animation.type === 'bounce') {
            this.tweens.add({
                targets: this.playButton,
                y: playBtnConfig.y + playBtnConfig.animation.amplitude,
                duration: playBtnConfig.animation.duration,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // 播放按钮点击事件
        this.playButton.on('pointerdown', () => {
            this.playSound('sfx-button');
            EventManager.emit(GameEvents.GAME_START);
            this.scene.start('GameScene');
        });

        // 添加高分显示（使用图片字体）
        const highScoreConfig = layout.HIGH_SCORE;
        this.createHighScoreDisplay(highScoreConfig.x, highScoreConfig.y, GameData.highScore);

        // 添加音效开关按钮
        const soundBtnConfig = layout.SOUND_BUTTON;
        this.soundButton = this.add.image(
            soundBtnConfig.x,
            soundBtnConfig.y,
            GameData.soundEnabled ? 'btn-sound-on' : 'btn-sound-off'
        ).setScale(soundBtnConfig.scale)
         .setInteractive({ useHandCursor: true });

        this.soundButton.on('pointerdown', () => {
            GameData.soundEnabled = !GameData.soundEnabled;
            StorageManager.setSoundEnabled(GameData.soundEnabled);
            this.soundButton.setTexture(GameData.soundEnabled ? 'btn-sound-on' : 'btn-sound-off');
            this.playSound('sfx-button');
            EventManager.emit(GameEvents.SOUND_TOGGLE, GameData.soundEnabled);
        });

        // 添加音乐开关按钮
        const melodyBtnConfig = layout.MELODY_BUTTON;
        this.melodyButton = this.add.image(
            melodyBtnConfig.x,
            melodyBtnConfig.y,
            GameData.melodyEnabled ? 'btn-melody-on' : 'btn-melody-off'
        ).setScale(melodyBtnConfig.scale)
         .setInteractive({ useHandCursor: true });

        this.melodyButton.on('pointerdown', () => {
            GameData.melodyEnabled = !GameData.melodyEnabled;
            StorageManager.setMelodyEnabled(GameData.melodyEnabled);
            this.melodyButton.setTexture(GameData.melodyEnabled ? 'btn-melody-on' : 'btn-melody-off');
            this.playSound('sfx-button');
            EventManager.emit(GameEvents.MUSIC_TOGGLE, GameData.melodyEnabled);

            // 控制背景音乐
            if (GameData.melodyEnabled) {
                this.playBackgroundMusic();
            } else {
                this.stopBackgroundMusic();
            }
        });

        // 播放背景音乐
        if (GameData.melodyEnabled) {
            this.playBackgroundMusic();
        }

        // 添加雪花效果
        this.createSnowEffect();

        // 通知广告模块场景已切换
        AdvertiseManager.onSceneChange(this);

        // 发送场景准备完成事件
        EventManager.emit(GameEvents.SCENE_READY, 'MenuScene');
    }

    playBackgroundMusic() {
        const audioConfig = GameplayConfig.AUDIO;
        if (!this.bgMusic) {
            this.bgMusic = this.sound.add('music-theme', {
                loop: true,
                volume: audioConfig.MUSIC_VOLUME
            });
        }
        if (!this.bgMusic.isPlaying) {
            this.bgMusic.play();
        }
    }

    stopBackgroundMusic() {
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.bgMusic.stop();
        }
    }

    playSound(key) {
        if (GameData.soundEnabled) {
            this.sound.play(key, { volume: GameplayConfig.AUDIO.SFX_VOLUME });
        }
    }

    createSnowEffect() {
        const snowConfig = GameplayConfig.SNOW;
        const canvas = LayoutConfig.CANVAS;

        // 创建雪花粒子
        for (let i = 0; i < snowConfig.COUNT; i++) {
            const x = Phaser.Math.Between(0, canvas.WIDTH);
            const y = Phaser.Math.Between(0, canvas.HEIGHT);
            const scale = Phaser.Math.FloatBetween(snowConfig.MIN_SCALE, snowConfig.MAX_SCALE);
            const speed = Phaser.Math.Between(snowConfig.MIN_SPEED, snowConfig.MAX_SPEED);

            const snow = this.add.image(x, y, 'snow');
            snow.setScale(scale);
            snow.setAlpha(snowConfig.ALPHA);
            snow.setDepth(snowConfig.DEPTH);

            // 雪花下落动画
            this.tweens.add({
                targets: snow,
                y: canvas.HEIGHT + 50,
                x: x + Phaser.Math.Between(-snowConfig.SWAY_RANGE, snowConfig.SWAY_RANGE),
                duration: (canvas.HEIGHT - y + 50) / speed * 1000,
                onComplete: () => {
                    snow.y = -50;
                    snow.x = Phaser.Math.Between(0, canvas.WIDTH);
                    this.resetSnowTween(snow, speed);
                }
            });
        }
    }

    resetSnowTween(snow, speed) {
        const canvas = LayoutConfig.CANVAS;
        const snowConfig = GameplayConfig.SNOW;

        this.tweens.add({
            targets: snow,
            y: canvas.HEIGHT + 50,
            x: snow.x + Phaser.Math.Between(-snowConfig.SWAY_RANGE, snowConfig.SWAY_RANGE),
            duration: (canvas.HEIGHT + 100) / speed * 1000,
            onComplete: () => {
                snow.y = -50;
                snow.x = Phaser.Math.Between(0, canvas.WIDTH);
                this.resetSnowTween(snow, speed);
            }
        });
    }

    /**
     * 创建高分显示（使用图片字体）
     * @param {number} x - 中心X坐标
     * @param {number} y - 中心Y坐标
     * @param {number} score - 分数
     */
    createHighScoreDisplay(x, y, score) {
        const text = `HIGH SCORE: ${score}`;
        const charWidth = 50;  // 显示时每个字符的宽度
        const charHeight = 50; // 显示时每个字符的高度
        const spacing = -5;    // 字符间距

        // 创建容器
        this.highScoreContainer = this.add.container(x, y);

        // 计算总宽度
        let totalWidth = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === ' ') {
                totalWidth += charWidth * 0.5; // 空格宽度
            } else {
                totalWidth += charWidth + spacing;
            }
        }
        totalWidth -= spacing; // 移除最后一个字符后的间距

        // 起始X位置（居中）
        let currentX = -totalWidth / 2;

        // 为每个字符创建精灵
        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if (char === ' ') {
                currentX += charWidth * 0.5;
                continue;
            }

            const frameIndex = this.getHighScoreFontFrame(char);
            if (frameIndex !== -1) {
                const charSprite = this.add.image(currentX + charWidth / 2, 0, 'high-score-font', frameIndex);
                charSprite.setDisplaySize(charWidth, charHeight);
                this.highScoreContainer.add(charSprite);
            }

            currentX += charWidth + spacing;
        }
    }

    /**
     * 获取字符对应的帧索引
     * 字体图片布局：A-Z(0-25), a-z(26-51), 0-9(52-61), :(62), %(63)
     * @param {string} char - 单个字符
     * @returns {number} 帧索引，-1表示不支持的字符
     */
    getHighScoreFontFrame(char) {
        const code = char.charCodeAt(0);

        // A-Z: 帧 0-25
        if (code >= 65 && code <= 90) {
            return code - 65;
        }
        // a-z: 帧 26-51
        if (code >= 97 && code <= 122) {
            return code - 97 + 26;
        }
        // 0-9: 帧 52-61
        if (code >= 48 && code <= 57) {
            return code - 48 + 52;
        }
        // ':' 帧 62
        if (char === ':') {
            return 62;
        }
        // '%' 帧 63
        if (char === '%') {
            return 63;
        }

        return -1; // 不支持的字符
    }
}
