---
name: remotion-build
description: 按视频设计系统（DESIGN.md）用 Remotion 生成 MP4 视频。只要用户在做了 remotion-consult 或拿到 DESIGN.md 后说要"生成视频""做视频""渲染视频""按DESIGN.md做视频""出MP4"，就必须使用本技能。字幕驱动：.srt 时间戳精确对齐到帧；动效从总动效库挑选；素材跨 harness 路由。默认只报告，不擅自改设计方向。
---

# remotion-build — 生成 Remotion 视频

按 `DESIGN.md`（remotion-consult 产出）用 React 代码生成 MP4。**有字幕时，字幕是唯一时间轴**（无字幕类别如 brand-motion 由场景基准时长 / BGM 节拍驱动，见 `remotion-shared/categories/{类别}/DESIGN.template.md`）；动效从总动效库 import，素材走跨 harness 路由。

## 工作流

### Step 0 — 模式选择（四选一，先定再动手）
1. **按类别模板**：用户要既定风格，或从 `remotion-shared/categories/` 四类挑（口播字幕/数据可视化/产品演示/品牌动效）→ 读该类 `DESIGN.template.md` + `motion-list.md`，继承设计系统只换内容与字幕。
2. **借鉴参考**：用户给参考视频（最优先）或 `remotion-shared/video-real-library.md` 挑 → 拆解其字幕风/转场/节奏，用总动效库组件复刻。
3. **自由设计**：无参考无模板 → 只避开 `video-anti-slop.md` 反向提示词。
4. **按已有 DESIGN（consult 产出）**：consult 已定 DESIGN + 风格样张通过 → 严格按 DESIGN tokens/§8 执行，**不再重问风格方向**（Step 0.5 只对齐验收标准，不重复 Phase 1 澄清）。
拿不准就列选项给用户。

**渲染核二选一（第五维，DESIGN 标注）：** 除上面四路模式，再定**渲染后端**（本技能默认 Remotion 核；DESIGN 标注或用户点名才 HyperFrames 核）：
- **Remotion 核**（默认）：React 复杂动效 / shottcraft 镜头卡 / `src/` 分层 + `Sequence` + `useCurrentFrame`。追求最高动效自由度时用。
- **HyperFrames 核**（HeyGen 开源 HTML→MP4，可选）：`index.html` 数据属性 + GSAP timeline（`npx hyperframes init/render`，本地免费）→ 更接近网页手感、内置 `npm run check`（lint+对比度+运动）。素材/BGM/字幕/验收全复用，只换渲染写法。**规则见 `references/hyperframes-guide.md`**。
- 判断：复杂镜头卡（翻牌/粒子/3D）或已有 Remotion 项目 → Remotion；纯 HTML/GSAP 动效、想网页手感、需内置 lint → HyperFrames。**同一项目勿混两核。**

### Step 0.5 — 需求对齐 + 验收标准（grill-me，强制，≤10 轮）
跑 `grill-me` 技能对齐：一句话需求、画幅/时长/平台、**字幕来源**（.srt/.vtt/口播稿/从零）、模式、风格方向。**必须产出验收标准**四类：
- **结构**：类别/画幅/时长/fps
- **视觉**：字幕字体/配色/构图 与 DESIGN.md 或参考一致（自由模式"无 AI 味"）
- **内容**：字幕全句到齐、无错字、时间戳覆盖全片、文案真实
- **技术**：字幕帧对齐（句首句尾帧字幕存在）、still 抽帧通过、MP4 渲染成功

10 轮未对齐 → 记录未决项带病进入构建。

### Step 1 — 字幕驱动流程（核心，适用于有字幕类别）

> 类别适用性：voiceover-caption / data-viz / product-demo 为字幕驱动（走本 Step）；brand-motion（字幕无或 minimal）跳过 srt 时间轴推导，改由场景基准时长 / BGM 节拍驱动，见 `remotion-shared/categories/{类别}/DESIGN.template.md`。

按 `references/captions-guide.md`：
1. **来源路由**：已有 .srt/.vtt → 直接用；有口播稿.md → 起草草稿 .srt；从零 → 先草稿口播稿再 .srt。
2. `parseSrt({input})` → `Caption[]`，校验空段/时间重叠/越界。
3. **帧对齐**：`startFrame = Math.round((startMs/1000)*fps)`、`endFrame = Math.round((endMs/1000)*fps)`，每句 `<Sequence from={startFrame} durationInFrames={endFrame-startFrame}>`。
4. **词级/句级高亮**：`createTikTokStyleCaptions` → `CaptionLayer` 组件；中文整句单 token → 退化为句级（DESIGN.md highlightMode 决策）。
5. 画面节奏绑定字幕句首 startMs；全片 `durationInFrames = round(max(endMs)/1000*fps) + trailing`。
6. 改词后 `serializeSrt` 回写。

### Step 1.5 — 配音驱动 srt 重建（时序假设真正触发，先配音后抽帧）

口播片配音是必须流程（不问用户）：**TTS 生成 → ffprobe 实测 → 重建 srt 定时间轴**，时序以 TTS 实测为准（DESIGN §4 时序假设真正触发）。**先配音后抽帧**——避免 Step 1 srt 对齐后又被配音重建推翻、前几步白做。
1. `python scripts/media/tts_gen.py --provider edge-tts --lines lines.txt --save-dir public/audio/ --voice <voice>`（默认无 Key 兜底；MiniMax 可用时显式改为 `--provider minimax`，国内云端 TTS 见 `mmx-media-pipeline.md` §二）。
2. **ffprobe 实测每句时长**（`ffprobe -show_entries format=duration`），句间 0.8s 呼吸。
3. **重建 srt**（`rebuild_srt.py`）：每句 start/end = 实测时长累计 + 呼吸；写 public/captions.srt。
4. Root `SHOTS` 帧区间按新 srt 更新（`round(ms/1000*fps)`），每 Sequence 挂 `<Audio src={staticFile("audio/s{n}.mp3")}>`。
5. BGM：不需要 AI 生曲时从项目授权素材库取得；需要按提示词生曲时默认使用 ACE-Step 本地生成，云端音乐后端作为可选备选。取得后裁剪到全长（ffmpeg `-t` 视频秒数），音量压低不抢口播（0.22-0.3）。
6. **场景帧预算 + 卡时序预检（防"关键动效不出现"，实测踩 3 次）**：rebuild_srt 输出的每句 `to-from` 就是**该场景帧预算**。写卡/写数据动效前先核：卡内部**最后一个关键帧 ≤ 场景预算**，否则压缩卡时序（不是留到验收才发现）——
   - 短句（2-3s≈60-90f）：盖章/扫圈/周期点亮等**尾部动效最容易超预算**（S2 红章原 70-88f 超 68f 句 → 压到 55-65f；S6 周期点亮原 46-70 超 70f → 压到 46-64；S9 扫 5 圈原 136f 超 128f 句 → 压到 108f）。
   - 规则：`卡最后关键帧 = 起始 + 级联总长 + 尾部定格`，必须 ≤ 句预算；超了按比例压 stagger/单次时长，尾部定格 ≥4f 保留。

### Step 2 — 找参考
用户给参考最优先 → `video-real-library.md` → 自由设计。有参考用"拆解动效法"（参考 → 总动效库组件组合，见 `motion-patterns-video.md`）。

### Step 3 — 反向提示词（视频版浓缩，唯一硬约束）
- 不要全程同一种字幕节奏（每句等长、词级高亮无差别刷屏）
- 不要每场居中同构图、全程只有 fade 或全程硬切
- 不要均匀切画面（每 N 秒一切 = 无呼吸感）
- 不要默认紫靛渐变背景、不要烂大街 AI 字体
- 不要空泛旁白字幕（"欢迎观看""让我们开始"）
- **动效必须做**：每场景至少入场动效 + 场景间转场
- **到此为止。**

### Step 4 — 构建（技术底线）
按 `references/remotion-build-guide.md`：
- 项目 init：从 `_dev/remotion-tutorial` 复制骨架 + `npm i @remotion/captions@<对齐版本>` + 保留 Chrome 路径。
- **从总动效库 import 组件**（`工作台/视频/_动效库/`）或复制到 `src/components/`。
- **镜头卡可选接入**：DESIGN §8.2 选卡则照 `remotion-shared/video-shots-spec.md`「镜头卡接入步骤」执行（含 `[copy]`/`[借思路]` 意图标记）；中文片默认借思路。
- **场景卡（数据驱动，T1 起）**：DESIGN §8.2 标了 `cut.type` 的句子，用 `motion-library/scene-cards.tsx` 的 `<SceneRenderer cut={{ type: "stat", ... }} />` 按 type 渲染场景卡（当前 `stat/text/callout/comparison/hero/section/end` 可用；契约见 `motion-library/scene-cards-contract.md`），颜色/字体从 tokens 传入，**不必手搓数据卡 SVG**；未知 `cut.type` 会**显式抛错**（不静默渲染空白）。
- src 分层：Root.tsx / theme.ts / captions.ts / components/。
- 确定性动画（`useCurrentFrame`/`interpolate`/`spring`，禁 `Math.random` 与浏览器定时器）。
- 有 DESIGN.md 就严格按 tokens 执行。
- 素材按 `references/video-image-spec.md` 跨 harness 路由（Codex image_gen / GPT 提示词往返 / 用户给图）。
- **素材生成后回校验大纲（强制）**：素材生成完，对照 DESIGN §8 大纲逐句校验——①图片是否贴合该句语义/排版（vision 评估贴合度，<7 重新生成或调 prompt）②大字关键词是否和场景图协调、不遮挡 ③层次 z 序是否符合大纲设计。不符 → 调整关键词或重生成素材，**不"生成即用"**；每画面元素多候选挑最优。

### Step 5 — 验收闭环（grill-me 节点表）

| 节点 | 触发 | 轮数上限 | 退出条件 |
|------|------|---------|---------|
| 开始 | Step 0.5 | 10 轮 | 验收标准定稿 |
| 修改 | 用户提改 | 5 轮/次 | 改什么清楚，每轮对照验收标准 |
| 最终 | 交付前 | 4 轮 | 逐条过验收标准 |

**硬性验收动作（先抽帧后渲染，防长时间渲染白跑）**：
**分层量化（4 层，在 DESIGN §8.2 证明时刻关键帧=句首/中段/0.82 终态 上做）**：
- **层1 背景图**（场景图本身）：`python scripts/media/layout_calc.py <场景图>`——构图/留白/建议文字区（按图留白结构找空区，不强制顶部纯净；顶部被侵入 → 文字移位到 `text_zone` 建议区，或重生成更纯净图）；
- **层2 背景图+字**（still 含文字）：layout_calc 文字落点 + frame_judge `--subtitle-hex` 真 WCAG 对比（大字≥3.0/正文≥4.5）；
- **层3 +动效**（连续帧）：帧差/连续帧 vision 判动效真实发生 + 动效与场景不重叠（卡是完整画面则不当场景图叠加，视觉模式见 §8.2）；
- **层4 整体**（成片）：frame_judge 全片 + `audio_sync_check.py` 音画同步 + 遮挡校验 + 四技能计分 + 动作证明。
1. `npx remotion compositions` 确认真 id；
2. **still 抽帧 3-5 张（句首/句尾/转场帧）——抽"终态帧"不是动效中途**（实测教训 2026-08-17）：抽帧选**动作完成后的帧**（0.82 终态 / 尾部定格后），不抽动效进行中帧——中途帧会让 vision/人眼误判"缺失/静态/黑框"（S2 翻牌中途无红章、S6 里程表滚动中无周期点、S7 时间线中段无人像卡都是抽帧时机错，抽终态帧才对）。字幕存在且对齐、构图不破；
3. **字幕对齐验证**：句首帧字幕已出现、句尾帧未提前消失；
4. **自动化硬指标判别**：抽帧后跑 `python scripts/media/frame_judge.py preview/*.png --subtitle-hex <DESIGN 字幕色，如 E8833A> --subtitle-threshold 3.0 --text-bg-hex <文字胶囊底，如 F2F0EB>`（**--text-region** 文字在角落时传实际位置 tl/tr/bl/br/center，防底部误报；**--text-bg-hex** 已知胶囊底则直接算字幕 vs 底真对比，跳过众数——众数抓场景色，文字叠场景时不准；大字场景阈值 3.0 / 正文 4.5；任一 FAIL 触发修订）；可选 `pip install iqa-pytorch` 后加 NIMA 美学分（>6.5 记参考档）；指标阈值见 `references/video-quality-metrics.md`；**暗色设计亮度 FAIL 不阻塞**（见 metrics 暗色设计说明，以对比度为准）；
5. **每张抽帧对照 checklist 核（弱项 <3 触发修订）**：
   - 构图：≥2 视觉元素、不每场居中、层次 z 序正确（bg/mid/fg）
   - 字幕：存在且对齐、可读（对比度 ≥3:1）、无破字
   - 转场：句间有转场/入场动效，不是裸切或静止
   - 素材：无 AI 乱码文字、层次符合 §8.1、透明叠加干净
   - 场景卡（若 §8.2 标了 `cut.type`）：`SceneRenderer` 按 type 正确渲染、数值/标签/单位齐全、对比度达底线、卡为主画面不与背景场景图重叠；**未静默降级**（未知 type 应已抛错，不是空白帧）
   - 动效：至少 2 种动效在场（素材进出场 + 字体 + 背景 三选二）、背景带动效
   - 无 AI 味：对照 `video-anti-slop.md` 反向提示词
6. **遮挡校验 + 视觉模式核对（借鉴 paper-collage-video spatial-contract，2026-08-16 扩展）**：抽帧逐句验证——①大字胶囊在预留区（顶部留白）②主体不压大字/字幕区 ③前景不遮挡中后景主体 ④**卡动效与场景图不重叠**：完整画面卡（里程表/表盘/粒子柱/聚光暗场）绝不当场景图叠加（视觉模式三选一，见 DESIGN §8.2）⑤**动效意义与句意呼应**（vision 判粒子柱/扫光/数字滚动在该场景表达什么、是否与口播语义一致，意义不明触发修订）。遮挡/意义不明 → 改视觉模式或去掉多余卡。
7. **四技能审查硬门禁**（任一门禁不过 → 修订，不是参考）：**用子智能体独立跑（hallmark/taste 由独立 agent 执行，不主模型自审自放）**——
   - `taste-skill` Pre-Flight（40+ 项品味检查）
   - `hallmark audit`（57 门禁反 AI slop）
   - `ui-ux-pro-max`（UX 准则：可读性/层次/一致性）
   - `open-design/anti-ai-slop`（"七宗罪"去模板）
   抽帧/成片对照审，**按过条数计分放行（评审补，防自审自放）**：hallmark 57 门禁过 ≥90%（≥51 条）才放行、taste 40+ 项过 ≥85% 才放行、ui-ux-pro-max / open-design 关键项全过；**未过条数列出触发修订**，过全部门禁才 render 交付。
8. `npx remotion render <id> out/final.mp4`；
9. **动作证明时刻（借鉴 paper-collage-video proof moments）**：按 DESIGN §8.2 每句证明时刻（句首/中段/0.82 终态）抽帧 + 验证动作类型**真实发生**（入场已发生/持续在动/终态定格）；`ffmpeg -vf "fps=4"` 抽连续帧 → vision 判动作按 DESIGN 发生——平移一帧静态帧 ≠ 动作证明（粒子/聚光/数字必须连续帧确认）；转场平滑/进出场无跳变（video-quality-metrics §四.6）；
10. **音画同步核对（口播片主轴，评审补）**：成片跑 `python scripts/media/audio_sync_check.py out/final.mp4 public/captions.srt`——每句 srt 句首 ±0.15s 应有配音声音（RMS≥0.01），句首静音 = 配音错位/缺失/句尾截断 → 修订；
11. 逐条核对验收标准 → STATUS PASS/FAIL/BLOCKED，NEXT_OWNER。

## 红线
- **字幕驱动是硬约束（有字幕时）**：captions.srt 存在即时间轴唯一来源，时长由其推导；无字幕类别（brand-motion）由场景基准时长 / BGM 节拍驱动，不强制 captions.srt。
- **先抽帧后渲染**：still 不过不 render 全片。
- **镜头卡借鉴不强制**：DESIGN §8 选卡则接入（copy `shotcraft/demos/{类}/{卡}` 适配），没选卡或中文片借思路不算漏；未接卡不 BLOCKED。
- **素材走真实生图，不生成 SVG**：主体素材优先 Codex 或已配置图像后端，透明走 `--transparent`/`remove_white_bg.py`。
- **程序化数据卡优先真 copy shotcraft 完整版，不手写精简 SVG（实测教训 2026-08-17）**：自建数据卡（表盘/环/里程表/图表）若手写精简 SVG（裸 circle/line/path、无刻度/红区/毂/辉光细节）会糙（S9 ring 手写版 mmx vision 3.5/10，真 copy shotcraft NeedleSweepSelftest 完整细节后 8.5/10）。**数据卡一律从 shotcraft demos/data、typography 真 copy 完整版**（刻度/主次/辉光/表盘毂/指针尾等细节都在），再重蒙皮配色；只有简单装饰（背景光斑/底轨）才程序化绘制。
- **配音驱动 srt 重建是必须（Step 1.5，先配音后抽帧）**：口播片 Step 1.5 必须 TTS→ffprobe→重建 srt 定时间轴（时序以 TTS 实测为准，DESIGN §4），抽帧验收在配音重建 srt 之后，不问用户。
- **不改设计方向**：DESIGN.md 定了就照做；要改方向回 remotion-consult。
- **禁编造**：字幕/数据不虚构。

## 参考文件

> 📍 **remotion-shared 共享库查找顺序**：以 `remotion-shared/SKILL.md`「查找顺序（消费方硬约定）」为正本（全局源优先 → 项目级兼容），本文件不重述。下表 `remotion-shared/...` 路径按该正本顺序解析，不绑定特定客户端目录。

| 文件 | 何时读 |
|------|--------|
| `references/captions-guide.md` | Step 1 字幕时间戳对齐（核心） |
| `references/remotion-build-guide.md` | Step 4 工程规范 |
| `references/motion-patterns-video.md` | Step 2/5 动效实现 |
| `references/video-image-spec.md` | Step 4 素材路由 |
| `references/codex-imagegen.md` | Step 4 素材走 Codex 时 |
| `references/mmx-media-pipeline.md` | Step 4 媒体后端（MiniMax 可选 + TTS/BGM 降级链 + 已知坑） |
| `references/video-quality-metrics.md` | Step 5 自动化判别指标（frame_judge.py + VMAF/NIMA/ASL 阈值） |
| `references/hyperframes-guide.md` | Step 0 渲染核=HyperFrames 时：HTML 数据属性/GSAP/check 规则 + CLI |
| `references/hyperframes-blocks.md` | HyperFrames 渲染核时选动效块：registry blocks 154 个按类速查（等价 shotcraft） |
| `remotion-shared/video-anti-slop.md` | Step 3 反向提示词基线 |
| `remotion-shared/video-tokens-spec.md` | 写 theme.ts 时 |
| `remotion-shared/categories/{类别}/motion-list.md` | 选动效组合 |
| `remotion-shared/video-shots-spec.md` | 镜头配方卡体系 + 权威技巧（build 选镜头卡：demos/{类}/{卡} copy 进项目） |
| `remotion-shared/aesthetic-judgment/` | Step 5 验收：摄影/剪辑/前端排版六轴判别（<3 触发修订） |
| `.claude/skills/ui-ux-pro-max/SKILL.md` | 设计规则引擎：Step 4 构建时查 UX 准则 + 优先级 |
| `.claude/skills/taste-skill/SKILL.md` | Step 5 最终检查：Pre-Flight 40+ 项（交付前自检） |
| `.claude/skills/hallmark/SKILL.md` | Step 5 设计审查：57 门禁 / `hallmark audit`（验收前） |
| `资料库/AI工具/design-skills/open-design/craft/anti-ai-slop.md` | Step 3 去模板规则（"七宗罪"）+ 151 设计系统替代 |
| `.claude/skills/design-shared/review-panel.md` | 评审面板：agency-agents 视角 + 设计系统库/审美参考库判据（Step 5 验收打分） |

## 输出与收尾
```
STATUS: PASS | FAIL | BLOCKED
产出物: out/final.mp4 路径 + preview/ 抽帧路径
验收标准: 逐条 达标 / 未达标 / 未决
NEXT_OWNER: user（看效果）| remotion-consult（改方向）
待确认: 未决事项
```
