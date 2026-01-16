/**
 * 游戏主场景
 * 包含完整的游戏逻辑和状态机
 *
 * 【配置文件依赖】
 * - LayoutConfig.js: UI布局配置
 * - GameplayConfig.js: 游戏玩法参数
 * - EventManager.js: 事件通信
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // 初始化游戏状态
        this.gameState = GameplayConfig.STATES.SLIDE_PLATFORM_LEFT;
        this.score = 0;
        this.isPointerDown = false;
        this.stickHeight = 0;
        this.willFall = false;

        // 平台相关
        this.currentPlatform = null;
        this.nextPlatform = null;

        // 游戏对象
        this.soldier = null;
        this.stick = null;

        // 棍子状态
        this.stickX = 0;
        this.stickY = 0;
        this.stickAngle = 0;
    }

    create() {
        const layout = LayoutConfig.GAME;
        const canvas = LayoutConfig.CANVAS;

        // 添加背景
        this.add.image(layout.BACKGROUND.x, layout.BACKGROUND.y, 'background')
            .setScale(layout.BACKGROUND.scale);

        // 添加太阳装饰
        this.sunScore = this.add.image(layout.SUN_SCORE.x, layout.SUN_SCORE.y, 'sun-score')
            .setScale(layout.SUN_SCORE.scale);

        if (layout.SUN_SCORE.rotation.enabled) {
            this.tweens.add({
                targets: this.sunScore,
                angle: 360,
                duration: layout.SUN_SCORE.rotation.duration,
                repeat: -1
            });
        }

        // 创建初始平台
        this.createInitialPlatforms();

        // 创建士兵
        this.createSoldier();

        // 创建分数显示
        this.createScoreDisplay();

        // 创建雪花效果
        this.createSnowEffect();

        // 设置输入
        this.setupInput();

        // 开始游戏（平台滑入）
        this.slidePlatformsIn();

        // 初始化广告模块（保持广告显示状态）
        AdvertiseManager.onSceneChange(this);

        // 发送场景准备完成事件
        EventManager.emit(GameEvents.SCENE_READY, 'GameScene');
    }

    createInitialPlatforms() {
        const platformConfig = GameplayConfig.PLATFORM;

        // 当前平台（士兵站立的平台）- 初始在屏幕外左侧
        const startWidth = 120;
        this.currentPlatform = this.createPlatform(
            -startWidth,
            platformConfig.SURFACE_Y,
            startWidth
        );

        // 下一个平台 - 初始在屏幕外右侧
        const widthRange = GameplayConfig.getPlatformWidthRange(this.score);
        const nextWidth = Phaser.Math.Between(widthRange.min, widthRange.max);
        this.nextPlatform = this.createPlatform(
            LayoutConfig.CANVAS.WIDTH + 100,
            platformConfig.SURFACE_Y,
            nextWidth
        );
    }

    createPlatform(x, y, width) {
        const platform = this.add.image(x, y, 'platform');
        platform.setOrigin(0, 0);
        platform.setDisplaySize(width, GameplayConfig.PLATFORM.HEIGHT);
        // 平台深度设置为5，高于棍子(2)，低于士兵(10)
        platform.setDepth(5);
        // 存储平台宽度，避免依赖 displayWidth
        platform.platformWidth = width;
        return platform;
    }

    /**
     * 创建棍子精灵
     * 使用裁剪遮罩方式显示，避免纹理拉伸
     */
    createStick() {
        const stickConfig = GameplayConfig.STICK;

        // 销毁旧的棍子（如果存在）
        if (this.stick) {
            this.stick.destroy();
            this.stick = null;
        }

        // 获取棍子纹理的原始尺寸
        const stickTexture = this.textures.get('stick');
        const stickFrame = stickTexture.get();
        this.stickTextureWidth = stickFrame.width;
        this.stickTextureHeight = stickFrame.height;

        // 创建新的棍子精灵
        this.stick = this.add.image(this.stickX, this.stickY, 'stick');
        // 设置原点在底部左侧，这样旋转后整根棍子在平台表面下方
        this.stick.setOrigin(0, 1);
        this.stick.setDepth(stickConfig.DEPTH);

        // 使用裁剪方式，初始裁剪为0高度（不可见）
        this.stick.setCrop(0, this.stickTextureHeight, this.stickTextureWidth, 0);
        this.stick.setVisible(false);

        // 重置棍子状态
        this.stickHeight = 0;
        this.stickAngle = 0;
    }

    /**
     * 更新棍子的显示
     * 使用裁剪遮罩从底部向上显示棍子
     */
    updateStickDisplay() {
        if (this.stick && this.stickHeight > 0) {
            // 更新棍子位置
            this.stick.setPosition(this.stickX, this.stickY);

            // 计算裁剪区域：从底部向上显示
            // 裁剪高度 = 当前棍子高度对应的纹理高度
            const cropHeight = Math.min(this.stickHeight, this.stickTextureHeight);
            const cropY = this.stickTextureHeight - cropHeight;

            // 设置裁剪区域（从底部向上逐渐显示）
            this.stick.setCrop(0, cropY, this.stickTextureWidth, cropHeight);

            // 更新棍子角度
            this.stick.setAngle(this.stickAngle);
            this.stick.setVisible(true);
        }
    }

    createSoldier() {
        const soldierConfig = GameplayConfig.SOLDIER;
        const platformConfig = GameplayConfig.PLATFORM;

        // 士兵初始位置在屏幕外
        this.soldier = this.add.sprite(
            -50,
            platformConfig.SURFACE_Y,
            'soldier'
        );
        this.soldier.setOrigin(soldierConfig.ORIGIN_X, soldierConfig.ORIGIN_Y);
        this.soldier.setDepth(soldierConfig.DEPTH);
        this.soldier.play('soldier-idle');
    }

    createScoreDisplay() {
        const scoreLayout = LayoutConfig.GAME.SCORE;

        // 使用精灵图显示分数
        this.scoreDigits = [];
        this.scoreContainer = this.add.container(scoreLayout.x, scoreLayout.y);
        this.scoreContainer.setDepth(50);

        // 初始显示0
        this.updateScoreDisplay(0);

        // "太棒了"提示文本（初始隐藏）
        const wonderfulLayout = LayoutConfig.GAME.WONDERFUL;
        this.wonderfulText = this.add.text(
            LayoutConfig.getCenterX(),
            LayoutConfig.getCenterY(),
            '+1',
            {
                fontSize: `${wonderfulLayout.fontSize}px`,
                fill: wonderfulLayout.fontColor,
                fontFamily: 'Arial',
                stroke: wonderfulLayout.strokeColor,
                strokeThickness: wonderfulLayout.strokeThickness
            }
        ).setOrigin(0.5);
        this.wonderfulText.setVisible(false);
        this.wonderfulText.setDepth(50);
    }

    /**
     * 使用精灵图更新分数显示
     * @param {number} score - 要显示的分数
     */
    updateScoreDisplay(score) {
        // 清除旧的数字精灵
        this.scoreDigits.forEach(digit => digit.destroy());
        this.scoreDigits = [];

        // 将分数转为字符串
        const scoreStr = score.toString();
        const digitWidth = 128;  // 每个数字的宽度
        const spacing = -20;     // 数字间距（负值让数字靠近）
        const totalWidth = scoreStr.length * digitWidth + (scoreStr.length - 1) * spacing;
        const startX = -totalWidth / 2 + digitWidth / 2;

        // 为每个数字创建精灵
        for (let i = 0; i < scoreStr.length; i++) {
            const digitValue = parseInt(scoreStr[i]);
            const digit = this.add.image(
                startX + i * (digitWidth + spacing),
                0,
                'score-font',
                digitValue
            );
            digit.setOrigin(0.5);
            this.scoreContainer.add(digit);
            this.scoreDigits.push(digit);
        }
    }

    createSnowEffect() {
        const snowConfig = GameplayConfig.SNOW;
        const canvas = LayoutConfig.CANVAS;

        for (let i = 0; i < snowConfig.COUNT; i++) {
            const x = Phaser.Math.Between(0, canvas.WIDTH);
            const y = Phaser.Math.Between(0, canvas.HEIGHT);
            const scale = Phaser.Math.FloatBetween(snowConfig.MIN_SCALE, snowConfig.MAX_SCALE);
            const speed = Phaser.Math.Between(snowConfig.MIN_SPEED, snowConfig.MAX_SPEED);

            const snow = this.add.image(x, y, 'snow');
            snow.setScale(scale);
            snow.setAlpha(snowConfig.ALPHA);
            snow.setDepth(snowConfig.DEPTH);

            this.tweens.add({
                targets: snow,
                y: canvas.HEIGHT + 50,
                x: x + Phaser.Math.Between(-snowConfig.SWAY_RANGE, snowConfig.SWAY_RANGE),
                duration: (canvas.HEIGHT - y + 50) / speed * 1000,
                repeat: -1,
                onRepeat: () => {
                    snow.y = -50;
                    snow.x = Phaser.Math.Between(0, canvas.WIDTH);
                }
            });
        }
    }

    setupInput() {
        const STATES = GameplayConfig.STATES;

        // 触摸/鼠标按下
        this.input.on('pointerdown', () => {
            if (this.gameState === STATES.READ_MOUSE) {
                this.isPointerDown = true;
                this.playSound('sfx-stick');
                EventManager.emit(GameEvents.INPUT_DOWN);
                EventManager.emit(GameEvents.STICK_GROW_START);
            }
        });

        // 触摸/鼠标释放
        this.input.on('pointerup', () => {
            if (this.gameState === STATES.READ_MOUSE && this.isPointerDown) {
                this.isPointerDown = false;
                EventManager.emit(GameEvents.INPUT_UP);
                EventManager.emit(GameEvents.STICK_GROW_END);
                if (this.stickHeight > 0) {
                    this.gameState = STATES.BRIDGE_FALLING;
                }
            }
        });
    }

    slidePlatformsIn() {
        const platformConfig = GameplayConfig.PLATFORM;
        const flowConfig = GameplayConfig.GAME_FLOW;

        // 当前平台滑入到固定位置
        const currentTargetX = platformConfig.START_X;

        // 计算下一个平台的位置（基于当前平台的最终位置）
        const gapRange = GameplayConfig.getGapRange(this.score);
        const gap = Phaser.Math.Between(gapRange.min, gapRange.max);
        const nextTargetX = currentTargetX + this.currentPlatform.platformWidth + gap;

        // 当前平台滑入
        this.tweens.add({
            targets: this.currentPlatform,
            x: currentTargetX,
            duration: flowConfig.ROUND_TRANSITION_DURATION,
            ease: 'Power2'
        });

        // 士兵跟随平台移动到平台右边缘
        const soldierOffset = LayoutConfig.GAME.SOLDIER.offsetFromPlatformEdge;
        const soldierTargetX = currentTargetX + this.currentPlatform.platformWidth - soldierOffset;
        this.tweens.add({
            targets: this.soldier,
            x: soldierTargetX,
            duration: flowConfig.ROUND_TRANSITION_DURATION,
            ease: 'Power2'
        });

        // 下一个平台滑入
        this.tweens.add({
            targets: this.nextPlatform,
            x: nextTargetX,
            duration: platformConfig.SLIDE_DURATION,
            ease: 'Power2',
            onComplete: () => {
                this.gameState = GameplayConfig.STATES.READ_MOUSE;
                // 设置棍子位置（在当前平台的右边缘）
                this.stickX = currentTargetX + this.currentPlatform.platformWidth;
                this.stickY = platformConfig.SURFACE_Y;
                // 创建新棍子
                this.createStick();
                this.stick.setVisible(true);
            }
        });
    }

    update(time, delta) {
        const dt = delta / 1000;
        const STATES = GameplayConfig.STATES;

        switch (this.gameState) {
            case STATES.READ_MOUSE:
                this.updateReadMouse(dt);
                break;
            case STATES.BRIDGE_FALLING:
                this.updateBridgeFalling(dt);
                break;
            case STATES.PLAYER_WALK_BRIDGE:
                this.updatePlayerWalkBridge(dt);
                break;
            case STATES.PLAYER_GOOD_WALK:
                this.updatePlayerGoodWalk(dt);
                break;
            case STATES.GAME_OVER:
                // 等待重启
                break;
        }
    }

    updateReadMouse(dt) {
        const stickConfig = GameplayConfig.STICK;

        if (this.isPointerDown) {
            // 棍子伸长
            this.stickHeight += stickConfig.GROW_SPEED * dt;
            this.stickHeight = Math.min(this.stickHeight, stickConfig.MAX_HEIGHT);
            this.updateStickDisplay();
        }
    }

    updateBridgeFalling(dt) {
        const stickConfig = GameplayConfig.STICK;

        // 棍子旋转下落
        if (this.stickAngle < 90) {
            this.stickAngle += stickConfig.ROTATE_SPEED * dt;
            this.stickAngle = Math.min(this.stickAngle, 90);
            this.updateStickDisplay();

            if (this.stickAngle >= 90) {
                this.playSound('sfx-stick-done');
                EventManager.emit(GameEvents.STICK_LANDED);
                // 检查棍子是否能到达下一个平台
                this.checkStickLanding();
            }
        }
    }

    checkStickLanding() {
        // 棍子末端位置（棍子从 stickX 开始，向右延伸 stickHeight 长度）
        const stickEndX = this.stickX + this.stickHeight;

        // 下一个平台的实际范围
        const platformLeft = this.nextPlatform.x;
        const platformRight = this.nextPlatform.x + this.nextPlatform.platformWidth;

        // 检查棍子是否落在平台上
        if (stickEndX >= platformLeft && stickEndX <= platformRight) {
            // 成功！开始行走
            this.gameState = GameplayConfig.STATES.PLAYER_WALK_BRIDGE;
            this.soldier.play('soldier-walk');
            this.playSound('sfx-walk');
            EventManager.emit(GameEvents.PLAYER_WALK_START);

            // 计算目标位置（下一个平台的右边缘）
            const soldierOffset = LayoutConfig.GAME.SOLDIER.offsetFromPlatformEdge;
            this.walkTargetX = platformRight - soldierOffset;
            this.willFall = false;
        } else {
            // 失败！棍子太短或太长
            this.gameState = GameplayConfig.STATES.PLAYER_WALK_BRIDGE;
            this.soldier.play('soldier-walk');

            // 设置目标为棍子末端（会掉下去）
            this.walkTargetX = stickEndX - 10;
            this.willFall = true;
        }
    }

    updatePlayerWalkBridge(dt) {
        const soldierConfig = GameplayConfig.SOLDIER;

        // 士兵向前行走
        const moveSpeed = soldierConfig.WALK_SPEED * dt;
        this.soldier.x += moveSpeed;

        // 检查是否到达目标
        if (this.soldier.x >= this.walkTargetX) {
            this.soldier.x = this.walkTargetX;
            EventManager.emit(GameEvents.PLAYER_WALK_END);

            if (this.willFall) {
                // 开始下落
                this.gameState = GameplayConfig.STATES.GAME_OVER;
                this.soldierFall();
            } else {
                // 成功到达平台
                this.gameState = GameplayConfig.STATES.PLAYER_GOOD_WALK;
                this.onSuccessfulCross();
            }
        }
    }

    updatePlayerGoodWalk(dt) {
        // 士兵已到达平台，等待下一轮
    }

    soldierFall() {
        this.soldier.stop();
        EventManager.emit(GameEvents.PLAYER_FALL);

        // 士兵下落动画
        this.tweens.add({
            targets: this.soldier,
            y: LayoutConfig.CANVAS.HEIGHT + 200,
            angle: 90,
            duration: 800,
            ease: 'Quad.easeIn',
            onComplete: () => {
                this.onGameOver();
            }
        });

        // 棍子也下落旋转
        if (this.stick) {
            this.tweens.add({
                targets: this.stick,
                angle: 180,
                duration: 600,
                ease: 'Quad.easeIn'
            });
        }

        this.playSound('sfx-gameover');
    }

    onSuccessfulCross() {
        const scoreConfig = GameplayConfig.SCORE;

        // 增加分数
        this.score += scoreConfig.CROSS_PLATFORM;
        this.updateScoreDisplay(this.score);
        EventManager.emit(GameEvents.SCORE_CHANGED, this.score);

        // 显示 +1 动画
        this.showWonderful();

        this.playSound('sfx-wonderful');

        // 准备下一轮
        this.prepareNextRound();
    }

    showWonderful() {
        const wonderfulLayout = LayoutConfig.GAME.WONDERFUL;

        this.wonderfulText.setVisible(true);
        this.wonderfulText.setPosition(this.soldier.x, this.soldier.y + wonderfulLayout.offsetY);
        this.wonderfulText.setAlpha(1);
        this.wonderfulText.setScale(1);

        this.tweens.add({
            targets: this.wonderfulText,
            y: this.soldier.y + wonderfulLayout.offsetY - wonderfulLayout.animation.floatDistance,
            alpha: 0,
            scale: 1.5,
            duration: wonderfulLayout.animation.duration,
            onComplete: () => {
                this.wonderfulText.setVisible(false);
            }
        });
    }

    prepareNextRound() {
        const platformConfig = GameplayConfig.PLATFORM;

        // 销毁旧棍子
        if (this.stick) {
            this.stick.destroy();
            this.stick = null;
        }

        // 重置棍子状态
        this.stickHeight = 0;
        this.stickAngle = 0;

        // 计算需要移动的距离，使当前的 nextPlatform 移动到 START_X 位置
        const shiftAmount = this.nextPlatform.x - platformConfig.START_X;

        // 创建新的下一个平台（使用动态难度）
        const widthRange = GameplayConfig.getPlatformWidthRange(this.score);
        const newWidth = Phaser.Math.Between(widthRange.min, widthRange.max);

        const gapRange = GameplayConfig.getGapRange(this.score);
        const newGap = Phaser.Math.Between(gapRange.min, gapRange.max);

        // 新平台位置：基于当前 nextPlatform 移动后的位置计算
        const newPlatformFinalX = platformConfig.START_X + this.nextPlatform.platformWidth + newGap;
        const newPlatformStartX = newPlatformFinalX + shiftAmount;

        const newPlatform = this.createPlatform(
            newPlatformStartX,
            platformConfig.SURFACE_Y,
            newWidth
        );

        EventManager.emit(GameEvents.PLATFORM_CREATED, { width: newWidth, gap: newGap });

        // 保存旧平台引用
        const oldCurrentPlatform = this.currentPlatform;

        // 移动所有元素向左
        this.tweens.add({
            targets: [oldCurrentPlatform, this.nextPlatform, newPlatform, this.soldier],
            x: `-=${shiftAmount}`,
            duration: GameplayConfig.GAME_FLOW.ROUND_TRANSITION_DURATION,
            ease: 'Power2',
            onComplete: () => {
                // 删除旧的当前平台
                oldCurrentPlatform.destroy();

                // 更新平台引用
                this.currentPlatform = this.nextPlatform;
                this.nextPlatform = newPlatform;

                // 设置新棍子位置（在当前平台的右边缘）
                this.stickX = this.currentPlatform.x + this.currentPlatform.platformWidth;
                this.stickY = platformConfig.SURFACE_Y;

                // 创建新棍子
                this.createStick();
                this.stick.setVisible(true);

                // 士兵回到站立动画
                this.soldier.play('soldier-idle');
                this.willFall = false;

                // 准备接收下一次输入
                this.gameState = GameplayConfig.STATES.READ_MOUSE;
            }
        });
    }

    onGameOver() {
        // 使用 GameOverManager 显示游戏结束界面
        GameOverManager.show(this, this.score);
    }

    playSound(key) {
        if (GameData.soundEnabled) {
            this.sound.play(key, { volume: GameplayConfig.AUDIO.SFX_VOLUME });
        }
    }
}
