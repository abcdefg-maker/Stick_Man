/**
 * 广告管理模块
 * 全局单例，负责管理游戏中的广告显示、动画和状态
 *
 * 【设计理念】
 * - 全局计时：从调用 start() 开始计时，不受场景切换影响
 * - 状态持久：广告显示状态在场景切换时保持不变
 * - 展开/折叠：支持两种显示状态，用户手动切换
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
 * - setAdData(data): 设置广告数据（gameName, iconUrl, gameAdUrl, score）
 */

const AdvertiseManager = {
    // ==================== 状态 ====================
    // 广告容器
    adContainer: null,

    // 广告背景
    adBackground: null,

    // 圆形头像
    adIcon: null,
    adIconMask: null,

    // 游戏名称文本
    gameNameText: null,

    // 积分文本
    scoreText: null,

    // GO 按钮
    goButton: null,
    goButtonText: null,

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


    // 图标是否已加载
    iconLoaded: false,

    // ==================== 广告数据 ====================
    adData: {
        gameName: 'Game Name',
        iconUrl: '',
        gameAdUrl: 'https://example.com/ad',
        score: 0
    },

    // ==================== 配置 ====================
    config: {
        // 广告首次显示延迟（毫秒）
        showDelay: 3000,
        // 展开动画时长（毫秒）
        expandDuration: 400,
        // 折叠动画时长（毫秒）
        collapseDuration: 300,
        // 滑入动画时长（毫秒）
        slideInDuration: 500,
        // 广告宽度（像素）
        adWidth: 720,
        // 广告高度（像素）
        adHeight: 100,
        // 广告层级（确保在最上层）
        depth: 1000,
        // 检查间隔（毫秒）
        checkInterval: 100,
        // 折叠后露出的宽度（像素，广告左侧露出的部分）
        toggleBarWidth: 40,
        // 头像大小（像素）
        iconSize: 70,
        // 头像左边距
        iconMarginLeft: 50,
        // 文本左边距（相对于头像右边）
        textMarginLeft: 15,
        // GO按钮宽度
        goButtonWidth: 70,
        // GO按钮高度
        goButtonHeight: 45,
        // GO按钮右边距
        goButtonMarginRight: 20,
        // 背景颜色
        backgroundColor: 0xf5f5f5,
        // GO按钮颜色
        goButtonColor: 0xf5a623,
        // 游戏名称文字颜色
        gameNameColor: '#333333',
        // 积分文字颜色
        scoreTextColor: '#f5a623'
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
     * 设置广告数据
     * @param {Object} data - 广告数据 { gameName, iconUrl, gameAdUrl, score }
     */
    setAdData(data) {
        if (data.gameName !== undefined) this.adData.gameName = data.gameName;
        if (data.iconUrl !== undefined) this.adData.iconUrl = data.iconUrl;
        if (data.gameAdUrl !== undefined) this.adData.gameAdUrl = data.gameAdUrl;
        if (data.score !== undefined) this.adData.score = data.score;

        // 如果广告已显示，更新显示内容
        if (this.isShown && this.currentScene) {
            this.updateAdContent();
        }
    },

    /**
     * 更新广告内容（文本和图标）
     */
    updateAdContent() {
        if (this.gameNameText) {
            this.gameNameText.setText(this.adData.gameName);
        }
        if (this.scoreText) {
            this.scoreText.setText('Download to earn\n' + this.adData.score + ' points');
        }
        // 如果图标URL变化，重新加载
        if (this.adData.iconUrl && !this.iconLoaded) {
            this.loadIcon();
        }
    },

    /**
     * 加载图标
     */
    loadIcon() {
        if (!this.currentScene || !this.adData.iconUrl) {
            return;
        }

        const iconKey = 'ad-icon-' + Date.now();

        // 检查是否已经加载过
        if (this.currentScene.textures.exists(iconKey)) {
            this.createIconSprite(iconKey);
            return;
        }

        // 动态加载图标
        this.currentScene.load.image(iconKey, this.adData.iconUrl);
        this.currentScene.load.once('complete', () => {
            this.iconLoaded = true;
            this.createIconSprite(iconKey);
        });
        this.currentScene.load.start();
    },

    /**
     * 创建图标精灵（圆形）
     */
    createIconSprite(iconKey) {
        if (!this.currentScene || !this.adContainer) {
            return;
        }

        // 如果已存在图标，先销毁
        if (this.adIcon) {
            this.adIcon.destroy();
            this.adIcon = null;
        }
        if (this.adIconMask) {
            this.adIconMask.destroy();
            this.adIconMask = null;
        }

        const config = this.config;
        const iconSize = config.iconSize;

        // 创建图标
        this.adIcon = this.currentScene.add.image(0, 0, iconKey);

        // 缩放图标到指定大小
        const scale = iconSize / Math.max(this.adIcon.width, this.adIcon.height);
        this.adIcon.setScale(scale);
        this.adIcon.setDepth(config.depth + 2);

        // 创建圆形遮罩
        const maskGraphics = this.currentScene.make.graphics();
        maskGraphics.fillStyle(0xffffff);
        maskGraphics.fillCircle(0, 0, iconSize / 2);

        this.adIconMask = maskGraphics.createGeometryMask();
        this.adIcon.setMask(this.adIconMask);

        // 更新位置
        this.updatePositions();
    },

    /**
     * 创建完整的广告组件
     */
    createAd() {
        if (!this.currentScene) {
            return;
        }

        const canvas = LayoutConfig.CANVAS;
        const config = this.config;

        // 创建广告背景
        this.adBackground = this.currentScene.add.graphics();
        this.adBackground.fillStyle(config.backgroundColor, 1);
        this.adBackground.fillRoundedRect(0, 0, config.adWidth, config.adHeight, 8);
        this.adBackground.setDepth(config.depth);

        // 创建游戏名称文本
        this.gameNameText = this.currentScene.add.text(0, 0, this.adData.gameName, {
            fontFamily: 'Arial, sans-serif',
            fontSize: '30px',
            fontStyle: 'bold',
            color: config.gameNameColor
        });
        this.gameNameText.setDepth(config.depth + 2);

        // 创建积分文本
        this.scoreText = this.currentScene.add.text(0, 0, 'Download to earn ' + this.adData.score + ' points', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            color: config.scoreTextColor,
            lineSpacing: 3
        });
        this.scoreText.setDepth(config.depth + 2);

        // 创建 GO 按钮背景
        this.goButton = this.currentScene.add.graphics();
        this.goButton.fillStyle(config.goButtonColor, 1);
        this.goButton.fillRoundedRect(0, 0, config.goButtonWidth, config.goButtonHeight, 6);
        this.goButton.setDepth(config.depth + 2);

        // 创建 GO 按钮文字
        this.goButtonText = this.currentScene.add.text(0, 0, 'GO', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '22px',
            fontStyle: 'bold',
            color: '#ffffff'
        });
        this.goButtonText.setOrigin(0.5, 0.5);
        this.goButtonText.setDepth(config.depth + 3);

        // 设置 GO 按钮交互
        this.goButton.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, config.goButtonWidth, config.goButtonHeight),
            Phaser.Geom.Rectangle.Contains
        );
        this.goButton.on('pointerdown', () => {
            if (this.isExpanded) {
                this.onAdClick();
            }
        });

        // 背景也可点击跳转
        this.adBackground.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, config.adWidth, config.adHeight),
            Phaser.Geom.Rectangle.Contains
        );
        this.adBackground.on('pointerdown', () => {
            if (this.isExpanded) {
                this.onAdClick();
            }
        });

        // 创建左侧切换条（用于点击展开/折叠）
        this.createToggleBar();

        // 创建容器来管理位置
        this.adContainer = {
            x: canvas.WIDTH - config.adWidth,  // 展开时左边缘位置
            y: canvas.HEIGHT - config.adHeight
        };

        // 加载图标
        if (this.adData.iconUrl) {
            this.loadIcon();
        }

        // 更新所有元素位置
        this.updatePositions();
    },

    /**
     * 创建左侧切换条
     */
    createToggleBar() {
        const barWidth = this.config.toggleBarWidth;
        const barHeight = this.config.adHeight;

        // 创建切换条背景
        this.toggleBar = this.currentScene.add.graphics();
        this.toggleBar.fillStyle(0xcccccc, 0.8);
        this.toggleBar.fillRoundedRect(0, 0, barWidth, barHeight, { tl: 8, bl: 8, tr: 0, br: 0 });

        // 绘制箭头指示（展开时向右，折叠时向左）
        this.updateToggleBarArrow();

        // 设置交互
        this.toggleBar.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, barWidth, barHeight),
            Phaser.Geom.Rectangle.Contains
        );

        this.toggleBar.on('pointerdown', () => {
            this.toggle();
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
        const barHeight = this.config.adHeight;

        // 绘制背景
        this.toggleBar.fillStyle(0xcccccc, 0.8);
        this.toggleBar.fillRoundedRect(0, 0, barWidth, barHeight, { tl: 8, bl: 8, tr: 0, br: 0 });

        // 绘制箭头
        this.toggleBar.lineStyle(3, 0x666666, 0.9);
        const arrowSize = 10;
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
        if (!this.adContainer) {
            return;
        }

        const config = this.config;
        const baseX = this.adContainer.x;
        const baseY = this.adContainer.y;

        // 广告背景位置
        if (this.adBackground) {
            this.adBackground.setPosition(baseX, baseY);
        }

        // 切换条位置（广告左侧）
        if (this.toggleBar) {
            this.toggleBar.setPosition(baseX, baseY);
        }

        // 图标位置（切换条右侧）
        const iconCenterX = baseX + config.iconMarginLeft + config.iconSize / 2;
        const iconCenterY = baseY + config.adHeight / 2;
        if (this.adIcon) {
            this.adIcon.setPosition(iconCenterX, iconCenterY);
        }
        // 更新遮罩位置
        if (this.adIconMask && this.adIcon) {
            // 需要重新创建遮罩来更新位置
            const maskGraphics = this.currentScene.make.graphics();
            maskGraphics.fillStyle(0xffffff);
            maskGraphics.fillCircle(iconCenterX, iconCenterY, config.iconSize / 2);
            this.adIconMask.destroy();
            this.adIconMask = maskGraphics.createGeometryMask();
            this.adIcon.setMask(this.adIconMask);
        }

        // 文本位置
        const textX = baseX + config.iconMarginLeft + config.iconSize + config.textMarginLeft;
        if (this.gameNameText) {
            this.gameNameText.setPosition(textX, baseY + 15);
        }
        if (this.scoreText) {
            this.scoreText.setPosition(textX, baseY + 42);
        }

        // GO 按钮位置
        const goButtonX = baseX + config.adWidth - config.goButtonMarginRight - config.goButtonWidth;
        const goButtonY = baseY + (config.adHeight - config.goButtonHeight) / 2;
        if (this.goButton) {
            this.goButton.setPosition(goButtonX, goButtonY);
        }
        if (this.goButtonText) {
            this.goButtonText.setPosition(
                goButtonX + config.goButtonWidth / 2,
                goButtonY + config.goButtonHeight / 2
            );
        }
    },

    /**
     * 在新场景中重新创建广告
     */
    recreateAd() {
        // 保存图标加载状态，场景切换后需要重新加载
        const wasIconLoaded = this.iconLoaded;
        this.iconLoaded = false;

        this.destroyAd();
        this.createAd();

        const canvas = LayoutConfig.CANVAS;
        const config = this.config;

        // 根据当前状态设置位置
        if (this.isExpanded) {
            this.adContainer.x = this.getExpandedX();
        } else {
            this.adContainer.x = this.getCollapsedX();
        }
        this.adContainer.y = canvas.HEIGHT - config.adHeight;
        this.updatePositions();
        this.updateToggleBarArrow();
    },

    /**
     * 销毁广告组件
     */
    destroyAd() {
        if (this.adBackground) {
            this.adBackground.destroy();
            this.adBackground = null;
        }
        if (this.adIcon) {
            this.adIcon.destroy();
            this.adIcon = null;
        }
        if (this.adIconMask) {
            this.adIconMask.destroy();
            this.adIconMask = null;
        }
        if (this.gameNameText) {
            this.gameNameText.destroy();
            this.gameNameText = null;
        }
        if (this.scoreText) {
            this.scoreText.destroy();
            this.scoreText = null;
        }
        if (this.goButton) {
            this.goButton.destroy();
            this.goButton = null;
        }
        if (this.goButtonText) {
            this.goButtonText.destroy();
            this.goButtonText = null;
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
        return canvas.WIDTH - this.config.adWidth;
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
        return canvas.HEIGHT - this.config.adHeight;
    },

    /**
     * 显示广告（首次从底部滑入，展开状态）
     */
    show() {
        if (!this.currentScene || this.isShown || this.isAnimating) {
            return;
        }

        this.createAd();
        if (!this.adContainer) {
            return;
        }

        this.isAnimating = true;
        this.isExpanded = true;

        const canvas = LayoutConfig.CANVAS;
        const config = this.config;

        // 设置初始位置（屏幕下方）
        this.adContainer.x = this.getExpandedX();
        this.adContainer.y = canvas.HEIGHT + config.adHeight;
        this.updatePositions();

        const targetY = this.getExpandedY();

        // 从底部滑入动画
        this.currentScene.tweens.add({
            targets: this.adContainer,
            y: targetY,
            duration: config.slideInDuration,
            ease: 'Back.easeOut',
            onUpdate: () => {
                this.updatePositions();
            },
            onComplete: () => {
                this.isShown = true;
                this.isAnimating = false;
                this.updateToggleBarArrow();
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

        this.isAnimating = true;

        const canvas = LayoutConfig.CANVAS;
        const config = this.config;

        // 向右侧完全滑出
        this.currentScene.tweens.add({
            targets: this.adContainer,
            x: canvas.WIDTH + config.adWidth,
            duration: config.collapseDuration,
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
        console.log('广告被点击，跳转到:', this.adData.gameAdUrl);
        // 打开广告链接
        window.open(this.adData.gameAdUrl, '_blank');
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
    },

    /**
     * 设置广告跳转链接
     * @param {string} link - 跳转链接
     */
    setAdLink(link) {
        this.adData.gameAdUrl = link;
    },


    /**
     * 重置广告管理器状态
     */
    reset() {
        this.stopCheckTimer();
        this.destroyAd();

        this.isShown = false;
        this.isExpanded = true;
        this.isAnimating = false;
        this.isStarted = false;
        this.startTime = 0;
        this.currentScene = null;
        this.iconLoaded = false;
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
