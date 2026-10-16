---
name: remotion-consult
description: 视频需求澄清 → 视频设计系统文档（DESIGN.md）的完整咨询工作流。只要用户在谈视频的视觉方向、字幕风格、配色、字体、节奏、转场、动效、画幅、视频设计、DESIGN.md、视频提案、改版方向，就必须使用本技能——即使没明说"设计系统"。产出视频版七段设计系统 + Video Design Tokens + SAFE/RISK 提案 + 关键帧预览。目标是定下视频设计方向，不直接生成最终视频（生成交给 remotion-build）。
---

# remotion-consult — 视频需求 → 视频设计系统

把"这条视频怎么做"从灵感变成可落地的工程规范：通过澄清、研究、提案，最终产出 **DESIGN.md**（视频设计系统文档，含 tokens.ts 契约），供 `remotion-build` 直接套用。

## 入口分类（遇到"做视频"先定流程，别直接开问）

用户说"做视频/出条片子"但没说类别时，**先花一个问题定流程归属**（consult/build/video-shotcraft 三个都会触发"做视频"，必须显式分流）：

| 用户意图 | 走哪条 |
|---------|--------|
| 做/改任何视频（口播、数据、产品演示、品牌动效、科普、图文轮播） | **统一走本流程**（consult → build）；动效从 总动效库 + shotcraft 镜头卡 两个源挑 |
| **点名**要用 video-shotcraft 模板（Ink Press）/ 自主自由创作 / 共同创作 | 按其自身流程 Skill 触发 `video-shotcraft`（用户显式选择，非自动路由） |
| 已有 DESIGN.md / 参考视频 / 明确改版 | **本流程**，Phase 0 预检直接进 |

> 分类问句："点名用 video-shotcraft 模板/自主/共同创作了吗？没有 → 统一走 consult→build，镜头卡从 shotcraft 当动效库借鉴（不强制每句选卡）。"

## 何时用

- 做/改一条视频（口播、数据可视化、产品演示、品牌动效）。
- 定视频设计方向：画幅、字幕风格、配色、字体、节奏、转场、动效。
- 要"视频设计系统"、"video design tokens"、"DESIGN.md"。
- 需求模糊（"帮我做条视频"），需要先澄清再动手。

## 核心心智

1. **先方向后细节**：先确定审美/字幕/节奏系统，再谈画面实现。
2. **不套模板**：目标是产出"这条视频独有的节奏指纹"，不是从模板库挑一个。
3. **可执行优先**：DESIGN.md 必须具体到能直接写 `tokens.ts` 与场景蓝图，不能停在"高级一点"。
4. **诚实**：字幕文案不编造数据/事实。

## 流程（按顺序执行）

### Phase 0 — 预检

- 检查 `工作台/视频/{slug}/` 是否已有 `DESIGN.md` / 口播稿 / captions.srt；有就作为基线，不推翻重来。
- **检查同品牌跨域设计资产**（用户"先网页再视频"工作流）：`工作台/设计测试/{品牌}/DESIGN.md`（网页版）或 `资料库/AI工具/设计系统库/{品牌}-DESIGN.md` → 有则其配色/字体/情绪是**品牌 DNA 基线**，视频版继承演进不重造（也是 Phase 3 设计系统一致性检查的输入）。
- 检查品牌约束（项目 README、已有视觉资产、参考视频）。

### Phase 1 — 澄清（强制，别跳）

用 AskUserQuestion 一次性澄清，**最少覆盖 9 项**（一次别超 6 个问题，可分批）。**前两项是风格来源，必问不许跳**（用户可"自动挑"快速过，但必须确认）：

1. **风格来源（第一步必问）**：自由设计 / 参考站自己挑（从 `video-real-library.md` 展示候选让用户选）/ 参考站自动挑（用户给主题自动挑）/ 用户提供参考（URL/截图，**最优先**）。
2. **参考选择（三维度互补，何时用什么）**：
   - **品牌 DESIGN.md**（设计系统库 `资料库/AI工具/设计系统库/{品牌}-DESIGN.md` 或自己项目 DESIGN.md）→ 设计 tokens 基线（配色/字体/间距），**品牌延续/改版**时用，系统不重造。
   - **网页 HTML**（video-real-library / real-design-library 参考站）→ 排版/视觉实例（布局/层次/构图），**想要某种视觉结构**时用。
   - **视频**（video-real-library 动效源 / 用户给的视频）→ 动效/节奏/字幕风，**想要某种运动语言**时用。
   - **互补**：DESIGN.md 定系统 → HTML 给实例 → 视频给动效，三者合成完整方向。用户给的参考最优先。选中参考用 **opencli（保持登录态）** 抓真实字体/色值/节奏，Phase 4 忠实继承。
3. **视频是什么**：一句话定位 + 给谁看 + 发布平台（抖音/B站/学术/内部——决定画幅与节奏基准）。
4. **类别锚定**：`remotion-shared/categories/` 四类之一（voiceover-caption/data-viz/product-demo/brand-motion），或自定义。
5. **画幅与时长**：9:16 竖屏 / 16:9 横屏 / 1:1；目标时长；是否系列化（系列=节奏必须可复用）。
6. **情绪/风格**：专业克制 / 锐利数据 / 温暖叙事 / 创意节奏 / 复古……给 2-3 个可对比方向词。
7. **内容形态（字幕驱动关键）**：已有口播稿 / 已有 .srt/.vtt / 有图文数据 / 从零起草——决定字幕来源路由。
8. **偏好/禁忌**：讨厌的东西、字幕风格（逐句/词级高亮/无字幕）、可读性底线。
9. **一致性检查**：Phase 0 预检是否已有品牌 DNA（DESIGN.md/视觉资产/参考视频）→ 有则后续方向不得偏离（克制演进）；无则自由设计。

> 有 `video-taste-profile`（`工作台/视频/*/.taste-profile.json` 或全局档案）就先读它。
> 风格来源=参考站时，Phase 2 必须抓参考真值（chrome-devtools/vision），Phase 4 忠实继承——不把参考抽象成关键词后自由发挥。

### Phase 2 — 研究（用户同意才做，可并行）

三层研究法，优先级从低到高：

- **Layer 1 行业惯例**：同类视频普遍怎么拍（安全基线）。
- **Layer 2 新趋势**：对照 `remotion-shared/video-anti-slop.md`，抓 1-2 个**真实视频参考**（`remotion-shared/video-real-library.md` 参考源 + 用户给参考最优先），提炼字幕风/转场/节奏可借鉴点。
- **Layer 3 第一性原理**：观众心智、字幕可读性、内容主导节奏——**最高优先**。冲突时显式记录"为什么偏离惯例"。

> 提案里的"视觉参考描述"应能用真实参考库案例锚定（如"类似 xxx 的词级高亮字幕风"），不空泛。

### Phase 3 — 完整提案（核心交付）

按 `references/video-proposal-format.md` 输出：

- **SAFE 方向（2-3 个）**：品类基线，稳妥。
- **RISK 方向（2-3 个）**：刻意偏离，每个必须写"为什么值得 + 失去什么"。
- **memorable-thing**：一句话锚定——"想让观众记住的一个视觉/节奏时刻"（如"第 3 秒那个推近转场"）。
- 每个方向：审美关键词、字幕字体、配色、**时间轴节奏（字/秒、转场频次）**、构图、转场风格、视觉参考描述。

自检：两个方向若只是换色换字体，说明没拉开，重做。

> **设计系统一致性检查**：若 Phase 0 预检到已有品牌设计系统（DESIGN.md / 品牌 DNA，如已做过的网页或视频），SAFE/RISK 方向**不得偏离既定品牌 DNA**（配色/字体/情绪基线）—— RISK 方向只能在既定 DNA 内的克制偏离（如换 accent 色相、改明暗结构、换字体体系），不可推倒重来或跳去无关风格。自由发挥只允许在无既有系统时。产出 DESIGN.md 前逐条核对"配色/字体/情绪"三项与基线一致或合理演进。

### Phase 4 — 设计系统（DESIGN.md）

用户选定方向后，按 `references/video-design-system-template.md` 写 DESIGN.md，七段：

1. **审美方向**：一段话定位 + 关键词 + 禁忌。
2. **字幕字体**：caption/title/body 三档 + 画幅基准字号 + 高亮模式（word/line/none）。
3. **配色**：语义色板（含 captionActive/captionInactive）+ 对比度底线。
4. **时间轴节奏**：fps/画幅/总时长 + 字幕节奏 + 转场频次。
5. **画面构图**：安全区 + 字幕区 + 标题区。
6. **转场动效**：转场选型 + 时长 + 入场动效 + 缓动。
7. **Video Design Tokens**（`tokens.ts` 契约，见 `remotion-shared/video-tokens-spec.md`）+ **动效编排大纲**（升级自场景蓝图，见 `video-design-system-template.md` §8）：**素材分层清单（bg/mid/fg，可拼装）+ 每句字幕 → 素材进出场动效 + 字体动效 + 口播联动（视听结合）**。

并生成 **tokens.ts 契约**（TS 常量对象，语义命名）——这是给 `remotion-build` 的唯一接口。**动效从总动效库挑选组合写入 DESIGN.md**（`remotion-shared/categories/{类别}/motion-list.md`）。

**第 8 段：渲染核标注（可选，默认 Remotion）**：DESIGN.md 标注渲染后端——默认 **Remotion 核**；用户点名/风格需网页手感副才标 **HyperFrames 核**（HeyGen 开源 HTML→MP4，见 `remotion-build/references/hyperframes-guide.md`）。判断：复杂镜头卡/已有 Remotion 项目 → Remotion；纯 HTML/GSAP 动效、需内置 lint → HyperFrames。**渲染核只影响 build 的渲染写法，素材/BGM/字幕/验收/§8 大纲全复用。**

### Phase 5 — 预览 + 风格样张审批门（可选，默认开）

不渲染全片。产出：
- 3-5 张**关键帧抽帧**（`npx remotion still <id> --frame=N`，覆盖句首/句尾/转场帧）——让用户确认构图与字幕位置；
- 或 3-5 秒**低分辨率样片**（`--scale=0.25`）——让用户看真实运动节奏。
- **风格样张审批门（借鉴 paper-collage-video style-proof）**：定方向后，先渲染 1-2 个关键句的 3-5s 真实样张（低分辨率）给用户确认——风格/配色/动效手感是否对味，**确认后才进入 remotion-build 全片制作**（避免全片做完才发现风格方向不对）。

预览产物落 `工作台/视频/{slug}/preview/`。预览目的是让用户在真实视觉上做决定，不是展示"我能渲染"。

## 红线

- **禁默认套路**：不主动给紫靛渐变、全程同一字幕节奏、每场居中同构图。
- **禁复制**：不像素级克隆他人视频（可借鉴字幕风/节奏，不搬整条）。
- **禁编造**：不虚构数据、品牌事实。
- **对比度底线**：字幕 ≥3:1（含实拍/图片背景上）。
- **视频字号底线（屏幕文字都是关键字）**：字幕 / 数据 mono / 标题的字号字重底线**此处不复制数字**——唯一事实源 = `remotion-build/references/video-quality-metrics.md` §字幕硬阈值；禁细体小字注释，改阈值只改该文件一处。
- **先澄清再设计**：没完成 Phase 1 不得跳方案。

## 参考文件

> 📍 **remotion-shared 共享库查找顺序**：以 `remotion-shared/SKILL.md`「查找顺序（消费方硬约定）」为正本（全局源优先 → 项目级兼容），本文件不重述。下表 `remotion-shared/...` 路径按该正本顺序解析，不绑定特定客户端目录。

| 文件 | 何时读 |
|------|--------|
| `remotion-shared/video-anti-slop.md` | 任何阶段做方向判断时（防趋同） |
| `remotion-shared/video-real-library.md` | Phase 2 研究抓真实视频参考 |
| `资料库/AI工具/video-shotcraft/` | 镜头配方卡库（202 卡 12 类：运镜/节奏/转场/字体/特效），demos/{类}/{卡} 直接 copy，见 video-shots-spec |

> **video-shotcraft 定位（第二动效库 / 模板库，不是分流路由）**：
> - shotcraft = 完整可借鉴的**组件/动效库**（`demos/{类}/{卡}/{组件}.tsx` 场景级镜头动效 + `template/` 模板工程 + `assets/` 组件与音效）。所有视频**统一走本 consult→build，不按产品片/口播片分流**。
> - **§8 选卡**：DESIGN §8.2 镜头卡列可选填，值带意图标记 `[copy]` / `[借思路]`。接入步骤唯一事实源 = `remotion-shared/video-shots-spec.md`「镜头卡接入步骤」（build 照执行）。
> - 只有用户**点名**要用 shotcraft 模板（Ink Press）/ 自主自由创作 / 共同创作 时，才 Skill 触发 `video-shotcraft` 按其自身流程走（用户显式选择，非自动路由）。
| `remotion-shared/video-shots-spec.md` | 镜头卡体系 + 权威技巧（导演/剪辑/设计/声音，搜索+平台提炼） |
| `remotion-shared/video-design-presets.md` | Phase 4 选预设设计系统（6 套已验证品牌） |
| `remotion-shared/video-tokens-spec.md` | Phase 4 写 tokens 时 |
| `remotion-shared/categories/{类别}/DESIGN.template.md` | Phase 4 按类别模板起稿 |
| `remotion-shared/categories/{类别}/motion-list.md` | Phase 4 挑选动效组合 |
| `remotion-shared/motion-library/` | 总动效库组件清单（89 个，build 用） |
| `资料库/AI工具/设计系统库/` | Phase 2 研究/Phase 3 提案：品牌 DESIGN.md 审美锚点 |
| `资料库/AI工具/审美参考库/审美参考总览.md` | Phase 2 前端/摄影/剪辑趋势 + Phase 4 节奏设计 |
| `remotion-shared/aesthetic-judgment/` | Phase 4 定方向时：摄影/剪辑/前端排版六轴判别（素材风格/节奏/布局） |
| `.claude/skills/ui-ux-pro-max/SKILL.md` | 设计规则引擎：定视频画面风格时查（Phase 4） |
| `.claude/skills/hallmark/SKILL.md` | 反 AI slop 审查（57 门禁）：方向是否专业/防模板（Phase 2/3） |
| `.claude/skills/taste-skill/SKILL.md` | 品味检查（Pre-Flight 40+ 项）：方向是否够格（Phase 3 自检） |
| `资料库/AI工具/design-skills/open-design/craft/anti-ai-slop.md` | 去模板规则（"七宗罪"）+ 151 设计系统替代（Phase 2/4） |
| `.claude/skills/design-shared/review-panel.md` | 评审面板：agency-agents 视角 + 设计系统库/审美参考库判据（Phase 4 方向自检 + 一致性检查） |
| `.claude/skills/design-shared/wcag-basics.md` | 定配色/字幕可读性时（硬约束） |
| `references/video-proposal-format.md` | Phase 3 出提案时 |
| `references/video-design-system-template.md` | Phase 4 写 DESIGN.md 时 |
| `references/video-taste-profile.md` | 需要记录/更新用户视频品味时 |

## 输出与收尾

按统一交付摘要结尾：

```
STATUS: PASS | FAIL | BLOCKED
产出物: DESIGN.md 路径 + 预览关键帧/样片路径
关键决策: 选定的方向（SAFE/RISK 哪一个 + memorable-thing + 所属类别）
NEXT_OWNER: remotion-build（生成视频）| user（待确认方向）
待确认: 未决事项
```

收尾询问：方向定了吗？要生成视频吗？（推荐交 `remotion-build`）
