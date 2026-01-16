/**
 * 广告管理模块
 * 全局单例，负责管理游戏中的广告显示、动画和状态
 *
 * 【设计理念】
 * - 全局计时：从调用 start() 开始计时，不受场景切换影响
 * - 状态持久：广告显示状态在场景切换时保持不变
 * - 展开/折叠：支持两种显示状态，自动定时切换
 * - 可扩展：支持多种广告类型和位置配置
 *
 * 【广告状态】
 * - 展开(expanded)：完整显示广告，点击跳转链接，有折叠按钮
 * - 折叠(collapsed)：只显示小图标/提示，点击展开
 *
 * 【API】
 * - start(): 启动全局计时器
 * - onSceneChange(scene): 场景切换时调用
 * - expand(): 展开广告
 * - collapse(): 折叠广告
 * - toggle(): 切换展开/折叠状态
 * - show(): 显示广告
 * - hide(): 完全隐藏广告
 * - setConfig(config): 修改配置
 */

const AdvertiseManager = {
    // ==================== 状态 ====================
    // 广告容器
    adContainer: null,

    // 广告图片对象
    adImage: null,

    // 左侧切换条（用于点击展开/折叠）
    toggleBar: null,

    // 当前场景引用
    currentScene: null,

    // 广告是否已显示（进入屏幕）
    isShown: false,

    // 广告是否展开
    isExpanded: true,

    // 广告是否正在动画中
    isAnimating: false,

    // 是否已启动计时
    isStarted: false,

    // 启动时的时间戳
    startTime: 0,

    // 检查定时器 ID（用于首次显示）
    checkTimerId: null,

    // 自动切换定时器 ID
    toggleTimerId: null,

    // ==================== 配置 ====================
    config: {
        // 广告首次显示延迟（毫秒）
        showDelay: 3000,
        // 自动切换间隔（毫秒）
        toggleInterval: 10000,
        // 展开动画时长（毫秒）
        expandDuration: 400,
        // 折叠动画时长（毫秒）
        collapseDuration: 300,
        // 滑入动画时长（毫秒）
        slideInDuration: 500,
        // 广告图片 key
        imageKey: 'ad-placeholder',
        // 广告宽度（像素）
        adWidth: 720,
        // 广告层级（确保在最上层）
        depth: 1000,
        // 检查间隔（毫秒）
        checkInterval: 100,
        // 广告点击跳转链接
        adLink: 'https://example.com/ad',
        // 折叠后露出的宽度（像素，广告左侧露出的部分）
        toggleBarWidth: 40
    },

    // ==================== 核心方法 ====================

    /**
     * 启动广告计时器
     * 应在游戏资源加载完成后调用一次
     */
    start() {
        if (this.isStarted) {
            return;
        }

        this.isStarted = true;
        this.startTime = Date.now();

        // 启动定时检查（用于首次显示）
        this.startCheckTimer();
    },

    /**
     * 启动定时检查器
     */
    startCheckTimer() {
        if (this.checkTimerId) {
            return;
        }

        this.checkTimerId = setInterval(() => {
            this.checkAndShow();
        }, this.config.checkInterval);
    },

    /**
     * 检查是否应该显示广告
     */
    checkAndShow() {
        if (this.isShown || this.isAnimating) {
            this.stopCheckTimer();
            return;
        }

        const elapsed = Date.now() - this.startTime;
        if (elapsed >= this.config.showDelay) {
            if (this.currentScene) {
                this.show();
                this.stopCheckTimer();
            }
        }
    },

    /**
     * 停止定时检查器
     */
    stopCheckTimer() {
        if (this.checkTimerId) {
            clearInterval(this.checkTimerId);
            this.checkTimerId = null;
        }
    },

    /**
     * 启动自动切换定时器
     */
    startToggleTimer() {
        if (this.toggleTimerId) {
            return;
        }

        this.toggleTimerId = setInterval(() => {
            this.toggle();
        }, this.config.toggleInterval);
    },

    /**
     * 停止自动切换定时器
     */
    stopToggleTimer() {
        if (this.toggleTimerId) {
            clearInterval(this.toggleTimerId);
            this.toggleTimerId = null;
        }
    },

    /**
     * 重置自动切换定时器（用于手动操作后重新计时）
     */
    resetToggleTimer() {
        this.stopToggleTimer();
        this.startToggleTimer();
    },

    /**
     * 场景切换时调用
     * @param {Phaser.Scene} scene - 新场景
     */
    onSceneChange(scene) {
        this.currentScene = scene;

        if (this.isShown) {
            this.recreateAd();
        } else if (this.isStarted && !this.isAnimating) {
            const elapsed = Date.now() - this.startTime;
            if (elapsed >= this.config.showDelay) {
                this.show();
            }
        }
    },

    // ==================== 广告创建 ====================

    /**
     * 创建完整的广告组件
     */
    createAd() {
        if (!this.currentScene) {
            return;
        }

        const canvas = LayoutConfig.CANVAS;

        // 创建广告图片
        this.adImage = this.currentScene.add.image(0, 0, this.config.imageKey);
        this.adImage.setOrigin(0, 0);  // 左上角为原点，方便计算位置

        // 设置广告宽度，保持宽高比
        const adWidth = this.config.adWidth;
        const scale = adWidth / this.adImage.width;
        this.adImage.setScale(scale);
        this.adImage.setDepth(this.config.depth);

        // 广告图片点击事件（跳转链接，只在展开状态下有效）
        this.adImage.setInteractive({ useHandCursor: true });
        this.adImage.on('pointerdown', (pointer) => {
            if (this.isExpanded) {
                this.onAdClick();
            }
        });

        // 创建左侧切换条（用于点击展开/折叠）
        this.createToggleBar();

        // 创建容器来管理位置
        this.adContainer = {
            x: canvas.WIDTH - this.adImage.displayWidth,  // 展开时左边缘位置
            y: canvas.HEIGHT - this.adImage.displayHeight
        };

        // 更新所有元素位置
        this.updatePositions();
    },

    /**
     * 创建左侧切换条
     */
    createToggleBar() {
        const barWidth = this.config.toggleBarWidth;
        const barHeight = this.adImage.displayHeight;

        // 创建切换条背景
        this.toggleBar = this.currentScene.add.graphics();
        this.toggleBar.fillStyle(0x000000, 0.3);
        this.toggleBar.fillRect(0, 0, barWidth, barHeight);

        // 绘制箭头指示（展开时向右，折叠时向左）
        this.updateToggleBarArrow();

        // 设置交互
        this.toggleBar.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, barWidth, barHeight),
            Phaser.Geom.Rectangle.Contains
        );

        this.toggleBar.on('pointerdown', () => {
            this.toggle();
            this.resetToggleTimer();
        });

        // 设置层级（比广告图片高）
        this.toggleBar.setDepth(this.config.depth + 1);
    },

    /**
     * 更新切换条上的箭头方向
     */
    updateToggleBarArrow() {
        if (!this.toggleBar) return;

        // 清除之前的绘制
        this.toggleBar.clear();

        const barWidth = this.config.toggleBarWidth;
        const barHeight = this.adImage ? this.adImage.displayHeight : 100;

        // 绘制背景
        this.toggleBar.fillStyle(0x000000, 0.3);
        this.toggleBar.fillRect(0, 0, barWidth, barHeight);

        // 绘制箭头
        this.toggleBar.lineStyle(3, 0xffffff, 0.8);
        const arrowSize = 12;
        const centerY = barHeight / 2;
        const centerX = barWidth / 2;

        this.toggleBar.beginPath();
        if (this.isExpanded) {
            // 展开状态：箭头向右（表示可以折叠）
            this.toggleBar.moveTo(centerX - arrowSize / 2, centerY - arrowSize);
            this.toggleBar.lineTo(centerX + arrowSize / 2, centerY);
            this.toggleBar.lineTo(centerX - arrowSize / 2, centerY + arrowSize);
        } else {
            // 折叠状态：箭头向左（表示可以展开）
            this.toggleBar.moveTo(centerX + arrowSize / 2, centerY - arrowSize);
            this.toggleBar.lineTo(centerX - arrowSize / 2, centerY);
            this.toggleBar.lineTo(centerX + arrowSize / 2, centerY + arrowSize);
        }
        this.toggleBar.strokePath();
    },

    /**
     * 更新所有元素的位置
     */
    updatePositions() {
        if (!this.adImage || !this.adContainer) {
            return;
        }

        // 广告图片位置
        this.adImage.setPosition(this.adContainer.x, this.adContainer.y);

        // 切换条位置（广告图片左侧）
        if (this.toggleBar) {
            this.toggleBar.setPosition(this.adContainer.x, this.adContainer.y);
        }
    },

    /**
     * 在新场景中重新创建广告
     */
    recreateAd() {
        this.destroyAd();
        this.createAd();

        const canvas = LayoutConfig.CANVAS;

        // 根据当前状态设置位置
        if (this.isExpanded) {
            this.adContainer.x = this.getExpandedX();
        } else {
            this.adContainer.x = this.getCollapsedX();
        }
        this.adContainer.y = canvas.HEIGHT - this.adImage.displayHeight;
        this.updatePositions();
        this.updateToggleBarArrow();
    },

    /**
     * 销毁广告组件
     */
    destroyAd() {
        if (this.adImage) {
            this.adImage.destroy();
            this.adImage = null;
        }
        if (this.toggleBar) {
            this.toggleBar.destroy();
            this.toggleBar = null;
        }
        this.adContainer = null;
    },

    // ==================== 显示控制 ====================

    /**
     * 获取展开状态的 X 坐标（广告完全显示）
     */
    getExpandedX() {
        const canvas = LayoutConfig.CANVAS;
        if (this.adImage) {
            return canvas.WIDTH - this.adImage.displayWidth;
        }
        return 0;
    },

    /**
     * 获取折叠状态的 X 坐标（只露出左侧一小条）
     */
    getCollapsedX() {
        const canvas = LayoutConfig.CANVAS;
        // 折叠时，广告向右移动，只露出左侧 toggleBarWidth 宽度
        return canvas.WIDTH - this.config.toggleBarWidth;
    },

    /**
     * 获取展开状态的 Y 坐标
     */
    getExpandedY() {
        const canvas = LayoutConfig.CANVAS;
        if (this.adImage) {
            return canvas.HEIGHT - this.adImage.displayHeight;
        }
        return canvas.HEIGHT - 100;
    },

    /**
     * 显示广告（首次从底部滑入，展开状态）
     */
    show() {
        if (!this.currentScene || this.isShown || this.isAnimating) {
            return;
        }

        this.createAd();
        if (!this.adImage) {
            return;
        }

        this.isAnimating = true;
        this.isExpanded = true;

        const canvas = LayoutConfig.CANVAS;

        // 设置初始位置（屏幕下方）
        this.adContainer.x = this.getExpandedX();
        this.adContainer.y = canvas.HEIGHT + this.adImage.displayHeight;
        this.updatePositions();

        const targetY = this.getExpandedY();

        // 从底部滑入动画
        this.currentScene.tweens.add({
            targets: this.adContainer,
            y: targetY,
            duration: this.config.slideInDuration,
            ease: 'Back.easeOut',
            onUpdate: () => {
                this.updatePositions();
            },
            onComplete: () => {
                this.isShown = true;
                this.isAnimating = false;
                this.updateToggleBarArrow();
                // 启动自动切换定时器
                this.startToggleTimer();
            }
        });
    },

    /**
     * 展开广告（从右侧滑入）
     */
    expand() {
        if (!this.currentScene || !this.isShown || this.isExpanded || this.isAnimating) {
            return;
        }

        this.isAnimating = true;

        const targetX = this.getExpandedX();

        // 展开动画（向左滑动，完全显示）
        this.currentScene.tweens.add({
            targets: this.adContainer,
            x: targetX,
            duration: this.config.expandDuration,
            ease: 'Power2.easeOut',
            onUpdate: () => {
                this.updatePositions();
            },
            onComplete: () => {
                this.isExpanded = true;
                this.isAnimating = false;
                this.updateToggleBarArrow();
            }
        });
    },

    /**
     * 折叠广告（向右侧滑出，只露出左侧一小条）
     */
    collapse() {
        if (!this.currentScene || !this.isShown || !this.isExpanded || this.isAnimating) {
            return;
        }

        this.isAnimating = true;

        const targetX = this.getCollapsedX();

        // 折叠动画（向右滑动，只露出左侧一小条）
        this.currentScene.tweens.add({
            targets: this.adContainer,
            x: targetX,
            duration: this.config.collapseDuration,
            ease: 'Power2.easeOut',
            onUpdate: () => {
                this.updatePositions();
            },
            onComplete: () => {
                this.isExpanded = false;
                this.isAnimating = false;
                this.updateToggleBarArrow();
            }
        });
    },

    /**
     * 切换展开/折叠状态
     */
    toggle() {
        if (this.isAnimating) {
            return;
        }

        if (this.isExpanded) {
            this.collapse();
        } else {
            this.expand();
        }
    },

    /**
     * 完全隐藏广告
     */
    hide() {
        if (!this.currentScene || !this.isShown || this.isAnimating) {
            return;
        }

        this.stopToggleTimer();
        this.isAnimating = true;

        const canvas = LayoutConfig.CANVAS;

        // 向右侧完全滑出
        this.currentScene.tweens.add({
            targets: this.adContainer,
            x: canvas.WIDTH + this.adImage.displayWidth,
            duration: this.config.collapseDuration,
            ease: 'Power2.easeIn',
            onUpdate: () => {
                this.updatePositions();
            },
            onComplete: () => {
                this.isShown = false;
                this.isAnimating = false;
                this.destroyAd();
            }
        });
    },

    // ==================== 事件处理 ====================

    /**
     * 广告点击回调（展开状态下）
     */
    onAdClick() {
        console.log('广告被点击，跳转到:', this.config.adLink);
        // 打开广告链接
        window.open(this.config.adLink, '_blank');
    },

    // ==================== 工具方法 ====================

    /**
     * 检查广告是否正在显示
     * @returns {boolean}
     */
    isVisible() {
        return this.isShown;
    },

    /**
     * 检查广告是否展开
     * @returns {boolean}
     */
    isAdExpanded() {
        return this.isExpanded;
    },

    /**
     * 修改配置
     * @param {Object} newConfig - 新配置
     */
    setConfig(newConfig) {
        Object.assign(this.config, newConfig);

        // 如果修改了切换间隔，重置定时器
        if (newConfig.toggleInterval && this.toggleTimerId) {
            this.resetToggleTimer();
        }
    },

    /**
     * 设置广告跳转链接
     * @param {string} link - 跳转链接
     */
    setAdLink(link) {
        this.config.adLink = link;
    },

    /**
     * 设置自动切换间隔
     * @param {number} interval - 间隔时间（毫秒）
     */
    setToggleInterval(interval) {
        this.config.toggleInterval = interval;
        if (this.toggleTimerId) {
            this.resetToggleTimer();
        }
    },

    /**
     * 重置广告管理器状态
     */
    reset() {
        this.stopCheckTimer();
        this.stopToggleTimer();
        this.destroyAd();

        this.isShown = false;
        this.isExpanded = true;
        this.isAnimating = false;
        this.isStarted = false;
        this.startTime = 0;
        this.currentScene = null;
    },

    /**
     * 重新开始计时
     * @param {number} delay - 可选，新的首次显示延迟时间
     */
    restart(delay) {
        this.reset();
        if (delay !== undefined) {
            this.config.showDelay = delay;
        }
        this.start();
    }
};
