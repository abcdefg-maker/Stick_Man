/**
 * 游戏常量配置
 * 所有游戏相关的常量都在这里定义，便于统一管理和调整
 */
const GameConfig = {
    // 游戏尺寸
    WIDTH: 720,
    HEIGHT: 1280,

    // 游戏状态
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

    // 士兵参数
    SOLDIER: {
        START_X: 200,
        WIDTH: 80,
        HEIGHT: 108,
        WALK_SPEED: 500,
        FALL_SPEED: 2100,
        ORIGIN_X: 0.5,
        ORIGIN_Y: 1
    },

    // 棍子参数
    STICK: {
        WIDTH: 20,
        MAX_HEIGHT: 1280,
        GROW_SPEED: 700,
        ROTATE_SPEED: 300,
        FALL_SPEED: 2100,
        ORIGIN_X: 0.5,
        ORIGIN_Y: 1
    },

    // 平台参数
    PLATFORM: {
        HEIGHT: 500,
        MIN_WIDTH: 40,
        MAX_WIDTH: 180,
        SLIDE_SPEED: 700,
        SHOW_SPEED: 1000,
        GAP_MIN: 80,
        GAP_MAX: 280,
        SURFACE_Y: 780,
        START_X: 100
    },

    // 雪花参数
    SNOW: {
        COUNT: 50,
        MIN_SPEED: 50,
        MAX_SPEED: 150,
        MIN_SCALE: 0.3,
        MAX_SCALE: 0.8
    },

    // UI 参数
    UI: {
        PLAY_BUTTON_Y: 760,
        PLAY_BUTTON_AMPLITUDE: 15,
        PLAY_BUTTON_FREQUENCY: 3,
        SCORE_Y: 180,
        HIGH_SCORE_Y: 1035,
        SOUND_BUTTON_X: 650,
        SOUND_BUTTON_Y: 1210,
        MELODY_BUTTON_X: 70,
        MELODY_BUTTON_Y: 1210
    },

    // 音频参数
    AUDIO: {
        MUSIC_VOLUME: 0.5,
        SFX_VOLUME: 0.7
    },

    // 本地存储键名
    STORAGE: {
        HIGH_SCORE_KEY: 'StickSamurai_HighScore',
        SOUND_KEY: 'StickSamurai_Sound',
        MELODY_KEY: 'StickSamurai_Melody'
    },

    // 游戏结束等待时间（毫秒）
    GAME_OVER_DELAY: 1500
};

// 资源路径配置
const Assets = {
    IMAGES: {
        // 背景和装饰
        BACKGROUND: 'assets/images/background-sheet0.png',
        GAME_LOGO: 'assets/images/gamelogo-sheet0.png',
        SUN_LOGO: 'assets/images/sunlogo-sheet0.png',
        SUN_SCORE: 'assets/images/sunscore-sheet0.png',
        LOADING_LOGO: 'loading-logo.png',

        // 游戏对象
        SOLDIER: 'assets/images/soldier-sheet0.png',
        SOLDIER_WALK: 'assets/images/soldier-sheet1.png',
        STICK: 'assets/images/stick-sheet0.png',
        PLATFORM: 'assets/images/platform1-sheet0.png',
        SNOW: 'assets/images/snow-sheet0.png',

        // UI 按钮
        BTN_PLAY: 'assets/images/btnplay-sheet0.png',
        BTN_SOUND_ON: 'assets/images/btnsound-sheet0.png',
        BTN_SOUND_OFF: 'assets/images/btnsound-sheet1.png',
        BTN_MELODY_ON: 'assets/images/btnmelody-sheet0.png',
        BTN_MELODY_OFF: 'assets/images/btnmelody-sheet1.png',
        BTN_INFO: 'assets/images/btninfo-sheet0.png',
        BTN_MORE_GAMES: 'assets/images/btnmoregames-sheet0.png',

        // 字体
        SCORE_FONT: 'assets/images/scorefont.png',
        HIGH_SCORE_FONT: 'assets/images/highscorefont.png',
        HELP_FONT: 'assets/images/helpfont.png',
        WONDERFUL_FONT: 'assets/images/wonderfulfont.png',

        // 碰撞检测（不可见）
        COLLISION: 'assets/images/collision-sheet0.png',
        COLLISION_GAME_OVER: 'assets/images/collisiongameover-sheet0.png'
    },

    AUDIO: {
        MUSIC_THEME: 'assets/audio/musictheme',
        STICK: 'assets/audio/stick',
        STICK_DONE: 'assets/audio/stickdone',
        SOLDIER_WALK: 'assets/audio/soldierwalk',
        GAME_OVER: 'assets/audio/gameover',
        WONDERFUL: 'assets/audio/wonderful',
        SUPER_BUTTON: 'assets/audio/superbutton'
    }
};
