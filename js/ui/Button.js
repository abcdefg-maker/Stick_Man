/**
 * 通用按钮类
 * 提供可交互的按钮功能
 */
class Button {
    /**
     * 创建按钮
     * @param {Phaser.Scene} scene - 场景引用
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} texture - 纹理键名
     * @param {Function} callback - 点击回调函数
     */
    constructor(scene, x, y, texture, callback) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.callback = callback;
        this.isEnabled = true;

        // 创建按钮精灵
        this.sprite = scene.add.image(x, y, texture);
        this.sprite.setInteractive({ useHandCursor: true });

        // 绑定事件
        this.setupEvents();
    }

    /**
     * 设置交互事件
     */
    setupEvents() {
        // 点击事件
        this.sprite.on('pointerdown', () => {
            if (this.isEnabled) {
                this.onPointerDown();
            }
        });

        this.sprite.on('pointerup', () => {
            if (this.isEnabled) {
                this.onPointerUp();
            }
        });

        this.sprite.on('pointerout', () => {
            if (this.isEnabled) {
                this.onPointerOut();
            }
        });

        this.sprite.on('pointerover', () => {
            if (this.isEnabled) {
                this.onPointerOver();
            }
        });
    }

    /**
     * 按下时的处理
     */
    onPointerDown() {
        this.sprite.setScale(0.95);
        if (this.callback) {
            this.callback();
        }
    }

    /**
     * 释放时的处理
     */
    onPointerUp() {
        this.sprite.setScale(1);
    }

    /**
     * 移出时的处理
     */
    onPointerOut() {
        this.sprite.setScale(1);
    }

    /**
     * 移入时的处理
     */
    onPointerOver() {
        // 可以添加悬停效果
    }

    /**
     * 设置按钮纹理
     * @param {string} texture - 纹理键名
     */
    setTexture(texture) {
        this.sprite.setTexture(texture);
    }

    /**
     * 设置按钮位置
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.sprite.setPosition(x, y);
    }

    /**
     * 设置按钮缩放
     * @param {number} scale - 缩放比例
     */
    setScale(scale) {
        this.sprite.setScale(scale);
    }

    /**
     * 设置按钮可见性
     * @param {boolean} visible - 是否可见
     */
    setVisible(visible) {
        this.sprite.setVisible(visible);
    }

    /**
     * 设置按钮启用状态
     * @param {boolean} enabled - 是否启用
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        this.sprite.setAlpha(enabled ? 1 : 0.5);
    }

    /**
     * 销毁按钮
     */
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
            this.sprite = null;
        }
    }
}

/**
 * 开关按钮类
 * 用于音效、音乐等开关功能
 */
class ToggleButton extends Button {
    /**
     * 创建开关按钮
     * @param {Phaser.Scene} scene - 场景引用
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} textureOn - 开启状态纹理
     * @param {string} textureOff - 关闭状态纹理
     * @param {boolean} initialState - 初始状态
     * @param {Function} callback - 状态改变回调
     */
    constructor(scene, x, y, textureOn, textureOff, initialState, callback) {
        super(scene, x, y, initialState ? textureOn : textureOff, null);

        this.textureOn = textureOn;
        this.textureOff = textureOff;
        this.isOn = initialState;
        this.toggleCallback = callback;
    }

    /**
     * 按下时的处理（切换状态）
     */
    onPointerDown() {
        this.sprite.setScale(0.95);
        this.toggle();
    }

    /**
     * 切换状态
     */
    toggle() {
        this.isOn = !this.isOn;
        this.updateTexture();

        if (this.toggleCallback) {
            this.toggleCallback(this.isOn);
        }
    }

    /**
     * 更新纹理
     */
    updateTexture() {
        this.sprite.setTexture(this.isOn ? this.textureOn : this.textureOff);
    }

    /**
     * 设置状态
     * @param {boolean} isOn - 是否开启
     */
    setState(isOn) {
        this.isOn = isOn;
        this.updateTexture();
    }

    /**
     * 获取当前状态
     * @returns {boolean}
     */
    getState() {
        return this.isOn;
    }
}
