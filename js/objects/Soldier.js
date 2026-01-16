/**
 * 士兵类
 * 管理游戏中的士兵角色
 */
class Soldier {
    /**
     * 创建士兵
     * @param {Phaser.Scene} scene - 场景引用
     * @param {number} x - X坐标
     * @param {number} y - Y坐标（脚底位置）
     */
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;

        // 创建精灵
        this.sprite = scene.add.sprite(x, y, 'soldier');
        this.sprite.setOrigin(GameConfig.SOLDIER.ORIGIN_X, GameConfig.SOLDIER.ORIGIN_Y);

        // 播放站立动画
        this.playIdle();

        // 状态
        this.isWalking = false;
        this.isFalling = false;
    }

    /**
     * 播放站立动画
     */
    playIdle() {
        this.sprite.play('soldier-idle');
        this.isWalking = false;
    }

    /**
     * 播放行走动画
     */
    playWalk() {
        this.sprite.play('soldier-walk');
        this.isWalking = true;
    }

    /**
     * 停止动画
     */
    stopAnimation() {
        this.sprite.stop();
    }

    /**
     * 设置位置
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.sprite.setPosition(x, y);
    }

    /**
     * 设置X坐标
     * @param {number} x - X坐标
     */
    setX(x) {
        this.x = x;
        this.sprite.x = x;
    }

    /**
     * 设置Y坐标
     * @param {number} y - Y坐标
     */
    setY(y) {
        this.y = y;
        this.sprite.y = y;
    }

    /**
     * 向前移动
     * @param {number} distance - 移动距离
     */
    moveForward(distance) {
        this.x += distance;
        this.sprite.x = this.x;
    }

    /**
     * 向下移动（下落）
     * @param {number} distance - 移动距离
     */
    moveDown(distance) {
        this.y += distance;
        this.sprite.y = this.y;
    }

    /**
     * 获取X坐标
     * @returns {number}
     */
    getX() {
        return this.x;
    }

    /**
     * 获取Y坐标
     * @returns {number}
     */
    getY() {
        return this.y;
    }

    /**
     * 开始下落
     * @param {Function} onComplete - 下落完成回调
     */
    fall(onComplete) {
        this.isFalling = true;
        this.stopAnimation();

        this.scene.tweens.add({
            targets: this.sprite,
            y: GameConfig.HEIGHT + 200,
            angle: 90,
            duration: 800,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.isFalling = false;
                if (onComplete) {
                    onComplete();
                }
            }
        });
    }

    /**
     * 移动到指定位置（带动画）
     * @param {number} targetX - 目标X坐标
     * @param {number} duration - 动画时长（毫秒）
     * @param {Function} onComplete - 完成回调
     */
    moveTo(targetX, duration, onComplete) {
        this.scene.tweens.add({
            targets: [this, this.sprite],
            x: targetX,
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
                if (onComplete) {
                    onComplete();
                }
            }
        });
    }

    /**
     * 设置旋转角度
     * @param {number} angle - 角度（度）
     */
    setAngle(angle) {
        this.sprite.setAngle(angle);
    }

    /**
     * 设置透明度
     * @param {number} alpha - 透明度（0-1）
     */
    setAlpha(alpha) {
        this.sprite.setAlpha(alpha);
    }

    /**
     * 销毁士兵
     */
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }

    /**
     * 检查是否在屏幕外
     * @returns {boolean}
     */
    isOutOfScreen() {
        return this.y > GameConfig.HEIGHT + 100 ||
               this.x < -100 ||
               this.x > GameConfig.WIDTH + 100;
    }
}
