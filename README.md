# 棍兵 (Stick Samurai) - Phaser 3 版本

基于 Construct 2 导出项目重构的 Phaser 3 休闲闯关游戏。

## 游戏玩法

- 按住屏幕/鼠标，棍子会向上伸长
- 松开后棍子倒下，士兵会走过棍子到达下一个平台
- 棍子太短或太长都会导致士兵掉落，游戏结束
- 每成功跨越一个平台得1分

## 项目结构

```
修改后的源码/
├── index.html                 # 游戏入口页面
├── css/
│   └── style.css             # 页面样式
├── js/
│   ├── main.js               # Phaser 配置和游戏启动
│   ├── config/               # 【配置文件目录 - 策划/美术修改这里】
│   │   ├── AssetsConfig.js   # 美术资源配置
│   │   ├── LayoutConfig.js   # UI布局配置
│   │   └── GameplayConfig.js # 游戏玩法配置
│   ├── scenes/               # 场景文件
│   │   ├── BootScene.js      # 启动场景
│   │   ├── PreloadScene.js   # 资源加载场景
│   │   ├── MenuScene.js      # 主菜单场景
│   │   └── GameScene.js      # 游戏主场景
│   ├── objects/              # 游戏对象（暂未使用独立类）
│   │   ├── Platform.js
│   │   ├── Soldier.js
│   │   ├── Stick.js
│   │   └── Snow.js
│   ├── ui/                   # UI组件（暂未使用独立类）
│   │   ├── Button.js
│   │   └── ScoreDisplay.js
│   └── utils/                # 工具类
│       ├── Constants.js      # 全局常量（旧版，保留兼容）
│       ├── StorageManager.js # 本地存储管理
│       └── EventManager.js   # 事件管理系统
└── assets/
    ├── images/               # 图片资源
    └── audio/                # 音频资源
```

## 配置文件说明

### 1. AssetsConfig.js - 美术资源配置

**用途**: 管理所有图片和音频资源

**适用人员**: 美术

**修改场景**:
- 替换游戏图片
- 添加新的图片资源
- 修改精灵表帧配置
- 添加新的音效

**配置示例**:
```javascript
// 修改士兵精灵表的帧尺寸
SOLDIER: {
    key: 'soldier',
    file: 'soldier-sheet0.png',
    isSprite: true,
    frameConfig: {
        frameWidth: 80,   // 修改这里改变帧宽度
        frameHeight: 108  // 修改这里改变帧高度
    }
}

// 添加新的图片资源
NEW_IMAGE: {
    key: 'new-image',           // 代码中引用的key
    file: 'new-image.png',      // 文件名（放在assets/images/下）
    description: '新图片描述'
}
```

---

### 2. LayoutConfig.js - UI布局配置

**用途**: 管理所有UI元素的位置和样式

**适用人员**: 策划、美术

**修改场景**:
- 调整按钮位置
- 修改分数显示位置
- 调整游戏结束界面布局
- 修改文字样式

**配置示例**:
```javascript
// 修改开始按钮位置和动画
PLAY_BUTTON: {
    x: 360,           // X坐标（屏幕宽度720，360为居中）
    y: 760,           // Y坐标
    scale: 1,         // 缩放
    animation: {
        type: 'bounce',    // 动画类型: bounce(弹跳), pulse(脉冲), none(无)
        amplitude: 15,     // 振幅（像素）
        duration: 500      // 动画周期（毫秒）
    }
}

// 修改分数显示
SCORE: {
    x: 360,
    y: 180,
    fontSize: 72,
    fontColor: '#ffffff',
    strokeColor: '#000000',
    strokeThickness: 6
}
```

**辅助方法**:
```javascript
LayoutConfig.getCenterX()      // 获取屏幕中心X (360)
LayoutConfig.getCenterY()      // 获取屏幕中心Y (640)
LayoutConfig.getXByPercent(50) // 按百分比获取X坐标
LayoutConfig.getYByPercent(50) // 按百分比获取Y坐标
```

---

### 3. GameplayConfig.js - 游戏玩法配置

**用途**: 管理所有游戏数值参数

**适用人员**: 策划

**修改场景**:
- 调整游戏难度
- 修改角色移动速度
- 调整平台生成参数
- 启用动态难度

**配置示例**:
```javascript
// 士兵参数
SOLDIER: {
    WIDTH: 80,
    HEIGHT: 108,
    WALK_SPEED: 500,      // 行走速度（像素/秒）
    FALL_SPEED: 2100,     // 下落加速度
    IDLE_FRAME_RATE: 10,  // 站立动画帧率
    WALK_FRAME_RATE: 10   // 行走动画帧率
}

// 棍子参数
STICK: {
    WIDTH: 20,
    MAX_HEIGHT: 800,       // 最大长度
    GROW_SPEED: 700,       // 伸长速度（像素/秒）
    ROTATE_SPEED: 300      // 旋转速度（度/秒）
}

// 平台参数
PLATFORM: {
    MIN_WIDTH: 40,         // 最小宽度
    MAX_WIDTH: 180,        // 最大宽度
    GAP_MIN: 80,           // 最小间距
    GAP_MAX: 280           // 最大间距
}

// 动态难度（设置 ENABLED: true 启用）
DIFFICULTY: {
    ENABLED: false,
    PLATFORM_WIDTH_DECREASE_PER_SCORE: 2,  // 每得1分，平台宽度减少
    GAP_INCREASE_PER_SCORE: 5              // 每得1分，间距增加
}
```

**难度调整建议**:
| 目标 | 调整方法 |
|-----|---------|
| 降低难度 | 增大 `MAX_WIDTH`、减小 `GAP_MAX`、降低 `GROW_SPEED` |
| 提高难度 | 减小 `MIN_WIDTH`、增大 `GAP_MIN`、提高 `GROW_SPEED` |

---

### 4. EventManager.js - 事件管理系统

**用途**: 模块间解耦通信

**适用人员**: 程序

**使用示例**:
```javascript
// 订阅事件
EventManager.on(GameEvents.SCORE_CHANGED, (score) => {
    console.log('分数变化:', score);
});

// 发布事件
EventManager.emit(GameEvents.SCORE_CHANGED, 100);

// 取消订阅
const subscription = EventManager.on('event', handler);
subscription.remove();
```

**预定义事件**:
| 事件名 | 说明 | 参数 |
|-------|------|-----|
| `GAME_START` | 游戏开始 | 无 |
| `GAME_OVER` | 游戏结束 | `{score, isNewHighScore}` |
| `SCORE_CHANGED` | 分数变化 | `score` |
| `HIGH_SCORE_UPDATED` | 高分更新 | `score` |
| `PLAYER_WALK_START` | 玩家开始行走 | 无 |
| `PLAYER_FALL` | 玩家掉落 | 无 |
| `STICK_GROW_START` | 棍子开始伸长 | 无 |
| `STICK_LANDED` | 棍子落地 | 无 |
| `PLATFORM_CREATED` | 新平台创建 | `{width, gap}` |

---

## 场景流程

```
BootScene → PreloadScene → MenuScene ⇄ GameScene
   ↓            ↓            ↓           ↓
 初始化      加载资源     主菜单      游戏循环
```

### BootScene
- 初始化全局数据
- 从 localStorage 读取高分和设置

### PreloadScene
- 显示加载进度条
- 加载所有图片和音频资源
- 创建动画配置

### MenuScene
- 显示游戏Logo和装饰
- 开始按钮（点击进入游戏）
- 音效/音乐开关
- 高分显示
- 雪花特效

### GameScene
- 游戏主循环
- 状态机管理游戏流程
- 处理用户输入
- 碰撞检测
- 分数计算

---

## 游戏状态机

GameScene 使用状态机管理游戏流程：

| 状态 | 说明 |
|-----|------|
| `SLIDE_PLATFORM_LEFT` | 平台滑入动画 |
| `READ_MOUSE` | 等待用户输入，棍子可伸长 |
| `BRIDGE_FALLING` | 棍子旋转下落 |
| `PLAYER_WALK_BRIDGE` | 士兵过桥 |
| `PLAYER_GOOD_WALK` | 成功到达平台 |
| `GAME_OVER` | 游戏结束 |

---

## 本地运行

1. 启动本地服务器：
```bash
cd 修改后的源码
python3 -m http.server 8888
```

2. 打开浏览器访问：`http://localhost:8888`

---

## 添加新功能指南

### 添加新的UI元素

1. 在 `AssetsConfig.js` 添加图片资源
2. 在 `LayoutConfig.js` 添加位置配置
3. 在对应场景中创建元素

### 添加新的音效

1. 将音频文件放入 `assets/audio/`（需要 .ogg 和 .m4a 格式）
2. 在 `AssetsConfig.js` 的 `AUDIO` 中添加配置

### 添加新的游戏机制

1. 在 `GameplayConfig.js` 添加相关参数
2. 在 `GameEvents` 中定义新事件
3. 在 `GameScene.js` 中实现逻辑
4. 使用 `EventManager` 进行模块通信

---

## 技术参数

| 参数 | 值 |
|-----|-----|
| 游戏引擎 | Phaser 3.70.0 |
| 画布尺寸 | 720 x 1280 (竖屏) |
| 缩放模式 | FIT (适应屏幕) |
| 渲染器 | Canvas / WebGL 自动选择 |

---

## 注意事项

1. **图片替换**: 保持原文件名和尺寸，直接覆盖 `assets/images/` 下的文件
2. **音频格式**: 需要同时提供 `.ogg` 和 `.m4a` 格式以支持所有浏览器
3. **精灵表**: 修改精灵表时需要同步更新 `AssetsConfig.js` 中的 `frameConfig`
4. **坐标系**: 原点在左上角，X向右为正，Y向下为正
