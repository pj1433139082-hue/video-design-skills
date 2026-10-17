# 口播字幕类 · 默认动效组合

> 从总动效库（`remotion-shared/motion-library/`，工作副本 `工作台/视频/_动效库/`）挑选。具体视频可覆盖参数，但组件名按此清单。

## 必用

| 组件 | 用途 | 默认参数 |
|------|------|---------|
| `CaptionLayer` | 词级高亮字幕层（核心） | `highlightMode="word"`, `switchEveryMs=1200` |
| `SpringEntrance` | 每场景主体入场 | `durationFrames=20`, spring `{damping:10,stiffness:80}` |
| `SceneRenderer` / `SceneTransitionSeries` | 数据/要点/对比/开场/收尾场景卡组装 + 卡间 crossfade | cut.type 由 DESIGN §8.2 场景卡编列表驱动（stat/callout/comparison/hero/end） |

## 转场

| 场景类型 | 组件 | 备注 |
|---------|------|------|
| 普通换场 | `FadeTransition` | `durationFrames=10` |
| 重点/转折句 | `PunchInTransition` | `durationFrames=12`, `maxScale=1.08` |
| 开场/结尾 | `FadeEntrance` | `durationFrames=20` |
| 进阶：高级感换场 | `WipeTransition` / `CurtainTransition` | 从进阶转场库选 |

## 背景（可叠加，从 backgrounds.tsx）

| 背景 | 用法 | 适合调性 |
|------|------|---------|
| `GridBackground` | 科技网格底 | 科技/极简 |
| `AuroraBackground` | 极光渐变漂移 | 优雅/叙事 |
| `ParticleField` | 粒子场 | 创意/3D 感 |
| `NoiseOverlay` | 噪点颗粒 | 复古/氛围 |

## 文字动效（口播强调句）

- `KineticText`：大标题逐字弹入（开场/结尾）
- `TypewriterText`：逐字显示（强调某句）
- `BlurIn`：模糊淡入（标题高级感）

## 预设设计系统（video-design-presets.md 选）

口播类推荐：**① Framer 动感风**（竖屏口播科技感）/ **⑤ Supabase 代码风**（知识区）

## 导入示例

```tsx
import { CaptionLayer, SpringEntrance, FadeTransition, PunchInTransition } from "../../_动效库";
```

## 纪律

- 字幕是唯一时间轴：画面/转场以字幕句首 `startMs` 为锚点
- 不全程同一种转场（至少两种交替）
- 只动 transform/opacity，禁 `Math.random`
