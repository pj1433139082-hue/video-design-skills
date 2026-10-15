# 数据可视化类 · 默认动效组合

> 一致性优先：规整的图表节奏、可预期转场。不强加变化。

| 组件 | 用途 | 默认参数 |
|------|------|---------|
| `AnimatedNumber` | 数字滚动 | `durationFrames=30` |
| `BarGrowth` / `AnimatedBarChart` | 柱条生长 / 完整柱状图 | `durationFrames=30`, 每条延迟 0.3s |
| `FadeTransition` | 场景转场 | `durationFrames=10` |
| `FadeEntrance` | 图表入场 | `durationFrames=20` |
| `CaptionLayer` | 整句字幕 | `highlightMode="line"` |

## 纪律

- 数据必须真实（不编造）；占位符需清晰标注
- 图表动画确定性（无随机）
- 数据首屏全可见优先，不强加"变化感"

## 背景与文字（可叠加）

- 背景：`GridBackground`（网格数据感）/ `AuroraBackground`（优雅）
- 标题：`BlurIn` / `KineticText`（数据大标题）

## 预设设计系统（video-design-presets.md 选）

数据可视化推荐：**② Linear 精确风**（克制精确）/ **⑤ Supabase 代码风**（数据面板感）
