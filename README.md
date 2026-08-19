# Aerial Strike: Ammo Economy

飞机大战 / 飞行射击游戏毕业设计项目。项目使用 Phaser 3 和原生 JavaScript ES Modules 开发，包含普通与困难两种模式、敌人波次、Boss 战、弹药经济、黑市商店、升级、护盾和复活等玩法系统。

用户手册与设计说明见 [Final report.pdf](<./Final report.pdf>)。

## 运行方式

因为项目使用 ES Modules，直接用 `file://` 打开 `index.html` 可能无法运行，需要启动一个本地 HTTP 服务器。

### 方式一：Python

```powershell
python -m http.server 8000
```

然后在浏览器打开：

```text
http://localhost:8000
```

### 方式二：Node.js

```powershell
npx serve .
```

根据终端提示打开本地地址即可。

## 操作说明

- `WASD` 或方向键：移动飞机
- `Space`：射击
- 在商店界面点击按钮购买升级或恢复状态

游戏资源通过 CDN 在线加载，运行前请确认网络可以访问 `esm.sh` 和 `rosebud.ai`。

## 项目结构

```text
.
├── config.js                 # 全局配置、敌人、升级和弹药类型
├── index.html                # 页面入口
├── main.js                   # Phaser 游戏初始化
├── entities/
│   ├── Enemy.js
│   ├── Player.js
│   └── Projectile.js
└── scenes/
    ├── GameScene.js
    ├── MenuScene.js
    ├── PreloadScene.js
    └── UIScene.js
```

## 文档

- [Final report.pdf](<./Final report.pdf>)：毕业设计报告 / 用户手册
