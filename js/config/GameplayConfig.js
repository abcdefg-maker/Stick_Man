/**
 * 游戏玩法配置文件
 *
 * 【使用说明 - 策划人员】
 * 1. 所有游戏数值参数都在这里配置
 * 2. 修改后刷新浏览器即可测试效果
 * 3. 建议先小幅度调整，测试后再继续
 *
 * 【难度调整建议】
 * - 降低难度: 增大平台宽度、减小间距、降低棍子速度
 * - 提高难度: 减小平台宽度、增大间距、提高棍子速度
 */

const GameplayConfig = {
    // ==================== 士兵参数 ====================
    SOLDIER: {
        // 尺寸
        WIDTH: 80,
        HEIGHT: 108,

        // 移动速度
        WALK_SPEED: 500,        // 行走速度（像素/秒）
        FALL_SPEED: 2100,       // 下落加速度（像素/秒²）

        // 动画
        IDLE_FRAME_RATE: 10,    // 站立动画帧率
        WALK_FRAME_RATE: 10,    // 行走动画帧率

        // 渲染
        DEPTH: 10,              // 图层深度（越大越在上面）
        ORIGIN_X: 0.5,          // 原点X (0-1)
        ORIGIN_Y: 1             // 原点Y (0-1)，1表示脚底
    },

    // ==================== 棍子参数 ====================
    STICK: {
        // 尺寸
        WIDTH: 20,              // 棍子宽度
        MAX_HEIGHT: 800,        // 最大长度

        // 速度
        GROW_SPEED: 700,        // 伸长速度（像素/秒）
        ROTATE_SPEED: 300,      // 旋转速度（度/秒）
        FALL_SPEED: 2100,       // 下落速度

        // 渲染
        DEPTH: 2,
        COLOR: 0x4a3728         // 棍子颜色（如果使用图形绘制）
    },

    // ==================== 平台参数 ====================
    PLATFORM: {
        // 尺寸范围
        MIN_WIDTH: 40,          // 最小宽度
        MAX_WIDTH: 180,         // 最大宽度
        HEIGHT: 500,            // 高度

        // 间距范围（两平台之间的距离）
        GAP_MIN: 80,            // 最小间距
        GAP_MAX: 280,           // 最大间距

        // 位置
        SURFACE_Y: 780,         // 平台表面Y坐标
        START_X: 100,           // 起始X位置

        // 动画
        SLIDE_SPEED: 700,       // 滑入速度（像素/秒）
        SLIDE_DURATION: 500     // 滑入动画时长（毫秒）
    },

    // ==================== 雪花特效 ====================
    SNOW: {
        COUNT: 42,              // 雪花数量（增加40%）
        MIN_SPEED: 30,          // 最小下落速度
        MAX_SPEED: 100,         // 最大下落速度
        MIN_SCALE: 0.06,        // 最小缩放（缩小70%）
        MAX_SCALE: 0.15,        // 最大缩放（缩小70%）
        ALPHA: 0.5,             // 透明度
        DEPTH: 100,             // 图层深度
        SWAY_RANGE: 30          // 左右摇摆范围
    },

    // ==================== 游戏流程 ====================
    GAME_FLOW: {
        // 游戏结束
        GAME_OVER_DELAY: 1500,  // 游戏结束后等待时间（毫秒）

        // 场景切换
        SCENE_TRANSITION_DURATION: 500,  // 场景切换动画时长

        // 回合间隔
        ROUND_TRANSITION_DURATION: 500   // 回合间切换时长
    },

    // ==================== 分数系统 ====================
    SCORE: {
        // 基础得分
        CROSS_PLATFORM: 1,      // 成功跨越平台得分

        // 特殊得分（预留扩展）
        PERFECT_LANDING: 0,     // 完美落地额外得分
        COMBO_BONUS: 0,         // 连击奖励

        // 显示效果
        POPUP_DURATION: 800,    // +1 弹出显示时长
        POPUP_FLOAT_DISTANCE: 100  // 弹出上浮距离
    },

    // ==================== 难度曲线（预留扩展） ====================
    DIFFICULTY: {
        // 是否启用动态难度
        ENABLED: false,

        // 难度递增参数
        PLATFORM_WIDTH_DECREASE_PER_SCORE: 2,   // 每得1分，平台宽度减少
        GAP_INCREASE_PER_SCORE: 5,              // 每得1分，间距增加

        // 难度上限
        MIN_PLATFORM_WIDTH: 30,
        MAX_GAP: 350
    },

    // ==================== 音频参数 ====================
    AUDIO: {
        MUSIC_VOLUME: 0.5,      // 背景音乐音量 (0-1)
        SFX_VOLUME: 0.7,        // 音效音量 (0-1)

        // 音效触发时机
        PLAY_STICK_SOUND_ON_PRESS: true,    // 按下时播放棍子音效
        PLAY_WALK_SOUND_ON_MOVE: true       // 移动时播放行走音效
    },

    // ==================== 本地存储 ====================
    STORAGE: {
        HIGH_SCORE_KEY: 'StickSamurai_HighScore',
        SOUND_KEY: 'StickSamurai_Sound',
        MELODY_KEY: 'StickSamurai_Melody'
    },

    // ==================== 游戏状态 ====================
    STATES: {
        CLICK_PLAY: 'CLICK_PLAY',
        SLIDE_PLATFORM_LEFT: 'SLIDE_PLATFORM_LEFT',
        SHOW_NEW_PLATFORM: 'SHOW_NEW_PLATFORM',
        READ_MOUSE: 'READ_MOUSE',
        BRIDGE_FALLING: 'BRIDGE_FALLING',
        PLAYER_WALK_BRIDGE: 'PLAYER_WALK_BRIDGE',
        FINISHED_WALKING: 'FINISHED_WALKING',
        PLAYER_GOOD_WALK: 'PLAYER_GOOD_WALK',
        GAME_OVER: 'GAME_OVER'
    },

    /**
     * 根据当前分数计算平台宽度范围（动态难度）
     * @param {number} score - 当前分数
     * @returns {{ min: number, max: number }}
     */
    getPlatformWidthRange(score) {
        if (!this.DIFFICULTY.ENABLED) {
            return {
                min: this.PLATFORM.MIN_WIDTH,
                max: this.PLATFORM.MAX_WIDTH
            };
        }

        const decrease = score * this.DIFFICULTY.PLATFORM_WIDTH_DECREASE_PER_SCORE;
        return {
            min: Math.max(
                this.DIFFICULTY.MIN_PLATFORM_WIDTH,
                this.PLATFORM.MIN_WIDTH - decrease
            ),
            max: Math.max(
                this.DIFFICULTY.MIN_PLATFORM_WIDTH + 50,
                this.PLATFORM.MAX_WIDTH - decrease
            )
        };
    },

    /**
     * 根据当前分数计算间距范围（动态难度）
     * @param {number} score - 当前分数
     * @returns {{ min: number, max: number }}
     */
    getGapRange(score) {
        if (!this.DIFFICULTY.ENABLED) {
            return {
                min: this.PLATFORM.GAP_MIN,
                max: this.PLATFORM.GAP_MAX
            };
        }

        const increase = score * this.DIFFICULTY.GAP_INCREASE_PER_SCORE;
        return {
            min: this.PLATFORM.GAP_MIN + increase,
            max: Math.min(
                this.DIFFICULTY.MAX_GAP,
                this.PLATFORM.GAP_MAX + increase
            )
        };
    }
};
