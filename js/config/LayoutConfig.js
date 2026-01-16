/**
 * UI布局配置文件
 *
 * 【使用说明 - 策划/美术人员】
 * 1. 所有UI元素的位置、大小都在这里配置
 * 2. 位置支持绝对值和百分比两种方式
 * 3. 修改后刷新浏览器即可看到效果
 *
 * 【坐标系说明】
 * - 原点在左上角
 * - X轴向右为正
 * - Y轴向下为正
 * - 游戏画布: 720 x 1280
 */

const LayoutConfig = {
    // ==================== 游戏画布 ====================
    CANVAS: {
        WIDTH: 720,
        HEIGHT: 1280,
        BACKGROUND_COLOR: '#87CEEB'
    },

    // ==================== 菜单场景布局 ====================
    MENU: {
        // 背景
        BACKGROUND: {
            x: 360,  // 居中
            y: 640,
            scale: 1
        },

        // 太阳装饰
        SUN_LOGO: {
            x: 360,
            y: 300,
            scale: 0.8,
            rotation: {
                enabled: true,
                duration: 20000  // 旋转一圈的时间（毫秒）
            }
        },

        // 游戏Logo
        GAME_LOGO: {
            x: 360,
            y: 380,
            scale: 1
        },

        // 开始按钮
        PLAY_BUTTON: {
            x: 360,
            y: 760,
            scale: 1,
            animation: {
                type: 'bounce',      // 动画类型: bounce, pulse, none
                amplitude: 15,       // 振幅（像素）
                duration: 500        // 单次动画时长（毫秒）
            }
        },

        // 高分显示
        HIGH_SCORE: {
            x: 360,
            y: 1035,
            fontSize: 36,
            fontColor: '#ffffff',
            strokeColor: '#000000',
            strokeThickness: 4
        },

        // 声音按钮
        SOUND_BUTTON: {
            x: 650,
            y: 70,
            scale: 1
        },

        // 音乐按钮
        MELODY_BUTTON: {
            x: 70,
            y: 70,
            scale: 1
        },

        // 信息按钮（预留）
        INFO_BUTTON: {
            x: 360,
            y: 1210,
            scale: 1,
            visible: false  // 暂时隐藏
        },

        // 更多游戏按钮（预留）
        MORE_GAMES_BUTTON: {
            x: 590,
            y: 117,
            scale: 1,
            visible: false  // 暂时隐藏
        }
    },

    // ==================== 游戏场景布局 ====================
    GAME: {
        // 背景
        BACKGROUND: {
            x: 360,
            y: 640,
            scale: 1
        },

        // 太阳装饰
        SUN_SCORE: {
            x: 360,
            y: 150,
            scale: 0.8,
            rotation: {
                enabled: true,
                duration: 15000
            }
        },

        // 分数显示
        SCORE: {
            x: 360,
            y: 180,
            fontSize: 72,
            fontColor: '#ffffff',
            strokeColor: '#000000',
            strokeThickness: 6
        },

        // 成功提示 (+1)
        WONDERFUL: {
            offsetY: -100,  // 相对于士兵的Y偏移
            fontSize: 64,
            fontColor: '#FFD700',
            strokeColor: '#000000',
            strokeThickness: 4,
            animation: {
                floatDistance: 100,
                duration: 800
            }
        },

        // 平台配置
        PLATFORM: {
            surfaceY: 780,      // 平台表面Y坐标（士兵站立的位置）
            startX: 100,        // 当前平台的起始X位置
            height: 500         // 平台高度
        },

        // 士兵位置
        SOLDIER: {
            offsetFromPlatformEdge: 20  // 距离平台右边缘的距离
        }
    },

    // ==================== 游戏结束UI ====================
    GAME_OVER: {
        // 遮罩
        OVERLAY: {
            color: 0x000000,
            alpha: 0.5
        },

        // 游戏结束文字
        TITLE: {
            x: 360,
            y: 540,  // 屏幕中心偏上
            text: 'GAME OVER',
            fontSize: 64,
            fontColor: '#ffffff',
            strokeColor: '#000000',
            strokeThickness: 6
        },

        // 最终分数
        FINAL_SCORE: {
            x: 360,
            y: 640,
            fontSize: 48,
            fontColor: '#FFD700',
            strokeColor: '#000000',
            strokeThickness: 4,
            prefix: '得分: '
        },

        // 新纪录提示
        NEW_RECORD: {
            x: 360,
            y: 720,
            text: '新纪录！',
            fontSize: 36,
            fontColor: '#FF4444',
            strokeColor: '#000000',
            strokeThickness: 3,
            animation: {
                type: 'blink',
                duration: 300
            }
        }
    },

    // ==================== 加载场景布局 ====================
    LOADING: {
        LOGO_Y: 540,

        PROGRESS_BAR: {
            Y: 690,
            WIDTH: 400,
            HEIGHT: 30,
            BG_COLOR: 0x222222,
            BG_ALPHA: 0.8,
            FILL_COLOR: 0x00ff00,
            PADDING: 5
        },

        TEXT_Y: 740
    },

    // ==================== 通用文字样式 ====================
    TEXT_STYLES: {
        // 标题样式
        TITLE: {
            fontFamily: 'Arial',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        },

        // 分数样式
        SCORE: {
            fontFamily: 'Arial',
            fontSize: '72px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        },

        // 普通文字样式
        NORMAL: {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        },

        // 提示文字样式
        HINT: {
            fontFamily: 'Arial',
            fontSize: '36px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        },

        // 加载文字样式
        LOADING: {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff'
        }
    },

    /**
     * 获取居中X坐标
     * @returns {number}
     */
    getCenterX() {
        return this.CANVAS.WIDTH / 2;
    },

    /**
     * 获取居中Y坐标
     * @returns {number}
     */
    getCenterY() {
        return this.CANVAS.HEIGHT / 2;
    },

    /**
     * 根据百分比获取X坐标
     * @param {number} percent - 百分比 (0-100)
     * @returns {number}
     */
    getXByPercent(percent) {
        return this.CANVAS.WIDTH * (percent / 100);
    },

    /**
     * 根据百分比获取Y坐标
     * @param {number} percent - 百分比 (0-100)
     * @returns {number}
     */
    getYByPercent(percent) {
        return this.CANVAS.HEIGHT * (percent / 100);
    }
};
