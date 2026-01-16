/**
 * 事件管理器
 *
 * 【使用说明】
 * 1. 用于解耦游戏各模块之间的通信
 * 2. 支持事件订阅、发布、取消订阅
 * 3. 便于后续功能扩展和模块化
 *
 * 【使用示例】
 * // 订阅事件
 * EventManager.on('scoreChanged', (score) => { console.log('分数:', score); });
 *
 * // 发布事件
 * EventManager.emit('scoreChanged', 100);
 *
 * // 取消订阅
 * EventManager.off('scoreChanged', handler);
 */

const EventManager = {
    // 事件监听器存储
    _listeners: {},

    /**
     * 订阅事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @param {Object} context - 回调函数的上下文 (this)
     * @returns {Object} 返回用于取消订阅的对象
     */
    on(event, callback, context = null) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }

        const listener = { callback, context };
        this._listeners[event].push(listener);

        // 返回用于取消订阅的对象
        return {
            remove: () => this.off(event, callback, context)
        };
    },

    /**
     * 订阅事件（只触发一次）
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @param {Object} context - 回调函数的上下文
     */
    once(event, callback, context = null) {
        const onceWrapper = (...args) => {
            this.off(event, onceWrapper, context);
            callback.apply(context, args);
        };
        this.on(event, onceWrapper, context);
    },

    /**
     * 取消订阅事件
     * @param {string} event - 事件名称
     * @param {Function} callback - 要移除的回调函数
     * @param {Object} context - 回调函数的上下文
     */
    off(event, callback, context = null) {
        if (!this._listeners[event]) return;

        this._listeners[event] = this._listeners[event].filter(
            listener => !(listener.callback === callback && listener.context === context)
        );
    },

    /**
     * 发布事件
     * @param {string} event - 事件名称
     * @param {...any} args - 传递给回调的参数
     */
    emit(event, ...args) {
        if (!this._listeners[event]) return;

        this._listeners[event].forEach(listener => {
            try {
                listener.callback.apply(listener.context, args);
            } catch (error) {
                console.error(`EventManager: Error in event "${event}" handler:`, error);
            }
        });
    },

    /**
     * 移除某个事件的所有监听器
     * @param {string} event - 事件名称
     */
    removeAllListeners(event) {
        if (event) {
            delete this._listeners[event];
        } else {
            this._listeners = {};
        }
    },

    /**
     * 获取某个事件的监听器数量
     * @param {string} event - 事件名称
     * @returns {number}
     */
    listenerCount(event) {
        return this._listeners[event] ? this._listeners[event].length : 0;
    }
};

// ==================== 预定义事件常量 ====================
/**
 * 游戏事件类型
 * 使用常量避免拼写错误，便于IDE自动补全
 */
const GameEvents = {
    // ========== 游戏流程事件 ==========
    GAME_START: 'game:start',           // 游戏开始
    GAME_OVER: 'game:over',             // 游戏结束
    GAME_RESTART: 'game:restart',       // 游戏重新开始
    GAME_PAUSE: 'game:pause',           // 游戏暂停
    GAME_RESUME: 'game:resume',         // 游戏恢复

    // ========== 分数事件 ==========
    SCORE_CHANGED: 'score:changed',     // 分数变化
    HIGH_SCORE_UPDATED: 'score:highUpdated',  // 高分更新

    // ========== 玩家事件 ==========
    PLAYER_WALK_START: 'player:walkStart',    // 玩家开始行走
    PLAYER_WALK_END: 'player:walkEnd',        // 玩家结束行走
    PLAYER_FALL: 'player:fall',               // 玩家掉落

    // ========== 棍子事件 ==========
    STICK_GROW_START: 'stick:growStart',      // 棍子开始伸长
    STICK_GROW_END: 'stick:growEnd',          // 棍子停止伸长
    STICK_FALL: 'stick:fall',                 // 棍子倒下
    STICK_LANDED: 'stick:landed',             // 棍子落地

    // ========== 平台事件 ==========
    PLATFORM_CREATED: 'platform:created',     // 新平台创建
    PLATFORM_SLIDE: 'platform:slide',         // 平台滑动

    // ========== UI事件 ==========
    BUTTON_CLICK: 'ui:buttonClick',           // 按钮点击
    SOUND_TOGGLE: 'ui:soundToggle',           // 音效开关
    MUSIC_TOGGLE: 'ui:musicToggle',           // 音乐开关

    // ========== 输入事件 ==========
    INPUT_DOWN: 'input:down',                 // 按下
    INPUT_UP: 'input:up',                     // 松开

    // ========== 场景事件 ==========
    SCENE_READY: 'scene:ready',               // 场景准备完成
    SCENE_TRANSITION: 'scene:transition'      // 场景切换
};
