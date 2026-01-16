/**
 * 暂停管理模块
 * 负责游戏暂停界面的显示和控制
 *
 * 【使用说明】
 * - PauseManager.pause(scene): 暂停游戏
 * - PauseManager.resume(): 恢复游戏
 * - PauseManager.toggle(scene): 切换暂停状态
 *
 * 【API】
 * - pause(scene): 暂停游戏并显示暂停界面
 * - resume(): 恢复游戏并隐藏暂停界面
 * - toggle(scene): 切换暂停/恢复状态
 * - isPaused(): 检查是否暂停中
 */

const PauseManager = {
    // 当前场景引用
    currentScene: null,

    // UI 元素
    overlay: null,
    pauseTextContainer: null,
    resumeButton: null,

    // 状态
    paused: false,

    // 配置
    config: {
        // 遮罩层颜色
        overlayColor: 0x000000,
        // 遮罩层透明度
        overlayAlpha: 0.5,
        // PAUSE 文字 Y 位置
        textY: 400,
        // 每个字符的宽度
        charWidth: 100,
        // 每个字符的高度
        charHeight: 100,
        // 字符间距
        charSpacing: -20,
        // UI 层级
        depth: 300
    },

    /**
     * 暂停游戏
     * @param {Phaser.Scene} scene - 当前场景
     */
    pause(scene) {
        if (this.paused) {
            return;
        }

        this.currentScene = scene;
        this.paused = true;

        // 暂停场景的物理和更新
        scene.scene.pause();

        // 创建暂停 UI（在暂停后创建，所以需要用 scene.scene.launch 或直接添加）
        // 由于场景已暂停，我们需要在暂停前创建 UI，或者使用不同的方式
        // 这里我们先恢复场景来创建 UI，然后再暂停游戏逻辑
        scene.scene.resume();

        this.createUI();

        // 暂停游戏时间和物理，但保持渲染
        scene.time.paused = true;
        scene.physics && (scene.physics.world.isPaused = true);
    },

    /**
     * 恢复游戏
     */
    resume() {
        if (!this.paused || !this.currentScene) {
            return;
        }

        // 恢复游戏时间和物理
        this.currentScene.time.paused = false;
        this.currentScene.physics && (this.currentScene.physics.world.isPaused = false);

        // 隐藏 UI
        this.hideUI();

        this.paused = false;
    },

    /**
     * 切换暂停状态
     * @param {Phaser.Scene} scene - 当前场景
     */
    toggle(scene) {
        if (this.paused) {
            this.resume();
        } else {
            this.pause(scene);
        }
    },

    /**
     * 创建暂停 UI
     */
    createUI() {
        const canvas = LayoutConfig.CANVAS;

        // 半透明遮罩
        this.overlay = this.currentScene.add.rectangle(
            canvas.WIDTH / 2,
            canvas.HEIGHT / 2,
            canvas.WIDTH,
            canvas.HEIGHT,
            this.config.overlayColor,
            this.config.overlayAlpha
        );
        this.overlay.setDepth(this.config.depth);

        // 点击遮罩恢复游戏
        this.overlay.setInteractive();
        this.overlay.on('pointerdown', () => {
            this.resume();
        });

        // 创建 PAUSE 文字（使用图片字体）
        this.createPauseText();

        // 创建恢复按钮提示
        this.createResumeHint();
    },

    /**
     * 使用图片字体创建 PAUSE 文字
     */
    createPauseText() {
        const canvas = LayoutConfig.CANVAS;
        const text = 'PAUSE';
        const { charWidth, charHeight, charSpacing } = this.config;

        // 创建容器
        this.pauseTextContainer = this.currentScene.add.container(
            canvas.WIDTH / 2,
            this.config.textY
        );
        this.pauseTextContainer.setDepth(this.config.depth + 1);

        // 计算总宽度
        const totalWidth = text.length * charWidth + (text.length - 1) * charSpacing;
        let currentX = -totalWidth / 2;

        // 为每个字符创建精灵
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const frameIndex = this.getHighScoreFontFrame(char);

            if (frameIndex !== -1) {
                const charSprite = this.currentScene.add.image(
                    currentX + charWidth / 2,
                    0,
                    'high-score-font',
                    frameIndex
                );
                charSprite.setDisplaySize(charWidth, charHeight);
                this.pauseTextContainer.add(charSprite);
            }

            currentX += charWidth + charSpacing;
        }
    },

    /**
     * 创建恢复提示
     */
    createResumeHint() {
        const canvas = LayoutConfig.CANVAS;

        this.resumeHint = this.currentScene.add.text(
            canvas.WIDTH / 2,
            this.config.textY + 120,
            'Click any place to restart.',
            {
                fontSize: '32px',
                fill: '#ffffff',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5);
        this.resumeHint.setDepth(this.config.depth + 1);

        // 闪烁动画
        this.currentScene.tweens.add({
            targets: this.resumeHint,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    },

    /**
     * 获取字符对应的帧索引（与 MenuScene 相同的映射）
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
     * 隐藏暂停 UI
     */
    hideUI() {
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
        if (this.pauseTextContainer) {
            this.pauseTextContainer.destroy();
            this.pauseTextContainer = null;
        }
        if (this.resumeHint) {
            this.resumeHint.destroy();
            this.resumeHint = null;
        }
    },

    /**
     * 检查是否暂停中
     * @returns {boolean}
     */
    isPaused() {
        return this.paused;
    },

    /**
     * 重置状态
     */
    reset() {
        this.hideUI();
        this.paused = false;
        this.currentScene = null;
    }
};
