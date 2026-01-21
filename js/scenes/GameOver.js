/**
 * 游戏结束管理模块
 * 负责显示游戏结束界面、处理高分记录和场景跳转
 *
 * 【使用说明】
 * 在 GameScene 中调用 GameOverManager.show(scene, score) 显示游戏结束界面
 *
 * 【API】
 * - show(scene, score): 显示游戏结束界面
 * - hide(): 隐藏游戏结束界面
 */

const GameOverManager = {
    // 当前场景引用
    currentScene: null,

    // UI 元素
    overlay: null,
    gameOverTextContainer: null,
    finalScoreContainer: null,
    newHighScoreText: null,
    buttons: [],

    // 状态
    isShown: false,

    // 配置
    config: {
        // GAME OVER 文字配置
        gameOverY: 350,
        gameOverCharWidth: 100,
        gameOverCharHeight: 100,
        gameOverCharSpacing: -20,
        // SCORE 文字配置
        scoreY: 480,
        scoreCharWidth: 70,
        scoreCharHeight: 70,
        scoreCharSpacing: -20,
        // UI 层级
        depth: 200,
        // 按钮配置
        buttons: {
            y: 650,              // 按钮 Y 位置
            spacing: 140,       // 按钮间距
            scale: 0.9,         // 按钮正常大小
            // 弹出动画配置
            animation: {
                delay: 150,         // 每个按钮之间的延迟
                duration: 400,      // 动画持续时间
                overshoot: 1.2,     // 放大超过的比例
                ease: 'Back.easeOut' // 缓动函数
            }
        }
    },

    // 按钮定义（可扩展）
    buttonDefinitions: [
        {
            key: 'btn-play',
            action: 'restart',
            name: '重玩'
        },
        {
            key: 'btn-info',
            action: 'menu',
            name: '主菜单'
        },
        {
            key: 'btn-more-games',
            action: 'moreGames',
            name: '更多游戏'
        }
    ],

    /**
     * 显示游戏结束界面
     * @param {Phaser.Scene} scene - 当前场景
     * @param {number} score - 最终得分
     */
    show(scene, score) {
        if (this.isShown) {
            return;
        }

        this.currentScene = scene;
        this.isShown = true;

        // 检查是否创造新高分
        const isNewHighScore = StorageManager.updateHighScore(score);
        if (isNewHighScore) {
            GameData.highScore = score;
            EventManager.emit(GameEvents.HIGH_SCORE_UPDATED, score);
        }

        EventManager.emit(GameEvents.GAME_OVER, { score: score, isNewHighScore });

        // 显示 UI
        this.createUI(score, isNewHighScore);

        // 创建按钮（带动画）
        this.createButtons();

        // 如果广告处于折叠状态，展开广告
        if (AdvertiseManager.isShown && !AdvertiseManager.isExpanded) {
            AdvertiseManager.expand();
        }
    },

    /**
     * 创建游戏结束 UI
     * @param {number} score - 最终得分
     * @param {boolean} isNewHighScore - 是否为新高分
     */
    createUI(score, isNewHighScore) {
        const canvas = LayoutConfig.CANVAS;
        const gameOverLayout = LayoutConfig.GAME_OVER;

        // 半透明遮罩
        this.overlay = this.currentScene.add.rectangle(
            canvas.WIDTH / 2,
            canvas.HEIGHT / 2,
            canvas.WIDTH,
            canvas.HEIGHT,
            gameOverLayout.OVERLAY.color,
            gameOverLayout.OVERLAY.alpha
        );
        this.overlay.setDepth(this.config.depth);

        // 使用图片字体创建 GAME OVER 文字
        this.createImageText(
            'GAME OVER',
            canvas.WIDTH / 2,
            this.config.gameOverY,
            this.config.gameOverCharWidth,
            this.config.gameOverCharHeight,
            this.config.gameOverCharSpacing,
            'gameOverTextContainer'
        );

        // 使用图片字体创建 SCORE: xxx 文字
        this.createImageText(
            `SCORE:${score}`,
            canvas.WIDTH / 2,
            this.config.scoreY,
            this.config.scoreCharWidth,
            this.config.scoreCharHeight,
            this.config.scoreCharSpacing,
            'finalScoreContainer'
        );

        // 新高分提示
        if (isNewHighScore) {
            const newRecordConfig = gameOverLayout.NEW_RECORD;
            this.newHighScoreText = this.currentScene.add.text(
                newRecordConfig.x,
                newRecordConfig.y,
                newRecordConfig.text,
                {
                    fontSize: `${newRecordConfig.fontSize}px`,
                    fill: newRecordConfig.fontColor,
                    fontFamily: 'Arial',
                    stroke: newRecordConfig.strokeColor,
                    strokeThickness: newRecordConfig.strokeThickness
                }
            ).setOrigin(0.5);
            this.newHighScoreText.setDepth(this.config.depth + 1);

            // 闪烁动画
            if (newRecordConfig.animation.type === 'blink') {
                this.currentScene.tweens.add({
                    targets: this.newHighScoreText,
                    alpha: 0.5,
                    duration: newRecordConfig.animation.duration,
                    yoyo: true,
                    repeat: -1
                });
            }
        }
    },

    /**
     * 创建按钮（带依次弹出动画）
     */
    createButtons() {
        const canvas = LayoutConfig.CANVAS;
        const btnConfig = this.config.buttons;
        const definitions = this.buttonDefinitions;
        const totalButtons = definitions.length;

        // 计算按钮起始 X 位置（居中排列）
        const totalWidth = (totalButtons - 1) * btnConfig.spacing;
        const startX = canvas.WIDTH / 2 - totalWidth / 2;

        // 清空之前的按钮
        this.buttons = [];

        // 圆形按钮半径
        const buttonRadius = 50;

        // 依次创建每个按钮
        definitions.forEach((def, index) => {
            const x = startX + index * btnConfig.spacing;
            const y = btnConfig.y;

            // 创建纯黄色圆形按钮（初始缩放为 0）
            const button = this.currentScene.add.circle(x, y, buttonRadius, 0xFFFF00);
            button.setScale(0);
            button.setDepth(this.config.depth + 2);
            button.setInteractive({ useHandCursor: true });

            // 存储按钮引用
            this.buttons.push(button);

            // 绑定点击事件
            button.on('pointerdown', () => {
                this.onButtonClick(def.action);
            });

            // 添加悬停效果
            button.on('pointerover', () => {
                this.currentScene.tweens.add({
                    targets: button,
                    scale: btnConfig.scale * 1.1,
                    duration: 100,
                    ease: 'Sine.easeOut'
                });
            });

            button.on('pointerout', () => {
                this.currentScene.tweens.add({
                    targets: button,
                    scale: btnConfig.scale,
                    duration: 100,
                    ease: 'Sine.easeOut'
                });
            });

            // 延迟执行弹出动画
            const delay = index * btnConfig.animation.delay;
            this.animateButtonIn(button, delay, btnConfig);
        });
    },

    /**
     * 按钮弹出动画
     * @param {Phaser.GameObjects.Image} button - 按钮对象
     * @param {number} delay - 延迟时间
     * @param {Object} btnConfig - 按钮配置
     */
    animateButtonIn(button, delay, btnConfig) {
        const anim = btnConfig.animation;
        const targetScale = btnConfig.scale;
        const overshootScale = targetScale * anim.overshoot;

        // 第一阶段：从 0 放大到超过目标大小
        this.currentScene.time.delayedCall(delay, () => {
            this.currentScene.tweens.add({
                targets: button,
                scale: overshootScale,
                duration: anim.duration * 0.6,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    // 第二阶段：缩小到正常大小（弹簧效果）
                    this.currentScene.tweens.add({
                        targets: button,
                        scale: targetScale,
                        duration: anim.duration * 0.4,
                        ease: 'Sine.easeInOut'
                    });
                }
            });
        });
    },

    /**
     * 按钮点击处理
     * @param {string} action - 动作类型
     */
    onButtonClick(action) {
        // 播放按钮音效
        if (GameData.soundEnabled && this.currentScene) {
            this.currentScene.sound.play('sfx-button', { volume: GameplayConfig.AUDIO.SFX_VOLUME });
        }

        const sceneRef = this.currentScene;

        switch (action) {
            case 'restart':
                // 重新开始游戏
                this.hide();
                sceneRef.scene.restart();
                break;

            case 'menu':
                // 返回主菜单
                this.hide();
                sceneRef.scene.start('MenuScene');
                break;

            case 'moreGames':
                // 更多游戏（可扩展：跳转到其他页面或显示列表）
                console.log('More games clicked');
                // 暂时跳转到主菜单
                this.hide();
                sceneRef.scene.start('MenuScene');
                break;

            default:
                console.log('Unknown action:', action);
        }
    },

    /**
     * 使用图片字体创建文字
     * @param {string} text - 要显示的文字
     * @param {number} x - 中心 X 坐标
     * @param {number} y - 中心 Y 坐标
     * @param {number} charWidth - 字符宽度
     * @param {number} charHeight - 字符高度
     * @param {number} charSpacing - 字符间距
     * @param {string} containerName - 容器属性名
     */
    createImageText(text, x, y, charWidth, charHeight, charSpacing, containerName) {
        // 创建容器
        this[containerName] = this.currentScene.add.container(x, y);
        this[containerName].setDepth(this.config.depth + 1);

        // 计算总宽度
        let totalWidth = 0;
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === ' ') {
                totalWidth += charWidth * 0.5;
            } else {
                totalWidth += charWidth + charSpacing;
            }
        }
        totalWidth -= charSpacing;

        // 起始 X 位置（居中）
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
                const charSprite = this.currentScene.add.image(
                    currentX + charWidth / 2,
                    0,
                    'high-score-font',
                    frameIndex
                );
                charSprite.setDisplaySize(charWidth, charHeight);
                this[containerName].add(charSprite);
            }

            currentX += charWidth + charSpacing;
        }
    },

    /**
     * 获取字符对应的帧索引
     * @param {string} char - 单个字符
     * @returns {number} 帧索引
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

        return -1;
    },

    /**
     * 隐藏游戏结束界面
     */
    hide() {
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
        if (this.gameOverTextContainer) {
            this.gameOverTextContainer.destroy();
            this.gameOverTextContainer = null;
        }
        if (this.finalScoreContainer) {
            this.finalScoreContainer.destroy();
            this.finalScoreContainer = null;
        }
        if (this.newHighScoreText) {
            this.newHighScoreText.destroy();
            this.newHighScoreText = null;
        }
        // 清理按钮
        this.buttons.forEach(btn => {
            if (btn) {
                btn.destroy();
            }
        });
        this.buttons = [];

        this.isShown = false;
        this.currentScene = null;
    },

    /**
     * 检查是否正在显示
     * @returns {boolean}
     */
    isVisible() {
        return this.isShown;
    }
};
