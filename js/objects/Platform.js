/**
 * 平台类
 * 管理游戏中的平台对象
 */
class Platform {
    /**
     * 创建平台
     * @param {Phaser.Scene} scene - 场景引用
     * @param {number} x - X坐标
     * @param {number} y - Y坐标（平台顶部）
     * @param {number} width - 平台宽度
     */
    constructor(scene, x, y, width) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = GameConfig.PLATFORM.HEIGHT;

        // 创建平台精灵
        this.sprite = scene.add.image(x, y, 'platform');
        this.sprite.setOrigin(0, 0);
        this.sprite.setDisplaySize(width, this.height);
    }

    /**
     * 获取平台右边缘X坐标
     * @returns {number}
     */
    getRightEdge() {
        return this.x + this.width;
    }

    /**
     * 获取平台左边缘X坐标
     * @returns {number}
     */
    getLeftEdge() {
        return this.x;
    }

    /**
     * 获取平台表面Y坐标
     * @returns {number}
     */
    getSurfaceY() {
        return this.y;
    }

    /**
     * 设置X坐标
     * @param {number} x - 新的X坐标
     */
    setX(x) {
        this.x = x;
        this.sprite.x = x;
    }

    /**
     * 移动平台
     * @param {number} deltaX - X方向移动距离
     */
    moveX(deltaX) {
        this.x += deltaX;
        this.sprite.x = this.x;
    }

    /**
     * 销毁平台
     */
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }

    /**
     * 检查点是否在平台上
     * @param {number} x - X坐标
     * @returns {boolean}
     */
    isPointOnPlatform(x) {
        return x >= this.x && x <= this.x + this.width;
    }

    /**
     * 生成随机宽度的平台
     * @param {Phaser.Scene} scene - 场景引用
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @returns {Platform}
     */
    static createRandom(scene, x, y) {
        const width = Phaser.Math.Between(
            GameConfig.PLATFORM.MIN_WIDTH,
            GameConfig.PLATFORM.MAX_WIDTH
        );
        return new Platform(scene, x, y, width);
    }

    /**
     * 计算下一个平台的X坐标
     * @param {Platform} currentPlatform - 当前平台
     * @returns {number}
     */
    static calculateNextX(currentPlatform) {
        const gap = Phaser.Math.Between(
            GameConfig.PLATFORM.GAP_MIN,
            GameConfig.PLATFORM.GAP_MAX
        );
        return currentPlatform.getRightEdge() + gap;
    }
}
