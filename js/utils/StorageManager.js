/**
 * 本地存储管理器
 * 封装 localStorage 操作，用于保存和读取游戏数据
 */
class StorageManager {
    /**
     * 获取高分
     * @returns {number} 高分值
     */
    static getHighScore() {
        const score = localStorage.getItem(GameConfig.STORAGE.HIGH_SCORE_KEY);
        return score ? parseInt(score, 10) : 0;
    }

    /**
     * 保存高分
     * @param {number} score - 分数
     */
    static setHighScore(score) {
        localStorage.setItem(GameConfig.STORAGE.HIGH_SCORE_KEY, score.toString());
    }

    /**
     * 更新高分（仅当新分数更高时保存）
     * @param {number} score - 当前分数
     * @returns {boolean} 是否创造了新高分
     */
    static updateHighScore(score) {
        const currentHighScore = this.getHighScore();
        if (score > currentHighScore) {
            this.setHighScore(score);
            return true;
        }
        return false;
    }

    /**
     * 获取声音开关状态
     * @returns {boolean} 声音是否开启
     */
    static getSoundEnabled() {
        const sound = localStorage.getItem(GameConfig.STORAGE.SOUND_KEY);
        return sound === null ? true : sound === 'true';
    }

    /**
     * 设置声音开关状态
     * @param {boolean} enabled - 是否开启
     */
    static setSoundEnabled(enabled) {
        localStorage.setItem(GameConfig.STORAGE.SOUND_KEY, enabled.toString());
    }

    /**
     * 获取音乐开关状态
     * @returns {boolean} 音乐是否开启
     */
    static getMelodyEnabled() {
        const melody = localStorage.getItem(GameConfig.STORAGE.MELODY_KEY);
        return melody === null ? true : melody === 'true';
    }

    /**
     * 设置音乐开关状态
     * @param {boolean} enabled - 是否开启
     */
    static setMelodyEnabled(enabled) {
        localStorage.setItem(GameConfig.STORAGE.MELODY_KEY, enabled.toString());
    }

    /**
     * 清除所有游戏数据
     */
    static clearAll() {
        localStorage.removeItem(GameConfig.STORAGE.HIGH_SCORE_KEY);
        localStorage.removeItem(GameConfig.STORAGE.SOUND_KEY);
        localStorage.removeItem(GameConfig.STORAGE.MELODY_KEY);
    }
}
