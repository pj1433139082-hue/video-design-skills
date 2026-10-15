# HyperFrames 渲染核指南（remotion-build 可选渲染后端）

> 本技能默认 **Remotion 核**；DESIGN 标注或用户点名才用 **HyperFrames 核**。本文件是 HyperFrames 核的执行规则（验证于 2026-08-17 两个 demo：S1 场景 + S2 翻牌，末帧 9/10）。

## 定位
HeyGen 开源框架（Apache 2.0）——"Write HTML. Render video."，把 HTML/CSS/GSAP/Lottie **确定性**渲染成 MP4。本地渲染免费（不耗 HeyGen credit）。与 Remotion **重合并存**（都"代码→确定性 MP4"），官方有 `/remotion-to-hyperframes` 单向迁移 skill。**同一项目勿混两核。**

## 何时用 HyperFrames 核
- 纯 HTML/GSAP 动效，想更接近网页手感
- 需要内置 `npm run check`（lint + 布局 + 对比度 + 运动，与 frame_judge 互补）
- 用户点名，或 DESIGN 标注
> 复杂镜头卡（翻牌/粒子/3D/orshotcraft 卡）或已有 Remotion 项目 → 仍用 Remotion 核。

## CLI
```bash
npx hyperframes init sleep-demo --example blank --non-interactive  # 建项目（node22+ffmpeg）
cd sleep-demo && npm install
npm run check    # lint + 布局 + 对比度 + 运动（必跑，修完才 render）
npm run render   # → renders/{name}_{ts}.mp4
```
- 本地渲染免费；`npm run dev` 是长驻预览服务器，用 run_in_background，勿前台跑。

## 核心规则（写 index.html 必须遵守）
1. **计时元素**：每个要按时间出现的元素加 `data-start` / `data-duration` / `data-track-index` + `class="clip"`.
2. **同 track 不能重叠**：同一 track 的 clip 时间区间不可重叠（否则 lint `overlapping_clips_same_track` 报错）。叠加层（遮罩/光晕）放**不同 track**。
3. **字体**：自定义字体（Noto Sans SC / JetBrains Mono）要 `@font-face { font-family:...; src: local("..."); }`，否则 lint 报 + 渲染 fallback 错字。系统字体用 `local()` 即可。
4. **GSAP timeline**：必须 `paused: true` + 注册 `window.__timelines["composition-id"]`。
5. **确定性**：禁 `Math.random` / `Date.now` / 网络请求（同 Remotion 纪律）。翻牌乱码等用**固定种子正弦哈希**。

## 动效库来源（等价 shotcraft：HyperFrames 自带 registry，已实测存在 2026-08-17）
**有得借鉴，不用从参考站爬**——HyperFrames 官方仓库即动效库：
- **registry/blocks**（154 个可复用 HTML 动效块）：`ai-chat-reveal`/`cinematic-zoom`/`camera-dolly-zoom`/`bar-chart-race`/`code-morph`/`code-particle-assemble`/`apple-count`/`beat-freeze-cut` 等（`gh api repos/heygen-com/hyperframes/contents/registry/blocks` 列出）
- **registry/examples**（14 个完整作品样例）：`swiss-grid`/`vignelli`/`airbnb-deck`/`kinetic-type`/`motion-blur`/`product-promo`/`warm-grain` 等（设计风格参照，对应 video-shotcraft 的 examples）
- 用法：从 blocks/examples copy HTML+CSS 片段 → 改品牌色/文案/时长 → 贴进 `index.html` 组成场景（等价 Remotion 真 copy shotcraft 卡）
- 安装动效库：`npx hyperframes skills update` 装核心 skill，`npx hyperframes init --example swiss-grid` 建带风格 demo；registry.json 是目录索引

## 素材/BGM/字幕/验收（全复用，与渲染核无关）
- 素材：mmx 生图（minimax 无水印首选）→ `public`/`assets/`，HTML 里 `src="assets/x.jpg"`（比 Remotion `staticFile()` 少一层）
- 字幕：tts_gen + rebuild_srt 一样出 fps 帧区间 → 转秒，填 `data-duration`
- 验收：抽帧 → frame_judge / vision_check / 音画同步全复用（抽成 MP4 后与 Remotion 产物无异）
- 配置：`hyperframes.json` 的 `media.autoProxy` + assets 目录

## 迁移
- 官方 skill `/remotion-to-hyperframes`：Remotion(React) → HyperFrames(HTML) 单向迁移
- React `useCurrentFrame/interpolate` → GSAP timeline；`Sequence` → `data-start/duration` + `class=clip`
