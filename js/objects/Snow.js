/**
 * 雪花特效类
 * 管理游戏中的雪花粒子效果
 */
class Snow {
    /**
     * 创建雪花系统
     * @param {Phaser.Scene} scene - 场景引用
     * @param {number} count - 雪花数量
     */
    constructor(scene, count = GameConfig.SNOW.COUNT) {
        this.scene = scene;
        this.snowflakes = [];
        this.count = count;

        this.createSnowflakes();
    }

    /**
     * 创建所有雪花
     */
    createSnowflakes() {
        for (let i = 0; i < this.count; i++) {
            this.createSingleSnowflake();
        }
    }

    /**
     * 创建单个雪花
     * @returns {Object} 雪花对象
     */
    createSingleSnowflake() {
        const x = Phaser.Math.Between(0, GameConfig.WIDTH);
        const y = Phaser.Math.Between(-50, GameConfig.HEIGHT);
        const scale = Phaser.Math.FloatBetween(
            GameConfig.SNOW.MIN_SCALE,
            GameConfig.SNOW.MAX_SCALE
        );
        const speed = Phaser.Math.Between(
            GameConfig.SNOW.MIN_SPEED,
            GameConfig.SNOW.MAX_SPEED
        );
        const alpha = Phaser.Math.FloatBetween(0.3, 0.7);

        const sprite = this.scene.add.image(x, y, 'snow');
        sprite.setScale(scale);
        sprite.setAlpha(alpha);

        const snowflake = {
            sprite: sprite,
            speed: speed,
            swaySpeed: Phaser.Math.FloatBetween(0.5, 2),
            swayAmount: Phaser.Math.Between(20, 50),
            startX: x,
            time: Phaser.Math.FloatBetween(0, Math.PI * 2)
        };

        this.snowflakes.push(snowflake);

        // 创建下落动画
        this.animateSnowflake(snowflake);

        return snowflake;
    }

    /**
     * 为雪花创建下落动画
     * @param {Object} snowflake - 雪花对象
     */
    animateSnowflake(snowflake) {
        const duration = (GameConfig.HEIGHT - snowflake.sprite.y + 100) / snowflake.speed * 1000;

        this.scene.tweens.add({
            targets: snowflake.sprite,
            y: GameConfig.HEIGHT + 50,
            duration: duration,
            ease: 'Linear',
            onUpdate: () => {
                // 左右摇摆
                snowflake.time += 0.02;
                const swayOffset = Math.sin(snowflake.time * snowflake.swaySpeed) * snowflake.swayAmount;
                snowflake.sprite.x = snowflake.startX + swayOffset;
            },
            onComplete: () => {
                // 重置到顶部
                this.resetSnowflake(snowflake);
            }
        });
    }

    /**
     * 重置雪花位置
     * @param {Object} snowflake - 雪花对象
     */
    resetSnowflake(snowflake) {
        snowflake.sprite.y = -50;
        snowflake.startX = Phaser.Math.Between(0, GameConfig.WIDTH);
        snowflake.sprite.x = snowflake.startX;
        snowflake.time = Phaser.Math.FloatBetween(0, Math.PI * 2);

        // 重新开始动画
        this.animateSnowflake(snowflake);
    }

    /**
     * 设置雪花数量
     * @param {number} count - 新的雪花数量
     */
    setCount(count) {
        const diff = count - this.count;

        if (diff > 0) {
            // 添加更多雪花
            for (let i = 0; i < diff; i++) {
                this.createSingleSnowflake();
            }
        } else if (diff < 0) {
            // 移除部分雪花
            for (let i = 0; i < -diff; i++) {
                const snowflake = this.snowflakes.pop();
                if (snowflake && snowflake.sprite) {
                    snowflake.sprite.destroy();
                }
            }
        }

        this.count = count;
    }

    /**
     * 暂停所有雪花动画
     */
    pause() {
        this.snowflakes.forEach(snowflake => {
            this.scene.tweens.killTweensOf(snowflake.sprite);
        });
    }

    /**
     * 恢复所有雪花动画
     */
    resume() {
        this.snowflakes.forEach(snowflake => {
            this.animateSnowflake(snowflake);
        });
    }

    /**
     * 设置可见性
     * @param {boolean} visible - 是否可见
     */
    setVisible(visible) {
        this.snowflakes.forEach(snowflake => {
            snowflake.sprite.setVisible(visible);
        });
    }

    /**
     * 销毁所有雪花
     */
    destroy() {
        this.snowflakes.forEach(snowflake => {
            if (snowflake.sprite) {
                this.scene.tweens.killTweensOf(snowflake.sprite);
                snowflake.sprite.destroy();
            }
        });
        this.snowflakes = [];
    }
}
