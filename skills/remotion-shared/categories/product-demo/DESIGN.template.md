# 视频类别模板：③ 产品演示类（product-demo）

> 类别模板 = 起点，不是终点。横屏产品展示/教程：功能逐步揭示 + 整句字幕，克制动效。

## 默认设计系统

- **审美方向**：浅色或品牌色底 + 真实产品界面截图 + 分步揭示。目标"清楚展示产品怎么用"。
- **画幅**：16:9（1920×1080），30fps
- **字幕**：整句（`highlightMode="line"`），底部，maxLines 2，对比度 ≥3:1
- **配色**：品牌色为主，中性灰为辅；截图用真实界面
- **节奏**：每步 3-5s，步骤间 `SlideUpTransition`；主体/截图 `FadeEntrance`
- **转场**：`SlideUpTransition`（上滑）+ `FadeTransition` 交替

## 动效组合（motion-list）

| 组件 | 用途 |
|------|------|
| `SlideUpTransition` | 步骤/功能上滑揭示 |
| `FadeEntrance` | 截图/主体入场 |
| `FadeTransition` | 场景转场 |
| `CaptionLayer` | 整句字幕（highlightMode="line"） |

## 适用场景
产品 demo / 教程解说 / 功能发布会 / 软件使用演示。
