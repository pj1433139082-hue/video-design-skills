# DESIGN.md — 星屿咖啡 · 口播品牌片（9:16）

> **合成 fixture**：本文件属于 `skills/remotion-build/evals/fixtures/sample-brand-minimal/`，供回归评估当输入用。
> 品牌「星屿咖啡」为虚构名称；以下色值、字体、节奏、场景均为本 fixture 编写，**不来自任何真实品牌或维护者本机素材**。
> 结构参照 `skills/remotion-consult/references/video-design-system-template.md` 与类别模板
> `skills/remotion-shared/categories/voiceover-caption/DESIGN.template.md`，只保留最小必需字段。

## 1. 审美方向
- 定位：晨间手冲咖啡的竖屏口播品牌片；克制、干净、有温度。
- 关键词：清晨 / 手冲 / 当季 / 单一产区
- 禁忌：高饱和渐变铺满全屏、玻璃拟态卡片、emoji 堆叠

## 2. 字幕字体
- caption `Noto Sans SC` / title `Noto Serif SC` / mono `JetBrains Mono`（避开 AI 字体黑名单）
- 画幅基准：1080 宽
- 字号字重底线**不在本文件复制数字**：唯一事实源 = `skills/remotion-build/references/video-quality-metrics.md` §字幕硬阈值
- 高亮模式：`word`（词级）
- 可读性：字幕靠描边 + 半透明垫底保证对比度，不靠放大字号

## 3. 配色
| token | 值 | 用途 |
|-------|-----|------|
| `bg` | `#12100E` | 画面底色 |
| `surface` | `#1E1A16` | 面板 / 垫底 |
| `textPrimary` | `#F5F1EA` | 标题、字幕 |
| `textMuted` | `#9A9086` | mono 标注 |
| `accent` | `#C8791E` | 强调色（标题高亮） |
| `captionActive` | `#C8791E` | 字幕当前高亮词 |
| `captionInactive` | `#F5F1EA` | 字幕未高亮词 |
| `captionBg` | `rgba(0,0,0,0.50)` | 字幕垫底 |
| `captionStroke` | `#000000` | 字幕描边 |

- 字幕对比度 ≥3:1（在实拍/图片背景上靠描边 + 垫底保证）
- 每场景主色分配：句 1 冷调晨光 / 句 2 暖调豆色 / 句 3 accent 强调

## 4. 时间轴节奏
- 画幅 **9:16（1080×1920）**，**30fps**，总时长 **12s（360 帧，3 句）**
- 字幕节奏：中文 4–5 字/秒、句间呼吸 200–400ms、句尾 hold ≥800ms
- 场景基准时长 4s/句；句间转场 1 次
- 时序假设：以上是**起草基准**，最终时长以配音 TTS `ffprobe` 实测为准（build Step 1.5 实测每句时长后重建 srt）

## 5. 画面构图
- 安全区：上下各 ≥120px；字幕区底部居中，`maxLines` 2
- 每场景 ≥2 个视觉元素；主体放视觉主位，禁止把主体塞进左上角当标注
- 分层 z 序：bg（背景动效）→ mid（主体素材）→ fg（前景细节）→ 大字 → 字幕

## 6. 转场动效
- 场景间 `FadeTransition`（10 帧）；主体入场 `SpringEntrance`（20 帧）
- 句 3（行动号召）用 `PunchInTransition`（12 帧）制造记忆点
- 字幕高亮：`switchEveryMs` 1200

## 7. Video Design Tokens（theme.ts）
> 字段契约见 `skills/remotion-shared/video-tokens-spec.md`。本文件只列本片覆盖值（继承类别模板，覆盖差异字段）。

```ts
export const THEME = {
  video: { width: 1080, height: 1920, fps: 30 },

  colors: {
    bg: "#12100E",
    surface: "#1E1A16",
    textPrimary: "#F5F1EA",
    textMuted: "#9A9086",
    accent: "#C8791E",
    captionActive: "#C8791E",
    captionInactive: "#F5F1EA",
    captionBg: "rgba(0,0,0,0.50)",
    captionStroke: "#000000",
  },

  fonts: {
    caption: { family: "Noto Sans SC", size: 64, lineHeight: 1.4, weight: 700 },
    title:   { family: "Noto Serif SC", size: 96, lineHeight: 1.2, weight: 900 },
    mono:    { family: "JetBrains Mono", size: 28, lineHeight: 1.5, weight: 500 },
    body:    { family: "Noto Sans SC", size: 48, lineHeight: 1.5, weight: 400 },
  },

  captions: {
    switchEveryMs: 1200,
    maxLines: 2,
    safeMarginX: 80,
    safeMarginY: 200,
    highlightMode: "word",
  },

  timing: {
    baseSceneDurationFrames: 120,
    captionHoldMs: 400,
    transitionDurationFrames: 10,
    entranceDurationFrames: 20,
    breathingPauseMs: 200,
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

## 8. 场景蓝图（字幕驱动映射）
| 句 | 字幕 | 时间 | 视觉模式 | 画面与素材层（描述，非文件） | 字体动效 | 转场 | 力度 |
|----|------|------|----------|------------------------------|----------|------|------|
| 1 | 城市的清晨，从一杯手冲开始。 | 0.0–4.0s | 场景图 + 字 | bg-1 晨光窗台 / mid-1 手冲壶 | 字距展开 | `SpringEntrance` | 强 |
| 2 | 星屿咖啡，只选当季单一产区豆。 | 4.0–8.0s | 场景图 + 透明效果层 | bg-2 豆堆 / mid-2 豆特写 / fg-1 mono 产区标注 | mono 标注滚动 | `FadeTransition` | 中 |
| 3 | 现在下单，首杯半价。 | 8.0–12.0s | 纯卡 | bg-3 accent 光斑 / mid-3 咖啡杯 | 扫光 + 缩放 | `PunchInTransition` | 强 |

> 素材 slot 只给描述，本 fixture **不附带任何真实素材文件**；评估时按 slot 描述生成或占位。
> 每句至少一个素材或字体动效在场；抽帧验证素材层 + 字幕层 + 动效。

## 六轴自评
`/* slop: P/H/E/S/R/V 各 1-5，任何 <3 强制修订 */`

| 轴 | 检查 | 分 |
|----|------|----|
| Philosophy | 节奏多样性（不全程均匀） | 4 |
| Hierarchy | 字幕层级刻意 | 4 |
| Execution | tokens 引用 | 4 |
| Specificity | 文案诚实 | 4 |
| Restraint | 克制装饰 | 4 |
| Variety | 场景/转场变化 | 3 |
