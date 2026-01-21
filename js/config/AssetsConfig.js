/**
 * 美术资源配置文件
 *
 * 【使用说明 - 美术人员】
 * 1. 替换图片时，保持文件名不变，直接覆盖 assets/images/ 目录下的文件
 * 2. 如需修改图片尺寸，在下方对应的 size 属性中更新
 * 3. 添加新资源时，在对应分类下添加新条目
 *
 * 【资源命名规范】
 * - 图片: 小写字母 + 连字符，如 btn-play.png
 * - 精灵表: 名称-sheet0.png
 * - 音频: 小写字母，如 gameover.ogg
 */

const AssetsConfig = {
    // 基础路径配置
    BASE_PATH: {
        IMAGES: 'assets/images/',
        AUDIO: 'assets/audio/'
    },

    /**
     * 图片资源配置
     * key: 资源标识符（代码中使用）
     * file: 文件名
     * size: 原始尺寸 { width, height }（可选，用于精灵表切割）
     * frames: 精灵表帧配置（可选）
     */
    IMAGES: {
        // ========== 背景和装饰 ==========
        BACKGROUND: {
            key: 'background',
            file: 'background-sheet0.png',
            description: '游戏背景图'
        },
        GAME_LOGO: {
            key: 'game-logo',
            file: 'gamelogo-sheet0.png',
            description: '游戏Logo'
        },
        SUN_LOGO: {
            key: 'sun-logo',
            file: 'sunlogo-sheet0.png',
            description: '太阳装饰（菜单）'
        },
        SUN_SCORE: {
            key: 'sun-score',
            file: 'sunscore-sheet0.png',
            description: '太阳装饰（游戏中）'
        },
        LOADING_LOGO: {
            key: 'loading-logo',
            file: '../loading-logo.png',  // 在根目录
            description: '加载界面Logo'
        },

        // ========== 游戏角色 ==========
        SOLDIER: {
            key: 'soldier',
            file: 'soldier-sheet0.png',
            description: '士兵精灵表（站立）',
            isSprite: true,
            frameConfig: {
                frameWidth: 77,
                frameHeight: 105,
                startFrame: 0,
                endFrame: 5,
                margin: 3,
                spacing: 5
            }
        },
        SOLDIER_WALK: {
            key: 'soldier-walk',
            file: 'soldier-sheet1.png',
            description: '士兵精灵表（行走）',
            isSprite: true,
            frameConfig: {
                frameWidth: 80,
                frameHeight: 108
            }
        },

        // ========== 游戏道具 ==========
        STICK: {
            key: 'stick',
            file: 'stick-sheet0.png',
            description: '棍子'
        },
        PLATFORM: {
            key: 'platform',
            file: 'platform1-sheet0.png',
            description: '平台'
        },
        SNOW: {
            key: 'snow',
            file: 'snow-sheet0.png',
            description: '雪花粒子'
        },

        // ========== UI按钮 ==========
        BTN_PLAY: {
            key: 'btn-play',
            file: 'btnplay-sheet0.png',
            description: '开始按钮'
        },
        BTN_SOUND_ON: {
            key: 'btn-sound-on',
            file: 'btnsound-sheet0.png',
            description: '声音开启按钮'
        },
        BTN_SOUND_OFF: {
            key: 'btn-sound-off',
            file: 'btnsound-sheet1.png',
            description: '声音关闭按钮'
        },
        BTN_MELODY_ON: {
            key: 'btn-melody-on',
            file: 'btnmelody-sheet0.png',
            description: '音乐开启按钮'
        },
        BTN_MELODY_OFF: {
            key: 'btn-melody-off',
            file: 'btnmelody-sheet1.png',
            description: '音乐关闭按钮'
        },
        BTN_INFO: {
            key: 'btn-info',
            file: 'btninfo-sheet0.png',
            description: '信息按钮'
        },
        BTN_MORE_GAMES: {
            key: 'btn-more-games',
            file: 'btnmoregames-sheet0.png',
            description: '更多游戏按钮'
        },

        // ========== 字体图片 ==========
        SCORE_FONT: {
            key: 'score-font',
            file: 'scorefont.png',
            description: '分数字体（0-9数字精灵表，帧10-11为空白）',
            isSprite: true,
            frameConfig: {
                frameWidth: 128,
                frameHeight: 128,
                startFrame: 0,
                endFrame: 9
            }
        },
        HIGH_SCORE_FONT: {
            key: 'high-score-font',
            file: 'highscorefont.png',
            description: '高分字体（A-Z, a-z, 0-9, :, %）',
            isSprite: true,
            frameConfig: {
                frameWidth: 64,
                frameHeight: 64
            }
        },
        HELP_FONT: {
            key: 'help-font',
            file: 'helpfont.png',
            description: '帮助文字'
        },
        WONDERFUL_FONT: {
            key: 'wonderful-font',
            file: 'wonderfulfont.png',
            description: '成功提示文字'
        },

        // ========== 广告占位 ==========
        AD_PLACEHOLDER: {
            key: 'ad-placeholder',
            file: '../occupation.png',
            description: '广告占位图'
        },

        // ========== 游戏结束界面 ==========
        GAME_OVER_IMAGE: {
            key: 'game-over-image',
            file: 'gameover.png',
            description: '游戏结束大图'
        },
        MENU_BUTTON: {
            key: 'menu-button',
            file: 'menubutton.png',
            description: '返回主菜单按钮'
        }
    },

    /**
     * 音频资源配置
     * key: 资源标识符
     * file: 文件名（不含扩展名，会自动加载 .ogg 和 .m4a）
     * volume: 默认音量 (0-1)
     * loop: 是否循环
     */
    AUDIO: {
        // ========== 背景音乐 ==========
        MUSIC_THEME: {
            key: 'music-theme',
            file: 'musictheme',
            description: '背景音乐',
            volume: 0.5,
            loop: true,
            category: 'music'
        },

        // ========== 游戏音效 ==========
        SFX_STICK: {
            key: 'sfx-stick',
            file: 'stick',
            description: '棍子伸出音效',
            volume: 0.7,
            category: 'sfx'
        },
        SFX_STICK_DONE: {
            key: 'sfx-stick-done',
            file: 'stickdone',
            description: '棍子落下音效',
            volume: 0.7,
            category: 'sfx'
        },
        SFX_WALK: {
            key: 'sfx-walk',
            file: 'soldierwalk',
            description: '士兵行走音效',
            volume: 0.7,
            category: 'sfx'
        },
        SFX_GAMEOVER: {
            key: 'sfx-gameover',
            file: 'gameover',
            description: '游戏结束音效',
            volume: 0.7,
            category: 'sfx'
        },
        SFX_WONDERFUL: {
            key: 'sfx-wonderful',
            file: 'wonderful',
            description: '成功音效',
            volume: 0.7,
            category: 'sfx'
        },
        SFX_BUTTON: {
            key: 'sfx-button',
            file: 'superbutton',
            description: '按钮点击音效',
            volume: 0.7,
            category: 'sfx'
        }
    },

    /**
     * 动画配置
     * 定义精灵动画的帧序列和播放参数
     */
    ANIMATIONS: {
        SOLDIER_IDLE: {
            key: 'soldier-idle',
            spriteKey: 'soldier',
            frames: { start: 0, end: 4 },
            frameRate: 5,
            repeat: -1,
            description: '士兵站立动画'
        },
        SOLDIER_WALK: {
            key: 'soldier-walk',
            // 使用自定义帧序列（跨精灵表）
            customFrames: [
                { key: 'soldier', frame: 5 },
                { key: 'soldier-walk', frame: 0 },
                { key: 'soldier-walk', frame: 1 },
                { key: 'soldier-walk', frame: 2 }
            ],
            frameRate: 10,
            repeat: -1,
            description: '士兵行走动画'
        }
    },

    /**
     * 获取图片完整路径
     * @param {string} imageKey - 图片配置的key
     * @returns {string} 完整路径
     */
    getImagePath(imageKey) {
        const config = this.IMAGES[imageKey];
        if (!config) {
            console.warn(`Image config not found: ${imageKey}`);
            return '';
        }
        // 处理相对路径
        if (config.file.startsWith('../')) {
            return config.file.substring(3);
        }
        return this.BASE_PATH.IMAGES + config.file;
    },

    /**
     * 获取音频完整路径（返回数组，包含多种格式）
     * @param {string} audioKey - 音频配置的key
     * @returns {string[]} 路径数组
     */
    getAudioPaths(audioKey) {
        const config = this.AUDIO[audioKey];
        if (!config) {
            console.warn(`Audio config not found: ${audioKey}`);
            return [];
        }
        const basePath = this.BASE_PATH.AUDIO + config.file;
        return [basePath + '.ogg', basePath + '.m4a'];
    }
};
