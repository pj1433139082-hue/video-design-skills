# 短案例 walkthrough 基线 —《为什么天空是蓝的》

> ticket #10（spec #1 / P2-2）产出。**优化前（before）基线**：在**当前未改动的流程**上完整走一遍 consult→build，记录实际命令、产物、耗时与消耗指标，作为 #12（Step 0.5 拆分）/#13（样张工程复用）改动后的对照基准。
> 案例性质：**合成中性科普案例**（维护者拍板用合成案例，非历史产出）。完全虚构、无品牌、无业务信息，可公开。
> 执行日期：2026-10-15｜执行：千问办公（QwenWork）｜环境：维护者本机（node v24.14.1、Chrome、ffmpeg 8.1、edge-tts 7.3.1、scripts/media/*）。
> 工作产物在维护者本机隔离目录 `工作台/视频/_public-case-why-sky-blue/`（**不随仓**）；成片 MP4 被 .gitignore 排除，**不入库**；本文档只收录公开安全的口播稿、设计要点、指标与发现。

## 一、案例输入（公开安全）

口播稿（5 句，约 77 字）：

1. 天空为什么是蓝的？
2. 阳光看似白色，其实混了七种颜色。
3. 蓝光波长最短，最容易被空气散射。
4. 散射的蓝光铺满天空，抬头就是一片蓝。
5. 傍晚阳光斜穿更厚大气，蓝光散尽，红光染红天际。

- 类别 voiceover-caption｜画幅 9:16（1080×1920）｜30fps｜highlightMode line。
- 设计要点：深蓝主调 #0A1A3A + 暖橙 accent #FF8A3D；字幕 captionActive #FFD24A；字号字重底线引用 metrics §字幕硬阈值（caption 64/800、title 96/900、mono 44/700）；5 场景视觉模式（纯场景图+字 / 场景图+透明层 / 纯卡）；动效从总动效库 import（FadeTransition / PunchInTransition / CaptionLayer）。

## 二、管线走查（实际命令 + 产物 + 耗时）

| 步 | 命令/动作 | 产物 | 耗时 | 结果 |
|----|----------|------|------|------|
| consult Phase 0-4 | 预检（无既有品牌 DNA→自由设计）+ 澄清（内容已预批准）+ 写 DESIGN.md 七段 + §8 逐场景素材提示词（十字段）+ tokens | DESIGN.md、口播稿.md、lines.txt | — | 完成 |
| build Step 1.5 TTS | `tts_gen.py --provider edge-tts --lines lines.txt --voice female-chengshu` | s1-s5.mp3 | 24s | 首次 403 失败→升级 edge-tts 7.2.7→7.3.1 后成功 |
| build Step 1.5 实测 | `ffprobe -show_entries format=duration` 每句 | 时长 2.088/3.744/4.104/4.272/5.544s | <1s | 纯语音 19.75s |
| build Step 1.5 重建 srt | `rebuild_srt.py --path <case> --breath 0.8 --fps 30` | captions.srt + SHOTS 帧区间 | <1s | DURATION_FRAMES=734（24.5s） |
| build Step 4 素材 | `qwenwork_image_generate` ×5（9:16/4K，十字段提示词） | 5 张 3072×5504 | ~异步 | vision 回校验：构图/留白/配色 PASS，**5 张均带「AI生成」水印** |
| build Step 4 素材处理 | `ffmpeg scale=1080:-1,crop=1080:1800:0:0`（裁底去水印） | public/img/s1-s5.jpg（1080×1800） | ~5s | vision 复验：水印已除，顶部留白纯净 |
| build Step 4 工程 | 复制骨架 config+动效库+index.ts；node_modules 用 junction 复用骨架（免 npm install/免复制几百 MB） | 可运行工程 | <5s | `remotion compositions` → WhySkyBlue 1080×1920 734帧 |
| build Step 4 写 src | theme.ts（1080×1920 tokens）/ captions.ts / Root.tsx（5 Sequence + Audio + 动效库 + CaptionLayer） | src 三件套 | — | 编译通过 |
| build Step 5 抽帧 | `remotion still --frame={67,194,339,490,674}`（0.82 终态帧） | preview/frame-*.png ×5 | 55s | — |
| build Step 5 frame_judge | `frame_judge.py preview/*.png --subtitle-hex FFD24A --subtitle-threshold 3.0 --text-region bottom` | — | ~3s | **S1 对比 2.33 / S5 2.48 = WARN（<3.0）**，0 FAIL |
| **修订轮 1** | Root.tsx 加底部渐变 scrim（压暗字幕区）→ 重抽 5 帧 → 重判 | — | ~90s | S1 2.33→**11.18**、S5 2.48→**12.6**，对比全 PASS |
| build Step 5 render | `remotion render WhySkyBlue out/final.mp4` | out/final.mp4（3.7MB，24.512s，1080×1920，含音轨） | 67s | 成功 |
| build Step 5 audio_sync | `audio_sync_check.py out/final.mp4 public/captions.srt` | — | ~2s | **S4 句首 SILENT（Δ0.0058）**，余 4 句 OK |
| **修订轮 2** | 诊断：s4.mp3 有 0.198s 前导静音（edge-tts lead-in）→ `silenceremove` 裁掉（4.272→4.074s，备份原文件）→ 重渲染 → 重验 | out/final.mp4（3.7MB） | 76s | audio_sync **全 5 句 OK，0 SILENT**（S4 Δ0.1611） |

## 三、before 基线指标（供 #12/#13 对照）

| 指标 | 值 | measured/prescribed |
|------|-----|---------------------|
| 成片时长 | 24.512s（734 帧 @30fps） | **实测** |
| 全片渲染次数 | 2（初渲 67s + 音频修订重渲 76s） | **实测** |
| still 抽帧次数 | 10（首批 5 + scrim 后重抽 2 + 重抽 3） | **实测** |
| 唯一终态帧数 | 5（每场景 1，0.82 终态） | **实测** |
| 自动化验收修订轮 | 2（frame_judge 对比 → scrim；audio_sync 句首静音 → 裁前导静音） | **实测** |
| TTS 耗时 | 24s（5 句） | **实测** |
| 各步总耗时（不含 agent 思考） | ≈ 6 min（TTS 24s + 素材异步 + 抽帧 110s + 渲染 143s + 修订重抽/重渲） | **实测** |
| consult/build 流程内问答轮数 | consult 入口分类 1 + Phase 1 澄清 9 项（≤2 批）+ Phase 3 方向确认 1 + Phase 5 样张确认 1 + build Step 0.5 grill-me ≤10 | **prescribed（规定值，非实测）** |
| #10 本次实际用户决策轮 | 4（案例选择 / 内容批准 / 时长冲突 / TTS 后端） | **实测** |

> **问答轮数的诚实标注（重要，关系到 #12 的对照有效性）**：本次为合成案例走查，consult 的方向/风格决策由 agent 依预批准内容代为填充，**未与用户跑字面多轮 grill-me**；build Step 0.5 的"≤10 轮"是 SKILL.md 规定上限，本次未字面执行。因此"流程内问答轮数"是**规定值（prescribed）而非实测**。#12（Step 0.5 拆分，声称降低模式 4 的重复问答）的 before/after 对照，**须在真实用户多轮场景下重测问答轮数**，不能直接用本合成走查的规定值当实测基线。渲染次数/抽帧数/修订轮/耗时为实测，可直接用于 #13 对照。

## 四、管线发现（对优化最有价值的部分）

这些是走查中**真实踩到**的环节，正是 HANDOFF-QWEN 要 surface 的"反复耗时环节"，建议反馈进技能文本：

1. **edge-tts 403 端点拒绝（环境脆弱性）**：edge-tts 7.2.7 被微软 `Sec-MS-GEC` 端点 403 拒绝（两个 voice 均失败），升级 7.3.1 后恢复。→ 建议 build Step 1.5 / mmx-media-pipeline 补一句"edge-tts 403 时先 `pip install --upgrade edge-tts`（Sec-MS-GEC 算法轮换），再考虑 MiniMax 兜底"。
2. **图像后端「AI生成」水印（素材回校验价值实证）**：banana-image-2 对 5 张图都加了右下角「AI生成」合规水印，被 vision 素材回校验 catch，用 `ffmpeg crop` 裁底去除。→ 证明 build Step 4「素材生成后回校验大纲」步骤**真在干活**；建议 video-image-spec 补"图像后端可能加合规水印，回校验须查水印并裁除/换后端"。
3. **亮底字幕对比不足（frame_judge 价值实证）**：S1 晴空、S5 晚霞两张亮底，暖黄字幕对比仅 2.33/2.48（<3.0 大字底线），frame_judge catch → 加底部渐变 scrim → 11.18/12.6。→ 证明 frame_judge 硬门禁有效；建议 DESIGN 模板/类别模板对"亮底场景"默认要求字幕 scrim 或胶囊底（voiceover-caption 模板当前只写"白+描边"，亮底不够）。
4. **edge-tts 前导静音致字幕领先人声（audio_sync 价值实证 + 真管线缺陷）**：s4.mp3 有 0.198s 前导静音，rebuild_srt 按 ffprobe **全时长**（含静音）算句首，导致字幕 12.836s 出、人声 13.0s 才起，audio_sync 句首窗 catch 到 SILENT。裁前导静音后对齐。→ **这是 rebuild_srt 的真实改进点**：应裁掉 TTS 前导静音或按 audible-onset 定句首，否则每句都可能字幕领先人声。建议 captions-guide §四·五 / rebuild_srt 补"先裁 TTS 前导静音再算时间轴"。
5. **"15s 目标"与文案长度的张力**：批准的 5 句 77 字，edge-tts 自然语速 ≈3.9 字/s，纯语音就 19.75s，成片 24.5s——**减呼吸也压不到 15s，必须删文案**。→ 建议 consult Phase 1「画幅与时长」澄清时，按"目标时长 × 语速 − 呼吸"反推**字数上限**并提示用户，避免定完文案才发现超时。

## 五、验收状态（对照 #10 acceptance criteria）

- [x] 维护者已指定案例方式（合成中性案例）
- [x] 在当前流程上完整走完 consult→build，每步命令/产物/耗时如实记录
- [x] 记录含渲染次数（2）、抽帧数（10/5 唯一）、修订轮（2）、各步耗时——**实测**
- [x] 问答轮数——**如实标注为 prescribed（规定值），非实测**；#12 对照须真实多轮重测
- [x] 案例素材公开安全（合成、无品牌/业务信息）；成片 MP4 不入库（.gitignore）；工作产物在维护者本机隔离目录不随仓
- [x] 遇到的重复工作/卡点清单（§四 5 条）——供 #12/#13 及后续技能优化定位
- [x] 未运行/未实测项如实标注（问答轮数 prescribed；四技能审查 hallmark/taste/ui-ux/open-design 未跑——本机未装这些外部技能，记"未运行"）

## 六、未运行的检查（诚实边界）

- **四技能审查硬门禁**（taste Pre-Flight / hallmark 57 门禁 / ui-ux-pro-max / open-design anti-slop）：本机未装这些外部技能（DEPENDENCIES 类别 C），**未运行**。本走查的视觉质量靠 frame_judge 硬指标 + vision 素材回校验 + 六轴自评覆盖，不等于四技能门禁通过。
- **流程内多轮问答**：未与用户跑字面 grill-me（见 §三标注）。
- **NIMA/VMAF/ASL 软指标**：未装 iqa-pytorch/scenedetect，未运行。
- 本文档是 before 基线；after 对照（#14）须在 #12/#13 落地后用**同一案例同一输入**重跑。
