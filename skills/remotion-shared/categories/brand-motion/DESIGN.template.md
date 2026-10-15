# 视频类别模板：④ 品牌动效类（brand-motion）

> 类别模板 = 起点，不是终点。品牌片/片头：kinetic type + 缩放推近，字体主导，少字幕或无字幕。

## 默认设计系统

- **审美方向**：字体主导（kinetic type）+ 高冲击转场 + 品牌色。目标"3 秒内建立品牌记忆"。
- **画幅**：9:16（1080×1920）或 16:9（1920×1080），30fps
- **字幕**：无或 minimal（品牌 Slogan 大字，非口播字幕）
- **配色**：品牌主色 + 近黑 + 单一高饱和点缀（呼应品牌）
- **节奏**：快节奏（每条字 1-2s），转场 punch-in/scale 密集，memorable-thing 是核心
- **转场**：`PunchInTransition` + `ScaleEntrance` + kinetic type

## 动效组合（motion-list）

| 组件 | 用途 |
|------|------|
| `PunchInTransition` | 推近转场（记忆点） |
| `ScaleEntrance` | 大字缩放入场 |
| `SpringEntrance` | 主体弹性入场 |
| `CutTransition` | 硬切（节奏变化） |

> kinetic type（字体逐字动画）用 `useCurrentFrame` + 逐字 `Sequence` 实现，见 motion-patterns-video.md。

## 适用场景
品牌片 / 片头 / logo reveal / 活动预告 / 高冲击宣传片。
