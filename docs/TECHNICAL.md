# 技术文档 - 棍兵 Phaser 3

本文档面向开发人员，详细说明项目的技术实现。

## 目录

1. [架构概述](#架构概述)
2. [文件依赖关系](#文件依赖关系)
3. [核心模块详解](#核心模块详解)
4. [游戏循环实现](#游戏循环实现)
5. [扩展开发指南](#扩展开发指南)

---

## 架构概述

### 设计原则

1. **配置与逻辑分离**: 所有可调参数放在 `config/` 目录
2. **事件驱动**: 使用 `EventManager` 解耦模块
3. **场景化管理**: 每个游戏阶段对应一个 Phaser Scene

### 技术栈

- **游戏引擎**: Phaser 3.70.0 (CDN引入)
- **语言**: ES6 JavaScript
- **构建**: 无需构建，直接运行

---

## 文件依赖关系

```
index.html
    │
    ├── Phaser 3 (CDN)
    │
    ├── 配置文件 (无依赖，最先加载)
    │   ├── AssetsConfig.js
    │   ├── LayoutConfig.js
    │   └── GameplayConfig.js
    │
    ├── 工具类
    │   ├── Constants.js (依赖: 无)
    │   ├── StorageManager.js (依赖: 无)
    │   └── EventManager.js (依赖: 无)
    │
    ├── 游戏对象类 (暂未使用)
    │   ├── Platform.js
    │   ├── Stick.js
    │   ├── Soldier.js
    │   └── Snow.js
    │
    ├── UI组件 (暂未使用)
    │   ├── Button.js
    │   └── ScoreDisplay.js
    │
    ├── 场景
    │   ├── BootScene.js (依赖: StorageManager, Constants)
    │   ├── PreloadScene.js (依赖: AssetsConfig, LayoutConfig)
    │   ├── MenuScene.js (依赖: LayoutConfig, GameplayConfig, EventManager)
    │   └── GameScene.js (依赖: LayoutConfig, GameplayConfig, EventManager)
    │
    └── main.js (依赖: 所有场景, Constants)
```

---

## 核心模块详解

### 1. AssetsConfig.js

**职责**: 集中管理所有资源路径和配置

**核心结构**:
```javascript
const AssetsConfig = {
    BASE_PATH: { IMAGES: 'assets/images/', AUDIO: 'assets/audio/' },
    IMAGES: { /* 图片配置 */ },
    AUDIO: { /* 音频配置 */ },
    ANIMATIONS: { /* 动画配置 */ },

    getImagePath(key) { /* 返回完整图片路径 */ },
    getAudioPaths(key) { /* 返回音频路径数组 [.ogg, .m4a] */ }
};
```

**图片配置格式**:
```javascript
{
    key: 'texture-key',      // Phaser texture key
    file: 'filename.png',    // 文件名
    description: '描述',
    isSprite: false,         // 是否为精灵表
    frameConfig: {           // 精灵表配置 (仅isSprite=true时需要)
        frameWidth: 80,
        frameHeight: 108
    }
}
```

**音频配置格式**:
```javascript
{
    key: 'audio-key',
    file: 'filename',        // 不含扩展名
    description: '描述',
    volume: 0.7,
    loop: false,
    category: 'sfx'          // 'sfx' 或 'music'
}
```

---

### 2. LayoutConfig.js

**职责**: 管理所有UI元素的位置和样式

**核心结构**:
```javascript
const LayoutConfig = {
    CANVAS: { WIDTH: 720, HEIGHT: 1280 },
    MENU: { /* 菜单场景布局 */ },
    GAME: { /* 游戏场景布局 */ },
    GAME_OVER: { /* 游戏结束UI布局 */ },
    LOADING: { /* 加载场景布局 */ },
    TEXT_STYLES: { /* 预定义文字样式 */ },

    getCenterX() { return 360; },
    getCenterY() { return 640; },
    getXByPercent(percent) { /* 百分比转X坐标 */ },
    getYByPercent(percent) { /* 百分比转Y坐标 */ }
};
```

**UI元素配置格式**:
```javascript
{
    x: 360,
    y: 640,
    scale: 1,
    animation: {
        type: 'bounce',      // 动画类型
        amplitude: 15,       // 振幅
        duration: 500        // 时长
    }
}
```

---

### 3. GameplayConfig.js

**职责**: 管理所有游戏数值参数

**核心结构**:
```javascript
const GameplayConfig = {
    SOLDIER: { /* 士兵参数 */ },
    STICK: { /* 棍子参数 */ },
    PLATFORM: { /* 平台参数 */ },
    SNOW: { /* 雪花特效参数 */ },
    GAME_FLOW: { /* 游戏流程时间参数 */ },
    SCORE: { /* 分数系统参数 */ },
    DIFFICULTY: { /* 动态难度配置 */ },
    AUDIO: { /* 音频参数 */ },
    STORAGE: { /* 存储key */ },
    STATES: { /* 游戏状态枚举 */ },

    getPlatformWidthRange(score) { /* 根据分数返回平台宽度范围 */ },
    getGapRange(score) { /* 根据分数返回间距范围 */ }
};
```

**动态难度实现**:
```javascript
// 启用动态难度
DIFFICULTY: {
    ENABLED: true,
    PLATFORM_WIDTH_DECREASE_PER_SCORE: 2,
    GAP_INCREASE_PER_SCORE: 5,
    MIN_PLATFORM_WIDTH: 30,
    MAX_GAP: 350
}

// 使用方法
const widthRange = GameplayConfig.getPlatformWidthRange(score);
const newWidth = Phaser.Math.Between(widthRange.min, widthRange.max);
```

---

### 4. EventManager.js

**职责**: 提供发布/订阅模式的事件系统

**API**:
```javascript
// 订阅事件
const subscription = EventManager.on('eventName', callback, context);

// 订阅一次性事件
EventManager.once('eventName', callback, context);

// 取消订阅
EventManager.off('eventName', callback, context);
// 或
subscription.remove();

// 发布事件
EventManager.emit('eventName', arg1, arg2, ...);

// 移除所有监听
EventManager.removeAllListeners('eventName');
EventManager.removeAllListeners(); // 移除全部

// 获取监听器数量
EventManager.listenerCount('eventName');
```

**预定义事件 (GameEvents)**:
```javascript
// 游戏流程
GameEvents.GAME_START        // 游戏开始
GameEvents.GAME_OVER         // 游戏结束 {score, isNewHighScore}
GameEvents.GAME_RESTART      // 重新开始

// 分数
GameEvents.SCORE_CHANGED     // 分数变化 (score)
GameEvents.HIGH_SCORE_UPDATED// 高分更新 (score)

// 玩家
GameEvents.PLAYER_WALK_START // 开始行走
GameEvents.PLAYER_WALK_END   // 结束行走
GameEvents.PLAYER_FALL       // 掉落

// 棍子
GameEvents.STICK_GROW_START  // 开始伸长
GameEvents.STICK_GROW_END    // 停止伸长
GameEvents.STICK_FALL        // 倒下
GameEvents.STICK_LANDED      // 落地

// 平台
GameEvents.PLATFORM_CREATED  // 创建 {width, gap}
GameEvents.PLATFORM_SLIDE    // 滑动

// UI
GameEvents.BUTTON_CLICK      // 按钮点击
GameEvents.SOUND_TOGGLE      // 音效开关 (enabled)
GameEvents.MUSIC_TOGGLE      // 音乐开关 (enabled)

// 输入
GameEvents.INPUT_DOWN        // 按下
GameEvents.INPUT_UP          // 松开

// 场景
GameEvents.SCENE_READY       // 准备完成 (sceneName)
```

---

### 5. StorageManager.js

**职责**: 封装 localStorage 操作

**API**:
```javascript
StorageManager.getHighScore()           // 获取高分
StorageManager.setHighScore(score)      // 设置高分
StorageManager.updateHighScore(score)   // 更新高分(如果更高)，返回是否更新

StorageManager.getSoundEnabled()        // 获取音效开关状态
StorageManager.setSoundEnabled(enabled) // 设置音效开关

StorageManager.getMelodyEnabled()       // 获取音乐开关状态
StorageManager.setMelodyEnabled(enabled)// 设置音乐开关
```

---

## 游戏循环实现

### 状态机设计

```
          ┌──────────────────────────────────────┐
          │                                      │
          ▼                                      │
    SLIDE_PLATFORM_LEFT                          │
          │                                      │
          ▼                                      │
      READ_MOUSE ◄────────────────┐              │
          │                       │              │
          │ (按住屏幕，棍子伸长)   │              │
          │                       │              │
          ▼                       │              │
    BRIDGE_FALLING                │              │
          │                       │              │
          │ (棍子旋转90度)        │              │
          │                       │              │
          ▼                       │              │
   PLAYER_WALK_BRIDGE             │              │
          │                       │              │
          ├─── 成功 ───►  PLAYER_GOOD_WALK ──────┘
          │                       │
          └─── 失败 ───►  GAME_OVER ─────────► MenuScene
```

### 核心更新循环

```javascript
update(time, delta) {
    const dt = delta / 1000; // 转换为秒

    switch (this.gameState) {
        case STATES.READ_MOUSE:
            // 检测输入，更新棍子伸长
            if (this.isPointerDown) {
                this.stickHeight += GROW_SPEED * dt;
            }
            break;

        case STATES.BRIDGE_FALLING:
            // 棍子旋转动画
            if (this.stickAngle < 90) {
                this.stickAngle += ROTATE_SPEED * dt;
                if (this.stickAngle >= 90) {
                    this.checkStickLanding(); // 检测落点
                }
            }
            break;

        case STATES.PLAYER_WALK_BRIDGE:
            // 士兵移动
            this.soldier.x += WALK_SPEED * dt;
            if (this.soldier.x >= this.walkTargetX) {
                // 判断成功或失败
            }
            break;
    }
}
```

### 碰撞检测

棍子落点检测：
```javascript
checkStickLanding() {
    // 棍子末端X坐标 = 棍子起点 + 棍子长度
    const stickEndX = this.stickX + this.stickHeight;

    // 平台范围
    const platformLeft = this.nextPlatform.x;
    const platformRight = this.nextPlatform.x + this.nextPlatform.platformWidth;

    // 判断是否落在平台上
    if (stickEndX >= platformLeft && stickEndX <= platformRight) {
        // 成功
    } else {
        // 失败
    }
}
```

---

## 扩展开发指南

### 添加新场景

1. 创建场景文件 `js/scenes/NewScene.js`:
```javascript
class NewScene extends Phaser.Scene {
    constructor() {
        super({ key: 'NewScene' });
    }

    create() {
        // 场景初始化
        EventManager.emit(GameEvents.SCENE_READY, 'NewScene');
    }
}
```

2. 在 `index.html` 引入:
```html
<script src="js/scenes/NewScene.js"></script>
```

3. 在 `main.js` 注册:
```javascript
scene: [BootScene, PreloadScene, MenuScene, GameScene, NewScene]
```

### 添加新的游戏对象

1. 在 `AssetsConfig.js` 添加资源:
```javascript
NEW_OBJECT: {
    key: 'new-object',
    file: 'new-object.png',
    description: '新对象'
}
```

2. 在 `GameplayConfig.js` 添加参数:
```javascript
NEW_OBJECT: {
    WIDTH: 50,
    HEIGHT: 50,
    SPEED: 100
}
```

3. 在场景中创建:
```javascript
const config = GameplayConfig.NEW_OBJECT;
this.newObject = this.add.image(x, y, 'new-object');
this.newObject.setDisplaySize(config.WIDTH, config.HEIGHT);
```

### 添加新的游戏机制

示例：添加道具系统

1. 定义事件:
```javascript
// 在 EventManager.js 的 GameEvents 中添加
ITEM_COLLECTED: 'item:collected',
ITEM_SPAWNED: 'item:spawned'
```

2. 添加配置:
```javascript
// GameplayConfig.js
ITEMS: {
    SPAWN_INTERVAL: 5000,    // 生成间隔
    TYPES: {
        COIN: { score: 5 },
        SLOW: { duration: 3000 }
    }
}
```

3. 实现逻辑:
```javascript
// 监听事件
EventManager.on(GameEvents.ITEM_COLLECTED, (itemType) => {
    const config = GameplayConfig.ITEMS.TYPES[itemType];
    // 处理道具效果
});

// 触发事件
EventManager.emit(GameEvents.ITEM_COLLECTED, 'COIN');
```

### 调试技巧

1. **监听所有事件**:
```javascript
// 在控制台执行
const originalEmit = EventManager.emit;
EventManager.emit = function(event, ...args) {
    console.log('Event:', event, args);
    return originalEmit.call(this, event, ...args);
};
```

2. **显示游戏状态**:
```javascript
// 在 GameScene.update 中添加
if (this.debugText) {
    this.debugText.setText(`State: ${this.gameState}\nScore: ${this.score}`);
}
```

3. **Phaser Debug 模式**:
```javascript
// main.js 配置中添加
physics: {
    default: 'arcade',
    arcade: { debug: true }
}
```

---

## 性能优化建议

1. **对象池**: 对于频繁创建销毁的对象（如雪花），使用对象池
2. **纹理图集**: 将小图片合并为图集减少draw call
3. **事件清理**: 场景销毁时移除事件监听
4. **Tween 管理**: 避免创建过多同时运行的 tween

---

## 已知限制

1. 游戏对象类 (`js/objects/`) 目前未使用，逻辑直接在场景中实现
2. UI组件类 (`js/ui/`) 目前未使用
3. 不支持横屏模式
4. 音频需要用户首次交互后才能播放（浏览器限制）
