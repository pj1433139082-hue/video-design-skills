# 品牌动效类 · 默认动效组合

> 高冲击：转场语言要变化，memorable-thing 是判据。避免全程同一转场。

| 组件 | 用途 | 默认参数 |
|------|------|---------|
| `PunchInTransition` | 推近转场（记忆点） | `durationFrames=12`, `maxScale=1.08` |
| `ScaleEntrance` | 大字缩放入场 | `durationFrames=20` |
| `SpringEntrance` | 主体弹性入场 | `durationFrames=20` |
| `CutTransition` | 硬切（节奏变化） | — |

## kinetic type（字体主导）

- 逐字用 `<Sequence from={i * perCharFrames}>` + `interpolate` 控制每字入场
- 直接组件：`KineticText`（逐字弹入）/ `LineReveal`（逐行揭示）
- 只动 transform/opacity，禁随机

## 背景（品牌冲击）

- `ParticleField`（粒子场）/ `AuroraBackground`（极光）/ `NoiseOverlay`（噪点氛围）
- `GridBackground`（科技网格）

## 纪律

- 至少两种转场交替，不全程 punch-in
- 记忆点时刻（memorable-thing）必须有，否则视频无辨识度
- 不空泛（无"欢迎观看"式标语）

## 预设设计系统（video-design-presets.md 选）

品牌动效推荐：**④ MiniMax 霓虹风**（高冲击）/ **③ Stripe 渐变风**（优雅）/ **⑥ Vercel 黑白风**（极简）
