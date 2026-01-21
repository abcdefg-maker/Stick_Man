/**
 * 游戏结束管理模块
 * 负责显示游戏结束界面和场景跳转
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
    gameOverImage: null,
    menuButton: null,

    // 状态
    isShown: false,

    // 配置
    config: {
        // GAME OVER 图片配置
        gameOverImage: {
            y: 400,
            scale: 1.0
        },
        // 返回主菜单按钮配置
        menuButton: {
            y: 650,
            scale: 1.0,
            // 弹出动画配置
            animation: {
                delay: 150,
                duration: 400,
                overshoot: 1.2
            }
        },
        depth: 200
    },

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
        this.createUI();

        // 创建按钮（带动画）
        this.createButtons();

        // 如果广告处于折叠状态，展开广告
        if (AdvertiseManager.isShown && !AdvertiseManager.isExpanded) {
            AdvertiseManager.expand();
        }
    },

    /**
     * 创建游戏结束 UI
     */
    createUI() {
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

        // 显示 GAME OVER 大图（占位符或实际图片）
        this.createGameOverImage();
    },

    /**
     * 创建 GAME OVER 图片
     * 如果图片不存在，则动态生成占位符
     */
    createGameOverImage() {
        const canvas = LayoutConfig.CANVAS;
        const imgConfig = this.config.gameOverImage;

        // 检查是否已加载实际图片
        if (this.currentScene.textures.exists('game-over-image')) {
            this.gameOverImage = this.currentScene.add.image(
                canvas.WIDTH / 2,
                imgConfig.y,
                'game-over-image'
            );
        } else {
            // 动态生成占位符
            this.createPlaceholderGameOverImage();
            this.gameOverImage = this.currentScene.add.image(
                canvas.WIDTH / 2,
                imgConfig.y,
                'game-over-placeholder'
            );
        }

        this.gameOverImage.setScale(imgConfig.scale);
        this.gameOverImage.setDepth(this.config.depth + 1);
    },

    /**
     * 创建 GAME OVER 占位符图片
     */
    createPlaceholderGameOverImage() {
        if (this.currentScene.textures.exists('game-over-placeholder')) {
            return;
        }

        const width = 500;
        const height = 150;

        const graphics = this.currentScene.make.graphics({ x: 0, y: 0, add: false });

        // 绘制背景
        graphics.fillStyle(0x333333, 1);
        graphics.fillRoundedRect(0, 0, width, height, 20);

        // 绘制边框
        graphics.lineStyle(4, 0xFFFF00, 1);
        graphics.strokeRoundedRect(2, 2, width - 4, height - 4, 18);

        // 生成纹理
        graphics.generateTexture('game-over-placeholder', width, height);
        graphics.destroy();

        // 添加文字（使用单独的文本对象会更清晰）
        // 由于占位符是临时的，这里简单处理
    },

    /**
     * 创建返回主菜单按钮
     */
    createButtons() {
        const canvas = LayoutConfig.CANVAS;
        const btnConfig = this.config.menuButton;

        // 检查是否已加载实际图片
        if (this.currentScene.textures.exists('menu-button')) {
            this.menuButton = this.currentScene.add.image(
                canvas.WIDTH / 2,
                btnConfig.y,
                'menu-button'
            );
        } else {
            // 动态生成占位符
            this.createPlaceholderMenuButton();
            this.menuButton = this.currentScene.add.image(
                canvas.WIDTH / 2,
                btnConfig.y,
                'menu-button-placeholder'
            );
        }

        this.menuButton.setScale(0); // 初始缩放为 0，用于动画
        this.menuButton.setDepth(this.config.depth + 2);
        this.menuButton.setInteractive({ useHandCursor: true });

        // 绑定点击事件
        this.menuButton.on('pointerdown', () => {
            this.onMenuButtonClick();
        });

        // 添加悬停效果
        this.menuButton.on('pointerover', () => {
            this.currentScene.tweens.add({
                targets: this.menuButton,
                scale: btnConfig.scale * 1.1,
                duration: 100,
                ease: 'Sine.easeOut'
            });
        });

        this.menuButton.on('pointerout', () => {
            this.currentScene.tweens.add({
                targets: this.menuButton,
                scale: btnConfig.scale,
                duration: 100,
                ease: 'Sine.easeOut'
            });
        });

        // 执行弹出动画
        this.animateButtonIn();
    },

    /**
     * 创建返回主菜单按钮占位符
     */
    createPlaceholderMenuButton() {
        if (this.currentScene.textures.exists('menu-button-placeholder')) {
            return;
        }

        const width = 200;
        const height = 60;

        const graphics = this.currentScene.make.graphics({ x: 0, y: 0, add: false });

        // 绘制按钮背景
        graphics.fillStyle(0xFFFF00, 1);
        graphics.fillRoundedRect(0, 0, width, height, 10);

        // 绘制边框
        graphics.lineStyle(3, 0x000000, 1);
        graphics.strokeRoundedRect(1, 1, width - 2, height - 2, 9);

        // 生成纹理
        graphics.generateTexture('menu-button-placeholder', width, height);
        graphics.destroy();
    },

    /**
     * 按钮弹出动画
     */
    animateButtonIn() {
        const btnConfig = this.config.menuButton;
        const anim = btnConfig.animation;
        const targetScale = btnConfig.scale;
        const overshootScale = targetScale * anim.overshoot;

        // 延迟后执行动画
        this.currentScene.time.delayedCall(anim.delay, () => {
            // 第一阶段：从 0 放大到超过目标大小
            this.currentScene.tweens.add({
                targets: this.menuButton,
                scale: overshootScale,
                duration: anim.duration * 0.6,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    // 第二阶段：缩小到正常大小（弹簧效果）
                    this.currentScene.tweens.add({
                        targets: this.menuButton,
                        scale: targetScale,
                        duration: anim.duration * 0.4,
                        ease: 'Sine.easeInOut'
                    });
                }
            });
        });
    },

    /**
     * 返回主菜单按钮点击处理
     */
    onMenuButtonClick() {
        // 播放按钮音效
        if (GameData.soundEnabled && this.currentScene) {
            this.currentScene.sound.play('sfx-button', { volume: GameplayConfig.AUDIO.SFX_VOLUME });
        }

        const sceneRef = this.currentScene;

        // 返回主菜单
        this.hide();
        sceneRef.scene.start('MenuScene');
    },

    /**
     * 隐藏游戏结束界面
     */
    hide() {
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
        if (this.gameOverImage) {
            this.gameOverImage.destroy();
            this.gameOverImage = null;
        }
        if (this.menuButton) {
            this.menuButton.destroy();
            this.menuButton = null;
        }

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
