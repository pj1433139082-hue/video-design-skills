# 视频类别模板：② 数据可视化类（data-viz）

> 类别模板 = 起点，不是终点。图表数据叙事：数字/柱条生长 + 整句字幕，一致性优先（不强加转场变化）。

## 默认设计系统

- **审美方向**：深色数据面板 + 高饱和图表色 + 大数字聚焦。目标"一眼读懂数据故事"。
- **画幅**：16:9（1920×1080）或 9:16（1080×1920），30fps
- **字幕**：整句（`highlightMode="line"`），Noto Sans SC，底部，maxLines 2
- **配色**：bg 深色 + 数据色板（4-6 色）+ accent 强调；数字高亮
- **节奏**：图表动画 0.3-0.5s/条，数字滚动 1s，句间呼吸 200-400ms
- **转场**：一致性优先——`FadeTransition`（10 帧）+ `FadeEntrance`（20 帧）；不强行加 punch

## 动效组合（motion-list）

| 组件 | 用途 |
|------|------|
| `AnimatedNumber` | 数字滚动（durationFrames=30） |
| `BarGrowth` | 柱条生长（durationFrames=30） |
| `AnimatedBarChart` | 完整柱状图（逐条出现 + 生长） |
| `FadeTransition` | 场景转场 |
| `FadeEntrance` | 图表入场 |
| `CaptionLayer` | 整句字幕（highlightMode="line"） |

## 适用场景
数据报告 / 统计叙事 / 指标解读 / 学术数据可视化。
