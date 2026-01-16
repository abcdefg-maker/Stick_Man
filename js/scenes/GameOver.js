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
    gameOverText: null,
    finalScoreText: null,
    newHighScoreText: null,

    // 状态
    isShown: false,

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

        // 延迟后重新开始
        const sceneRef = this.currentScene;
        sceneRef.time.delayedCall(GameplayConfig.GAME_FLOW.GAME_OVER_DELAY, () => {
            this.hide();
            sceneRef.scene.start('MenuScene');
        });
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
        this.overlay.setDepth(200);

        // 游戏结束文本
        const titleConfig = gameOverLayout.TITLE;
        this.gameOverText = this.currentScene.add.text(
            titleConfig.x,
            titleConfig.y,
            titleConfig.text,
            {
                fontSize: `${titleConfig.fontSize}px`,
                fill: titleConfig.fontColor,
                fontFamily: 'Arial',
                stroke: titleConfig.strokeColor,
                strokeThickness: titleConfig.strokeThickness
            }
        ).setOrigin(0.5);
        this.gameOverText.setDepth(201);

        // 最终分数
        const finalScoreConfig = gameOverLayout.FINAL_SCORE;
        this.finalScoreText = this.currentScene.add.text(
            finalScoreConfig.x,
            finalScoreConfig.y,
            `${finalScoreConfig.prefix}${score}`,
            {
                fontSize: `${finalScoreConfig.fontSize}px`,
                fill: finalScoreConfig.fontColor,
                fontFamily: 'Arial',
                stroke: finalScoreConfig.strokeColor,
                strokeThickness: finalScoreConfig.strokeThickness
            }
        ).setOrigin(0.5);
        this.finalScoreText.setDepth(201);

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
            this.newHighScoreText.setDepth(201);

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
     * 隐藏游戏结束界面
     */
    hide() {
        if (this.overlay) {
            this.overlay.destroy();
            this.overlay = null;
        }
        if (this.gameOverText) {
            this.gameOverText.destroy();
            this.gameOverText = null;
        }
        if (this.finalScoreText) {
            this.finalScoreText.destroy();
            this.finalScoreText = null;
        }
        if (this.newHighScoreText) {
            this.newHighScoreText.destroy();
            this.newHighScoreText = null;
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
