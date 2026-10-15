# HyperFrames 动效库分类速查（等价 video-shotcraft / shotcraft 镜头卡，实测 2026-08-17）

> HyperFrames 核（`remotion-build Step 0` 第五维=HyperFrames 时）的动效来源。**它自带官方 registry（不用爬参考站）**：`registry/blocks/` = 相机逐格动效块（154 个，等价 shotcraft 单卡），`registry/examples/` = 完整作品（14 个，等价 shotcraft template）。
> 列出：`gh api repos/heygen-com/hyperframes/contents/registry/blocks --jq '.[].name'` / 同路径 examples。
> **动效块结构**：每 block = 单一 `.html`（+可选 assets）+ `registry-item.json`；用 `data-composition-variables` 定义的参数（boardText/flipDuration 等）+ `data-start/duration` 接入主 `index.html`——**参数化组件，等价 shotcraft 卡但带可视化参数**（可整体 copy 进 composition，改品牌色/文案/时长/变量）。

## 一、blocks 分类速查（154 个，按用途）

| 类 | 代表块 | 用在哪（对应 shotcraft 类） |
|----|--------|-----------|
| **运镜/镜头** | `cinematic-zoom` `camera-dolly-zoom` `rack-focus` `whip-pan` `freeze-frame-dressing` | 空间运镜感（≈camera） |
| **转场** | `transitions-{3d,blur,cover,dissolve,distortion,grid,light,mechanical,push,radial,scale,destruction,other}` `cross-warp-morph` `domain-warp-dissolve` `ridged-burn` `glitch` | 场景切换（≈transition） |
| **文字动效** | `split-flap-board`（**翻牌**，S2 官方成品版）`hw-title` `hw-text-cloud` `yt-prism-title` `weight-wave` `flash-through-white` `editorial-flash-overlay` `mk-mask-reveal` | 大字记忆点/标题（≈typography） |
| **下三分之一/字幕卡** | `lower-third-bild` `lt-{accent-underline,bold-block,clean-bar,color-block,dark-card,kicker-name,mask-reveal,neon-border,side-rule,soft-pill,stack-bars}` | 名字/标题/数据标注卡（字幕区） |
| **数据可视化** | `data-chart` `bar-chart-race` `mk-{line-graph,progress-stat,specs-list}` `oscilloscope-trace` `apple-money-count` | 数据增长/统计（≈data） |
| **UI/交互演示** | `macos-notification` `ios26-liquid-glass` `liquid-glass-{context-menu,media-controls,notification,widgets}` `macos-tahoe-liquid-glass` `share-sheet-carousel` `thread-message-stack` `reddit-post` `x-post` `yt-comment-card` `spotify-card` `ai-chat-reveal` `chatgpt-exchange` `claude-exchange` `notification-cascade` `app-showcase` | 产品 UI / APP 界面展示（≈ui-entrance/interaction） |
| **Logo/开场/收尾** | `heygen-avatar-promo-card` `yt-logo-intro` `logo-outro` `blue-sweater-intro-video` `mk-background` `mk-callout-highlight` | 片头/片尾/品牌（≈opening/outro） |
| **VFX/特效** | `vfx-{anamorphic-flare,iphone-device,liquid-background,liquid-glass,magnetic,portal,shatter,text-cursor}` `cosmic-orb` `spiral-galaxy` `swirl-vortex` `gravitational-lens` `thermal-distortion` `sdf-iris` `halftone-field` `organic-light-leak-overlay` `light-leak` `gallery-tunnel` `ripple-waves` `chromatic-radial-split` | 氛围/光效/粒子/毛刺（≈effects） |
| **代码展示** | `code-{morph,diff,highlight,3d-extrude,particle-assemble,scroll,shader-dissolve,typing}` `code-snippet-*`（20 个主题终端）+ `flowchart` `flowchart-vertical` | 代码/开发说明（product-demo 用） |
| **地图** | `world-map` `us-map{-flow,-hex,-bubble}` `spain-map` `nyc-paris-flight` | 地域数据（data-viz） |
| **手写/涂鸦** | `hw-{frame,path-text,pipeline,scribble-transition,text-cloud}` | 手写/涂鸦转场 |

## 二、examples（14 个完整作品，整片风格参考 = shotcraft template）

`airbnb-deck` `decision-tree` `kinetic-type` `motion-blur` `nyt-graph` `play-mode` `product-promo` `slideshow-demo` `startup-pitch` `swiss-grid` `vignelli` `vscode-theme-visualizer` `warm-grain`
- 结构：`index.html`（主）+ `compositions/`（多场景子组合），是"完整作品模板"——想要某类整片风格（锥聚/swiss-grid 极简 / vignelli 编辑感 / warm-grain 胶片颗粒）直接 `npx hyperframes init --example swiss-grid` 建 demo 再改。

## 三、怎么用（照 shotcraft 真 copy 模式）

1. **挑块**：需求 → 上表分类 → `gh api .../blocks` 确认块名存在
2. **copy**：拉该块 `.html`（+assets）→ 贴进项目 `compositions/` 或用 `data-composition-src` 子组合引用
3. **适配**：改 `data-composition-variables`（文案/速度/时长）+ 品牌色 + `data-start/duration/track-index`
4. **联动/联动**：每块是参数化组件，可像 shotcraft 卡一样当主画面或透明效果层叠加（遵守 video-shots-spec 视觉模式：透明层可叠、完整画面不叠）
5. **验证**：`npm run check`（lint+布局+对比度），改完必跑再 render

> ⚠️ 区别：HyperFrames blocks 是**网页视觉块**（HTML 结构），不是 Remotion 的"镜头运镜/卡点/粒子相机卡"——动效语言更接近网页。真用 HyperFrames 核时动效来源以本 registry 为主（不硬套 Remotion shotcraft 卡名）。
