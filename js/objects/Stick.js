/**
 * 棍子类
 * 管理游戏中的棍子对象
 */
class Stick {
    /**
     * 创建棍子
     * @param {Phaser.Scene} scene - 场景引用
     * @param {number} x - 棍子底部X坐标
     * @param {number} y - 棍子底部Y坐标
     */
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.height = 0;
        this.angle = 0; // 0度为竖直向上，90度为水平向右
        this.width = GameConfig.STICK.WIDTH;

        // 创建图形对象用于绘制棍子
        this.graphics = scene.add.graphics();
        this.isVisible = false;
    }

    /**
     * 增加棍子高度
     * @param {number} amount - 增加的高度
     */
    grow(amount) {
        this.height += amount;
        this.height = Math.min(this.height, GameConfig.STICK.MAX_HEIGHT);
        this.draw();
    }

    /**
     * 旋转棍子
     * @param {number} amount - 旋转角度（度）
     * @returns {boolean} 是否已经旋转到位（90度）
     */
    rotate(amount) {
        this.angle += amount;
        if (this.angle >= 90) {
            this.angle = 90;
            this.draw();
            return true;
        }
        this.draw();
        return false;
    }

    /**
     * 绘制棍子
     */
    draw() {
        this.graphics.clear();

        if (!this.isVisible || this.height <= 0) {
            return;
        }

        // 设置棍子颜色（木棍色）
        this.graphics.fillStyle(0x8B4513, 1);

        // 计算旋转后的端点
        const radians = Phaser.Math.DegToRad(this.angle - 90); // -90 因为初始状态是向上
        const endX = this.x + Math.cos(radians) * this.height;
        const endY = this.y + Math.sin(radians) * this.height;

        // 绘制棍子（作为粗线条）
        this.graphics.lineStyle(this.width, 0x8B4513, 1);
        this.graphics.beginPath();
        this.graphics.moveTo(this.x, this.y);
        this.graphics.lineTo(endX, endY);
        this.graphics.strokePath();

        // 绘制端点圆形（让棍子看起来更圆润）
        this.graphics.fillCircle(this.x, this.y, this.width / 2);
        this.graphics.fillCircle(endX, endY, this.width / 2);
    }

    /**
     * 获取棍子末端X坐标
     * @returns {number}
     */
    getEndX() {
        const radians = Phaser.Math.DegToRad(this.angle - 90);
        return this.x + Math.cos(radians) * this.height;
    }

    /**
     * 获取棍子末端Y坐标
     * @returns {number}
     */
    getEndY() {
        const radians = Phaser.Math.DegToRad(this.angle - 90);
        return this.y + Math.sin(radians) * this.height;
    }

    /**
     * 设置位置
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.draw();
    }

    /**
     * 移动棍子
     * @param {number} deltaX - X方向移动距离
     */
    moveX(deltaX) {
        this.x += deltaX;
        this.draw();
    }

    /**
     * 设置可见性
     * @param {boolean} visible - 是否可见
     */
    setVisible(visible) {
        this.isVisible = visible;
        if (!visible) {
            this.graphics.clear();
        } else {
            this.draw();
        }
    }

    /**
     * 重置棍子状态
     */
    reset() {
        this.height = 0;
        this.angle = 0;
        this.draw();
    }

    /**
     * 销毁棍子
     */
    destroy() {
        if (this.graphics) {
            this.graphics.destroy();
            this.graphics = null;
        }
    }

    /**
     * 检查棍子是否能落在指定范围内
     * @param {number} leftEdge - 目标左边缘
     * @param {number} rightEdge - 目标右边缘
     * @returns {boolean}
     */
    canLandOn(leftEdge, rightEdge) {
        const endX = this.getEndX();
        return endX >= leftEdge && endX <= rightEdge;
    }
}
