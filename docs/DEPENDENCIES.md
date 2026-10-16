# 依赖边界

此清单来自现有技能文本的静态核查，不代表在新环境重新验证过全部后端。

| 依赖 | 当前状态 |
| --- | --- |
| 三个 remotion 技能目录 | 已随仓收录 |
| shared/motion-library 与类别模板 | 已随仓收录；尚未单独打包为 npm 包 |
| Remotion / React / 浏览器与视频工具链 | 消费项目自行配置；本次未锁定或安装版本 |
| `scripts/media/tts_gen.py`、`rebuild_srt.py`、`audio_sync_check.py`、`frame_judge.py` 等 | 原工作环境脚本，本次未收录；需后续梳理接口与可公开实现 |
| 工作台视频项目、DESIGN.md、稿件、字幕与既有成片 | 外部项目输入，本次未公开 |
| 品牌设计系统库、审美参考库 | 原知识库资源，本次未收录 |
| video-shotcraft 镜头卡与模板 | 外部可选素材/组件来源，本次未整体收录 |
| hallmark、ui-ux-pro-max、其他设计技能与评审面板 | 原技能组合依赖，本次未收录 |
| 配音、图像、视频、音乐后端 | 原文中有多个可选渠道；账号、密钥、服务和本地模型不随仓提供 |
| HyperFrames | 原技能文本中的可选后端，本次未重新验证 |

现有 SKILL.md 中保留的工作台、资料库与客户端路径用于保留导入基线，其可移植改造归后续流程优化，不应直接理解为克隆仓库后这些文件就会存在。

## 引用点分类（必需 / 可选 / 仅维护者本地）

下表把技能文本里 grep 到的每个外部引用点归类，并给出独立使用者的替代方案。分类依据：必需=不改就走不通主流程；可选=有更好、没有可降级或替代；仅维护者本地=维护者环境专有，消费者拿不到、需自备替代。本表为 documentation-only，不改写 skills/* 里的硬路径（高风险，会破坏维护者本地可用路径）。

### 必需

| 引用点 | 出现位置 | 随仓状态 | 消费者替代方案 |
| --- | --- | --- | --- |
| remotion-shared 库（motion-library / categories / tokens-spec / shots-spec / anti-slop / real-library / presets / aesthetic-judgment） | consult/build 参考表、shared SKILL | 已随仓 | 放到自己的技能目录，按 `remotion-shared/SKILL.md`「查找顺序」解析（全局源优先 → 项目级兼容） |
| Remotion / React / Node.js / Chrome / ffmpeg | build Step 4/5 | 未随仓 | 消费项目自行配置；版本以对应官方文档为准（见下「当前已验证的版本」） |
| `@remotion/captions` | build Step 1 | 未随仓 | `npm i @remotion/captions@<与 remotion 相同版本>` |

### 可选

| 引用点 | 出现位置 | 随仓状态 | 消费者替代方案 |
| --- | --- | --- | --- |
| `scripts/media/tts_gen.py`、`rebuild_srt.py` | build Step 1.5 配音驱动 srt 重建 | 未随仓 | 口播片需要；可用其他 TTS + `ffprobe` 实测时长手动重建 srt（流程见 captions-guide §四·五，provider-independent） |
| `scripts/media/frame_judge.py` | build Step 5 自动化硬指标 | 未随仓 | 强烈建议；可用其他 WCAG 对比度/清晰度工具替代，或人工核帧（降级） |
| `scripts/media/audio_sync_check.py` | build Step 5 音画同步 | 未随仓 | 口播片需要；可用 ffmpeg/人工核对句首配音替代 |
| `scripts/media/layout_calc.py`、`media_gen.py`、`remove_white_bg.py` | build Step 4/5 素材与构图 | 未随仓 | 可选；构图可人眼判，素材可走其他生图后端，透明化可走其他抠图工具 |
| `scripts/sync_motion_library.sh` | build-guide §一 | 未随仓 | 仅维护者需要（同步主源到工作副本）；消费者直接从 `remotion-shared/motion-library/` import 或复制，无需同步脚本 |
| `iqa-pytorch` / `scenedetect` / `librosa` | video-quality-metrics 软指标 | 未随仓 | 明写可选；`pip install` 后启用 NIMA/ASL/BPM，不装则跳过软指标 |
| HyperFrames 后端 | build Step 0 渲染核二选一 | 未随仓 | 可选渲染核；默认走 Remotion 核，不需 HyperFrames |
| video-shotcraft 镜头卡库 | consult §8.0 / build Step 4 | 未整体随仓 | 可选第二动效库；不接入则只用总动效库组件，未接卡不 BLOCKED |
| `@remotion/transitions` | `motion-library/scene-transition.tsx`（T5）可选上游 | 未随仓 | 可选；本仓默认 crossfade（`SceneTransitionSeries`）**零新增依赖**即可消卡间硬切/渐入空白；需官方 slide/wipe/flip 等 presentation 时 `npm i @remotion/transitions@<与 remotion 同版本>`（本地骨架 toolchain 当前未含该包，见 #31 订正） |
| MiniMax / edge-tts / Codex image_gen / GPT / ACE-Step | mmx-media-pipeline / codex-imagegen | 账号/密钥不随仓 | 第三方后端；消费者自备账号或选其他后端，edge-tts 为无 Key 兜底 |

### 仅维护者本地

| 引用点 | 出现位置 | 消费者替代方案 |
| --- | --- | --- |
| `工作台/视频/{slug}/` | consult Phase 0/5、build Step 4 | 用自己的视频项目目录 |
| `工作台/视频/_动效库/` | build Step 4 | 直接从 `remotion-shared/motion-library/`（主源）import 或复制到 `src/components/` |
| `工作台/视频/remotion-workflow-intro/`（骨架 + node_modules） | build-guide §一 | 用 `npx create-video@latest --blank` 自建骨架（需 npm install 网络） |
| `工作台/视频/_参考源码/` | video-real-library §四 | 自己的参考源码缓存目录 |
| `工作台/设计测试/{品牌}/DESIGN.md` | consult Phase 0 | 自己的网页版品牌 DESIGN.md（若有） |
| `资料库/AI工具/设计系统库/`（13 品牌） | consult Phase 0/1/2、shared SKILL、注入点分析 | 自己的品牌 DESIGN.md 库；无则走自由设计 |
| `资料库/AI工具/审美参考库/审美参考总览.md` | consult Phase 2/4、aesthetic-judgment/* | 自己的审美参考；无则用 `remotion-shared/video-design-presets.md` 的 6 套预设 |
| `资料库/AI工具/video-shotcraft/` | consult §8.0、video-shots-spec | 可选；clone video-shotcraft 公开仓库或不接入 |
| `资料库/AI工具/design-skills/open-design/craft/anti-ai-slop.md` | consult/build 参考表、Step 3 | 用 `remotion-shared/video-anti-slop.md`（已随仓）替代 |
| `资料库/AI工具/bilibili-subtitle-extractor.py` | video-shots-spec §四 | 可选；自己的字幕提取工具 |
| `.claude/skills/{ui-ux-pro-max, hallmark, taste-skill, design-shared}/` | consult/build 参考表、Step 5 四技能审查 | 其他设计技能，未随仓；无则跳过对应审查门禁（降级，须在验收记录"未运行"） |
| `paper-collage-video`（style-proof / spatial-contract / proof moments）、`grill-me` | consult Phase 5、build Step 0.5/5 | 借鉴的兄弟技能，未随仓；对应方法已内联进本仓文本，可直接按文本执行 |
| `~/.agents/skills/remotion-shared/`（全局源） | shared SKILL 查找顺序 | 消费者按 `remotion-shared/SKILL.md`「查找顺序」配置自己的全局/项目级副本 |

## 当前已验证的版本

本次为现有工作流基线的非破坏性纳管与文档一致性优化，**未在新环境重新锁定或安装任何后端版本**：

- Remotion / `@remotion/cli` / `@remotion/captions`：未锁定版本；`@remotion/captions` 须与 remotion 主包同版本（见 captions-guide）。库/API 用法以对应版本的 Remotion 官方文档为准。
- HyperFrames（HeyGen 开源 HTML→MP4）：原技能文本中的可选后端，**本次未重新验证** `npx hyperframes init/render` 与 `npm run check` 的当前可用性。
- Node.js / Chrome / ffmpeg / Python（scripts/media）：消费项目自行配置，本次未规定最低版本。
- 软指标依赖（iqa-pytorch / scenedetect / librosa）：可选，未验证具体版本。

因此本仓库当前是**可审阅、可继续维护的基线**，不宣称全新环境一键运行；任何"已验证"断言须附实际执行证据，未运行的检查不写通过。
