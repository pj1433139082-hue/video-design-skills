# 视频类别模板：① 口播字幕类（voiceover-caption）

> 类别模板 = **起点**，不是终点。具体视频从本模板起稿，consult 阶段按需调整。`motion-list.md` 引用总动效库组件名（`remotion-shared/motion-library/`），build 时从 `工作台/视频/_动效库/` import。

## 默认设计系统（DESIGN.template.md 起稿）

### 审美方向
竖屏口播知识片：深色底 + 单一高饱和强调色 + 词级字幕高亮。目标"信息密度高、画面简洁、字幕即主角"。

### 画幅与节奏
- 画幅：**9:16（1080×1920）**，30fps
- 字幕节奏：中文 4-5 字/秒，句间呼吸 200-400ms，句尾 hold ≥800ms
- 词级高亮 `switchEveryMs` 1200ms

### 字幕风格
- **词级高亮 TikTok 风**（highlightMode: "word"）；**前置条件**：captions 须为 **word 级**（中文预分词，见 `remotion-build/references/captions-guide.md` §七）——中文无空格，句级 captions 在 word 模式会整句同亮（退化）；仅有句级 srt 时**显式降级** `line` 并在 DESIGN/验收记录标注"句级降级"，**不静默**。
- 字幕字体：Noto Sans SC 800，64px（1080 宽基准；字号字重底线以 `remotion-build/references/video-quality-metrics.md` §字幕硬阈值为准），白 + 描边
- 高亮色 = 强调色（默认 volt 黄绿 `#AFFF00` 或珊瑚红）
- 字幕区：底部居中，safeArea 上下 ≥120px，maxLines 2
- **场景卡（T7 收口）**：数据句/要点句/对比句/开场/收尾优先用场景卡（stat/kpi/callout/comparison/hero/end），cut.type 列于 DESIGN §8.2「场景卡编列表」；卡间用 `SceneTransitionSeries` crossfade，**禁相邻 Sequence 硬接**（防硬切/渐入空白）。

### 配色（默认色板）
| token | 值 |
|-------|-----|
| bg | `#0f0f1a` |
| surface | `#1a1a2e` |
| textPrimary | `#ffffff` |
| textMuted | `#9a9ab0` |
| accent（高亮） | `#39E508` 或类别主题色 |
| captionInactive | `#ffffff` |
| captionStroke | `rgba(0,0,0,0.6)` |

### 转场动效
- 默认：场景间 `FadeTransition`（10 帧）+ 主体 `SpringEntrance`（20 帧）
- 重点句/转折句：`PunchInTransition`（12 帧）制造记忆点

### 构图
- 主体/素材居画面中上部（titleRegion），字幕压底部（captionRegion）
- hero 素材构图留负空间，避免字幕压住关键信息

## 场景蓝图示例（字幕驱动映射）

| 句 | 字幕 | 画面 | 素材 | 转场 |
|----|------|------|------|------|
| 1 | 开场句 | 标题 + 主体 | 无/背景图 | SpringEntrance |
| 2 | 观点句 | 主体 + 关键词 | 背景图 | FadeTransition |
| 3 | 转折句 | 强调 + punch | 背景图 | PunchInTransition |
| … | … | … | … | … |

## 适用场景
知识区口播 / 观点短视频 / 课程预告 / 竖屏 feed 广告。
