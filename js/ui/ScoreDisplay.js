/**
 * 分数显示类
 * 管理游戏中的分数显示
 */
class ScoreDisplay {
    /**
     * 创建分数显示
     * @param {Phaser.Scene} scene - 场景引用
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {Object} config - 配置选项
     */
    constructor(scene, x, y, config = {}) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.score = 0;

        // 默认配置
        const defaultConfig = {
            fontSize: '72px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            prefix: '',
            suffix: ''
        };

        this.config = { ...defaultConfig, ...config };

        // 创建文本对象
        this.text = scene.add.text(x, y, this.getDisplayText(), {
            fontSize: this.config.fontSize,
            fontFamily: this.config.fontFamily,
            fill: this.config.color,
            stroke: this.config.stroke,
            strokeThickness: this.config.strokeThickness
        }).setOrigin(0.5);
    }

    /**
     * 获取显示文本
     * @returns {string}
     */
    getDisplayText() {
        return `${this.config.prefix}${this.score}${this.config.suffix}`;
    }

    /**
     * 设置分数
     * @param {number} score - 新分数
     * @param {boolean} animate - 是否显示动画
     */
    setScore(score, animate = false) {
        const oldScore = this.score;
        this.score = score;
        this.text.setText(this.getDisplayText());

        if (animate && score > oldScore) {
            this.playScoreAnimation();
        }
    }

    /**
     * 增加分数
     * @param {number} amount - 增加量
     * @param {boolean} animate - 是否显示动画
     */
    addScore(amount, animate = true) {
        this.setScore(this.score + amount, animate);
    }

    /**
     * 获取当前分数
     * @returns {number}
     */
    getScore() {
        return this.score;
    }

    /**
     * 播放分数增加动画
     */
    playScoreAnimation() {
        // 放大然后恢复
        this.scene.tweens.add({
            targets: this.text,
            scale: 1.3,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
    }

    /**
     * 设置位置
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.text.setPosition(x, y);
    }

    /**
     * 设置可见性
     * @param {boolean} visible - 是否可见
     */
    setVisible(visible) {
        this.text.setVisible(visible);
    }

    /**
     * 设置深度（图层顺序）
     * @param {number} depth - 深度值
     */
    setDepth(depth) {
        this.text.setDepth(depth);
    }

    /**
     * 销毁分数显示
     */
    destroy() {
        if (this.text) {
            this.text.destroy();
            this.text = null;
        }
    }
}

/**
 * 高分显示类
 * 专门用于显示历史最高分
 */
class HighScoreDisplay extends ScoreDisplay {
    /**
     * 创建高分显示
     * @param {Phaser.Scene} scene - 场景引用
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    constructor(scene, x, y) {
        super(scene, x, y, {
            fontSize: '36px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            prefix: 'HIGH SCORE: '
        });

        // 从存储中读取高分
        this.setScore(StorageManager.getHighScore());
    }

    /**
     * 更新高分（如果新分数更高）
     * @param {number} newScore - 新分数
     * @returns {boolean} 是否创造新纪录
     */
    updateHighScore(newScore) {
        if (newScore > this.score) {
            this.setScore(newScore, true);
            StorageManager.setHighScore(newScore);
            return true;
        }
        return false;
    }
}

/**
 * 浮动文本类
 * 用于显示 "+1" 等临时提示
 */
class FloatingText {
    /**
     * 创建浮动文本
     * @param {Phaser.Scene} scene - 场景引用
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} content - 文本内容
     * @param {Object} config - 配置选项
     */
    constructor(scene, x, y, content, config = {}) {
        this.scene = scene;

        // 默认配置
        const defaultConfig = {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 4,
            duration: 800,
            floatDistance: 100
        };

        const finalConfig = { ...defaultConfig, ...config };

        // 创建文本
        this.text = scene.add.text(x, y, content, {
            fontSize: finalConfig.fontSize,
            fontFamily: finalConfig.fontFamily,
            fill: finalConfig.color,
            stroke: finalConfig.stroke,
            strokeThickness: finalConfig.strokeThickness
        }).setOrigin(0.5);

        // 播放浮动动画
        this.playFloatAnimation(finalConfig.duration, finalConfig.floatDistance);
    }

    /**
     * 播放浮动动画
     * @param {number} duration - 动画时长
     * @param {number} floatDistance - 浮动距离
     */
    playFloatAnimation(duration, floatDistance) {
        this.scene.tweens.add({
            targets: this.text,
            y: this.text.y - floatDistance,
            alpha: 0,
            scale: 1.5,
            duration: duration,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.destroy();
            }
        });
    }

    /**
     * 销毁浮动文本
     */
    destroy() {
        if (this.text) {
            this.text.destroy();
            this.text = null;
        }
    }
}
