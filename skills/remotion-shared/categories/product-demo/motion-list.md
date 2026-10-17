# 产品演示类 · 默认动效组合

> 克制动效：演示核心是产品本身，动效只做揭示和过渡。

| 组件 | 用途 | 默认参数 |
|------|------|---------|
| `SlideUpTransition` | 步骤/功能上滑揭示 | `durationFrames=10` |
| `FadeEntrance` | 截图/主体入场 | `durationFrames=20` |
| `FadeTransition` | 场景转场 | `durationFrames=10` |
| `CaptionLayer` | 整句字幕 | `highlightMode="line"` |
| `SceneRenderer` / `SceneTransitionSeries` | 开场/章节/对比/要点/收尾场景卡组装 + 卡间 crossfade | cut.type 由 DESIGN §8.2 场景卡编列表驱动（hero/section/comparison/callout/end） |

## 纪律

- 产品截图必须真实，不画假 UI chrome
- 步骤节奏一致（3-5s/步），观众可预期
- 字幕不遮挡产品关键界面

## 进阶转场与背景

- 进阶：`CurtainTransition`（发布会开场）/ `WipeTransition`（功能揭示）
- 视差：`ParallaxTransition`（产品与背景层次感）
- 背景：`AuroraBackground`（品牌感）/ `GridBackground`（科技感）

## 预设设计系统（video-design-presets.md 选）

产品演示推荐：**① Framer 动感风**（工作流/技术）/ **③ Stripe 渐变风**（高端产品）
