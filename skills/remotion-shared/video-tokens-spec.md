# 视频 Design Tokens 规范（Video Tokens Spec）

> remotion-consult 与 remotion-build 的共同接口。网页版用 CSS 变量，视频版用 **TypeScript 常量对象（tokens.ts）**。原则与 `design-shared/design-tokens-spec.md` 一致：语义命名、禁止 inline 硬编码、分层（原始值 → 语义 token → 场景 token）。

## 一、tokens.ts 契约（完整字段）

```ts
// theme.ts —— 语义命名，等价 web 的 --color-* / --space-*
export const THEME = {
  video: { width: 1080, height: 1920, fps: 30 },

  colors: {
    bg: "#0f0f1a",            // 背景主色
    surface: "#1a1a2e",       // 面板/卡片底色
    textPrimary: "#ffffff",   // 主文字
    textMuted: "#9a9ab0",     // 弱化文字
    accent: "#e94560",        // 强调色（标题/高亮）
    captionActive: "#39E508", // 字幕当前高亮词色
    captionInactive: "#ffffff", // 字幕未高亮词色
    captionBg: "rgba(0,0,0,0.5)", // 字幕背景（可无）
    captionStroke: "#000000", // 字幕描边色（可读性）
  },

  fonts: {
    // 字号字重底线以 remotion-build/references/video-quality-metrics.md §字幕硬阈值为准（唯一事实源）；
    // 下列默认值已对齐底线，照抄本契约即达标；改底线只改 metrics，不在此复制阈值。
    caption: { family: "Noto Sans SC", size: 64, lineHeight: 1.4, weight: 800 },
    title:   { family: "Noto Sans SC", size: 96, lineHeight: 1.2, weight: 900 },
    mono:    { family: "JetBrains Mono", size: 44, lineHeight: 1.5, weight: 700 }, // 数据标签，必填
    body:    { family: "Noto Sans SC", size: 48, lineHeight: 1.5, weight: 400 },  // 正文，可选
  },

  captions: {
    switchEveryMs: 1200,      // 词级高亮每页停留 ms（createTikTokStyleCaptions 参数）
    maxLines: 2,              // 字幕最大行数
    safeMarginX: 80,          // 字幕区水平安全边距
    safeMarginY: 200,         // 字幕区底部距边距
    highlightMode: "word",    // "word" | "line" | "none"
  },

  timing: {
    baseSceneDurationFrames: 90,   // 单场景基准时长（3s @30fps）
    captionHoldMs: 400,            // 句间呼吸停顿
    transitionDurationFrames: 10,  // 转场帧数
    entranceDurationFrames: 20,    // 入场帧数
    breathingPauseMs: 200,         // 句内词间微顿
  },

  motion: {
    easing: { in: "ease-in", out: "ease-out", inOut: "ease-in-out" },
    spring: { damping: 10, stiffness: 80, mass: 1 },
  },

  layout: {
    safeArea: { top: 120, bottom: 120, left: 80, right: 80 },
    captionRegion: { x: 80, y: 1500, width: 920, maxLines: 2, lineHeight: 1.4 },
    titleRegion: { x: 80, y: 600, width: 920 },
  },
} as const;
```

## 二、分层原则

1. **原始值 → 语义 token → 场景 token**：`#e94560`（原始）→ `accent`（语义）→ 具体场景里标注"标题高亮用 accent"。
2. 视频项目里**禁止 inline 色值/字体/时长**，一律 `THEME.xxx` 引用。
3. 每个具体视频的 `theme.ts` 从类别模板继承，覆盖差异字段，**不推倒重写**。

## 三、视频可读性硬约束

- **字幕对比度 ≥ 3:1**（在实拍/图片背景上，用描边 + 背景色保证）。
- **字幕最小显示时长 ≥ 1s**（短句也要保证可读）。
- **竖屏安全区**：上下各留 ≥ 120px（1080 宽基准），字幕不贴边。
- **SEIZURE 红线**：避免 > 3Hz 高频闪烁/快速色变，防癫痫风险。
- **量化误差**：fps 与 srt 毫秒精度转换误差 ≤ 1 帧为可接受；用 `Math.round` 而非 `floor` 防句首差 1 帧。

## 四、暗/亮场景（可选）

视频可有两套色板（明暗场景切换），挂 `THEME.dark` / `THEME.light` 或按场景段选择。策略沿用 web 版：暗色不纯白文字（用 ~#E0E0E0）、强调色降饱和 10-20%。

## 五、与 design-tokens-spec 的关系

web 的 `--color-*` / `--space-*` / `--ease-*` / `--duration-*` 语义在此保留（colors/fonts/motion/timing），新增视频特有的 `timing`（帧时长节奏）、`layout`（画面构图安全区）、`captions`（字幕高亮参数）三维。

## 六、场景卡 tokens（T7 收口）

场景卡（`motion-library/scene-cards*.tsx`）的颜色/字体/间距**一律走 THEME tokens，禁写死**；卡组件以 props 接收（`SceneCardTheme`），由 `tokens.ts` 传入：

| 场景卡 token | 映射到 THEME | 说明 / 底线 |
|--------------|-------------|------------|
| `card.accent` | `colors.accent` | 卡边框 / 强调数值 / 下划线 |
| `card.surface` | `colors.surface`（半透明化，如 `rgba(surface,0.92)`） | 卡底；与背景对比须保证卡内文字可读 |
| `card.textColor` | `colors.textPrimary` | 卡内主文字 |
| `card.statFont` | `fonts.mono` | 数据数值字体；**≥44px/字重≥700**（metrics 数据 mono 底线） |
| `card.labelFont` | `fonts.caption`（或 title） | 卡说明/标题字体；字号 ≥ 对应底线 |
| `card.radius` / `card.padding` | 新增语义 token（建议 24-28 / 44-72px） | 圆角与内边距，全片统一 |
| `scrim.bgLightness` | §8.1 每场景字段（0-1） | 驱动 `AdaptiveCaptionScrim` 强度（captions-guide §八），不写死 |

- 卡内文字对比度守 metrics 底线（数据 mono 大字 ≥3:1 / 正文 4.5:1）；frame_judge 用卡底有效色核。
- 场景卡选型（用哪张、cut 编排）仍是 consult 设计决策（§8.2 场景卡编列表），tokens 只定"长什么样"，不定"用不用"。
