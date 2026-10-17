# 视频类别模板：② 数据可视化类（data-viz）

> 类别模板 = 起点，不是终点。图表数据叙事：数字/柱条生长 + 逐词字幕（需 word 级 captions），一致性优先（不强加转场变化）。

## 默认设计系统

- **审美方向**：深色数据面板 + 高饱和图表色 + 大数字聚焦。目标"一眼读懂数据故事"。
- **画幅**：16:9（1920×1080）或 9:16（1080×1920），30fps
- **字幕**：默认**逐词**（`highlightMode="word"`，TikTok 风），Noto Sans SC，底部，maxLines 2；**前置条件**：captions 须为 word 级（中文预分词，见 `remotion-build/references/captions-guide.md` §七）；仅有句级 srt 时**显式降级** `line` 并在 DESIGN/验收记录标注"句级降级"，**不静默**
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
| `CaptionLayer` | 逐词字幕（highlightMode="word"，需 word 级 captions；句级 srt 显式降级 line） |

## 适用场景
数据报告 / 统计叙事 / 指标解读 / 学术数据可视化。
