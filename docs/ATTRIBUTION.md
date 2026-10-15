# 第三方来源与归属（Attribution）

本仓库的技能文本引用了若干第三方规范、工具、来源与兄弟技能。本清单按类别列出**引用位置**与**许可状态**，供公开仓库的合规审查。

> 重要边界（沿用 README 声明）：外部框架、参考站、字体、音效、模板和镜头卡**不因被引用而自动包含在本仓库中**。本清单只登记"引用关系"，不代表已逐项核对来源许可，也**不为来源尚未逐项核对的全部内容统一添加许可证**。仓库自身适用何种许可证，是单独决策，不在本清单范围。
>
> 许可状态图例：`已知` = 文本中已注明或为公认许可；`待核对` = 尚未逐项核实，使用前须自行确认。

## 一、官方规范 / 标准

| 来源 | 引用位置 | 许可状态 |
| --- | --- | --- |
| W3C WCAG 2.1（对比度公式 L=0.2126R+0.7152G+0.0722B、正文≥4.5 / 大字≥3.0） | `skills/remotion-build/references/video-quality-metrics.md` §二；`skills/remotion-shared/aesthetic-judgment/layout-judgment.md` | 已知（W3C 文档许可，引用规范阈值） |
| 国家广电总局《电影送审字幕技术要求》（2K/HD 片名字幕垂直高度 ≥40px） | `video-quality-metrics.md` §字幕可读性硬阈值 | 待核对（法规/标准文本，引用阈值） |
| Material Design 3（动效时长：出入屏 200-500ms，emphasized/decelerate/accelerate） | `video-quality-metrics.md` §三 | 已知（Google，CC-BY-4.0 文档许可） |
| BBC 无障碍指南（字幕字号下限） | `video-quality-metrics.md` §字幕可读性硬阈值 | 待核对 |

## 二、开源工具 / 库

| 来源 | 引用位置 | 许可状态 |
| --- | --- | --- |
| Remotion / `@remotion/cli` / `@remotion/captions` | `remotion-build-guide.md`、`captions-guide.md`、build SKILL | 待核对（Remotion 为商业友好许可，需按其官方 license 确认；本仓库未随仓分发） |
| Netflix/vmaf（VMAF 全参考质量指标） | `video-quality-metrics.md` §二 | 已知（BSD+Patent，引用指标名与算法） |
| Google NIMA（IEEE TIP 2018，美学分） | `video-quality-metrics.md` §三 | 待核对（论文/模型权重，引用方法） |
| LAION-AI/aesthetic-predictor | `video-quality-metrics.md` §三 | 已知（MIT，文本已注明） |
| CLIP-IQA（AAAI2023）/ LIQE（CVPR2023） | `video-quality-metrics.md` §三 | 待核对（论文/实现，引用方法） |
| iqa-pytorch / IQA-ONNX-Models | `video-quality-metrics.md` §三 | 待核对（pip 包，引用为可选软指标） |
| scenedetect（ASL 平均镜头时长） | `video-quality-metrics.md` §二/§四 | 待核对（pip 包） |
| librosa（BPM 卡点） | `video-quality-metrics.md` §二 | 待核对（pip 包） |
| ffmpeg / ffprobe（渲染、VMAF、抽连续帧、时长实测） | build SKILL Step 1.5/5、`video-quality-metrics.md` | 已知（GPL/LGPL，作为外部命令调用，未随仓分发） |
| HyperFrames（HeyGen 开源 HTML→MP4） | `hyperframes-guide.md`、`hyperframes-blocks.md`、build SKILL Step 0 | 待核对（开源后端，本次未重新验证版本与许可） |
| edge-tts | `mmx-media-pipeline.md`、build SKILL Step 1.5 | 待核对（TTS 后端，无 Key 兜底） |

## 三、博客 / 自媒体 / 行业来源（字幕与节奏阈值调研）

| 来源 | 引用位置 | 许可状态 |
| --- | --- | --- |
| 缔影传媒（字幕字号/对比度/位置） | `video-quality-metrics.md` §字幕可读性硬阈值 | 待核对（行业博客，引用经验阈值） |
| Subanana（字幕时间轴/描边） | 同上 | 待核对 |
| 知瑷迩（每行字数/字幕动画时长） | 同上 | 待核对 |
| 城大翻译系（每行字数） | 同上 | 待核对 |
| 店托易（卡点/慢节奏转场时长） | `video-quality-metrics.md` §节奏/转场惯例 | 待核对 |
| 520自媒体（前奏/副歌镜头、大脑情绪延迟） | 同上 | 待核对 |
| 知乎《取景构图实施手册》（黄金分割/三分交点） | 同上 | 待核对 |

> 以上为平台调研提炼的经验阈值，引用其观点/数字；如需公开再分发原文，须逐项取得来源授权。

## 四、参考站 / 素材源

| 来源 | 引用位置 | 许可状态 |
| --- | --- | --- |
| 21st.dev（组件/动效参考） | `video-real-library.md`、`video-design-system-template.md` §9 | 待核对（参考站，借鉴视觉/动效，不像素级克隆） |
| getdesign.md（品牌 DESIGN 参考，如 linear） | `video-design-system-template.md` §9 | 待核对 |
| video-shotcraft（镜头配方卡库：demos/template/assets） | `video-shots-spec.md`、consult §8.0、build Step 4 | 待核对（外部可选素材/组件来源，未整体随仓；接入时按各卡 demo 自身许可） |

## 五、兄弟技能（方法借鉴，未随仓）

| 来源 | 引用位置 | 许可状态 |
| --- | --- | --- |
| paper-collage-video（style-proof 风格样张审批门 / spatial-contract 遮挡校验 / proof moments 动作证明时刻） | consult Phase 5、build Step 5 | 待核对（方法借鉴，已内联进本仓文本） |
| grill-me（需求对齐 / 验收标准节点表） | build Step 0.5 / Step 5 | 待核对（流程借鉴） |
| hallmark（57 门禁反 AI slop 审查） | consult Phase 2/3、build Step 5 | 待核对（外部技能，未随仓） |
| taste-skill（Pre-Flight 40+ 项品味检查） | consult Phase 3、build Step 5 | 待核对（外部技能，未随仓） |
| ui-ux-pro-max（UX 准则/设计规则引擎） | consult Phase 4、build Step 4/5 | 待核对（外部技能，未随仓） |
| design-shared（review-panel 评审面板 / wcag-basics） | consult Phase 4、build Step 5 | 待核对（外部技能，未随仓） |
| open-design/craft/anti-ai-slop（"七宗罪"去模板 + 151 设计系统替代） | consult/build 参考表、build Step 3 | 待核对（外部技能，未随仓） |

## 维护约定

- 新增第三方引用时，在本清单对应类别补一行（来源 / 引用位置 / 许可状态）。
- 许可状态从 `待核对` 改为 `已知` 前，须实际核对来源 license，不凭印象标"已合规"。
- 本清单是**引用登记**，不是许可证授予；仓库自身 license 选择见 README 与后续单独决策。
