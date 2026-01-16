# 快速修改指南

本文档面向策划和美术人员，提供常见修改的快速参考。

---

## 我想改...

### 游戏难度

**文件**: `js/config/GameplayConfig.js`

| 想要效果 | 修改参数 | 建议值 |
|---------|---------|-------|
| 平台更宽（更简单） | `PLATFORM.MAX_WIDTH` | 180 → 220 |
| 平台更窄（更难） | `PLATFORM.MIN_WIDTH` | 40 → 30 |
| 平台间距更小（更简单） | `PLATFORM.GAP_MAX` | 280 → 200 |
| 平台间距更大（更难） | `PLATFORM.GAP_MIN` | 80 → 120 |
| 棍子伸长更慢（更好控制） | `STICK.GROW_SPEED` | 700 → 500 |
| 棍子伸长更快（更难） | `STICK.GROW_SPEED` | 700 → 900 |

**启用动态难度**（随分数增加难度）:
```javascript
DIFFICULTY: {
    ENABLED: true,  // 改为 true
    PLATFORM_WIDTH_DECREASE_PER_SCORE: 2,
    GAP_INCREASE_PER_SCORE: 5
}
```

---

### UI元素位置

**文件**: `js/config/LayoutConfig.js`

**坐标参考**:
- 屏幕尺寸: 720 x 1280
- 中心点: (360, 640)
- 左上角: (0, 0)
- 右下角: (720, 1280)

| 元素 | 配置路径 | 示例 |
|-----|---------|------|
| 开始按钮 | `MENU.PLAY_BUTTON` | `x: 360, y: 760` |
| 高分显示 | `MENU.HIGH_SCORE` | `x: 360, y: 1035` |
| 音效按钮 | `MENU.SOUND_BUTTON` | `x: 650, y: 1210` |
| 音乐按钮 | `MENU.MELODY_BUTTON` | `x: 70, y: 1210` |
| 游戏分数 | `GAME.SCORE` | `x: 360, y: 180` |
| 游戏结束标题 | `GAME_OVER.TITLE` | `x: 360, y: 540` |

---

### 按钮动画

**文件**: `js/config/LayoutConfig.js`

开始按钮上下弹跳效果:
```javascript
PLAY_BUTTON: {
    animation: {
        type: 'bounce',    // 动画类型
        amplitude: 15,     // 弹跳幅度（像素）
        duration: 500      // 一次弹跳时间（毫秒）
    }
}
```

关闭动画: 将 `type` 改为 `'none'`

---

### 角色速度

**文件**: `js/config/GameplayConfig.js`

```javascript
SOLDIER: {
    WALK_SPEED: 500,   // 行走速度，数值越大走得越快
    FALL_SPEED: 2100   // 下落速度
}
```

---

### 雪花效果

**文件**: `js/config/GameplayConfig.js`

```javascript
SNOW: {
    COUNT: 30,         // 雪花数量
    MIN_SPEED: 30,     // 最慢下落速度
    MAX_SPEED: 100,    // 最快下落速度
    MIN_SCALE: 0.2,    // 最小尺寸
    MAX_SCALE: 0.5,    // 最大尺寸
    ALPHA: 0.5,        // 透明度 (0-1)
    SWAY_RANGE: 30     // 左右摇摆范围
}
```

---

### 游戏结束等待时间

**文件**: `js/config/GameplayConfig.js`

```javascript
GAME_FLOW: {
    GAME_OVER_DELAY: 1500  // 游戏结束后等待时间（毫秒）
}
```

---

### 音量

**文件**: `js/config/GameplayConfig.js`

```javascript
AUDIO: {
    MUSIC_VOLUME: 0.5,  // 背景音乐音量 (0-1)
    SFX_VOLUME: 0.7     // 音效音量 (0-1)
}
```

---

### 文字样式

**文件**: `js/config/LayoutConfig.js`

修改分数显示样式:
```javascript
GAME: {
    SCORE: {
        fontSize: 72,           // 字号
        fontColor: '#ffffff',   // 文字颜色
        strokeColor: '#000000', // 描边颜色
        strokeThickness: 6      // 描边粗细
    }
}
```

---

## 美术资源替换

### 替换现有图片

1. 准备新图片，**保持原文件名**
2. 覆盖 `assets/images/` 目录下的对应文件
3. 刷新浏览器测试

### 修改精灵表帧尺寸

**文件**: `js/config/AssetsConfig.js`

如果士兵图片尺寸变了:
```javascript
SOLDIER: {
    frameConfig: {
        frameWidth: 80,   // 新的帧宽度
        frameHeight: 108  // 新的帧高度
    }
}
```

### 添加新图片

1. 将图片放入 `assets/images/`
2. 在 `AssetsConfig.js` 的 `IMAGES` 中添加:
```javascript
MY_NEW_IMAGE: {
    key: 'my-new-image',
    file: 'my-new-image.png',
    description: '我的新图片'
}
```
3. 在场景代码中使用: `this.add.image(x, y, 'my-new-image')`

---

## 常见问题

### Q: 修改后没有效果？
A: 请确保:
1. 保存了文件
2. 刷新了浏览器（Ctrl+F5 强制刷新）
3. 检查浏览器控制台是否有错误（F12打开）

### Q: 图片显示不正确？
A: 检查:
1. 文件名是否正确
2. 图片是否放在正确目录
3. 如果是精灵表，检查 `frameConfig` 是否匹配

### Q: 音频不播放？
A:
1. 需要先点击屏幕一次（浏览器限制）
2. 检查文件是否同时有 `.ogg` 和 `.m4a` 格式

### Q: 位置看起来不对？
A: 记住:
- 坐标原点在左上角
- X向右增大
- Y向下增大
- 大多数UI元素使用中心点定位

---

## 测试流程

1. 修改配置文件
2. 保存文件
3. 刷新浏览器 (Ctrl+F5)
4. 如有问题，按 F12 查看控制台错误
5. 满意后告知程序人员
