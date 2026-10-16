---
name: remotion-shared
description: remotion-consult / remotion-build 的共享资源库，不是独立触发技能。当需要视频设计预设 tokens、总动效库（95 个组件）、审美参考、镜头与 tokens 规范、"分阶段注入矩阵"时读取本目录。用户说"做个视频/改视频方向"时不触发本卡片，触发面在 remotion-consult / remotion-build 的 SKILL.md。
---

# remotion-shared — Remotion 视频共享资源库（非独立技能）

本目录是 `remotion-consult` / `remotion-build` 的**共享数据层**：只有可引用资源，没有自己的执行步骤与产出契约。
按 ADR-0016 的单点职责，执行步骤与产出契约归两个消费技能的流程正本；本文件只作触发面与入口索引。

## 查找顺序（消费方硬约定）

1. 全局唯一源：`~/.agents/skills/remotion-shared/`
2. 项目级兼容：`.claude/skills/remotion-shared/`（本副本）

## 内容

| 路径 | 用途 |
|------|------|
| `注入点分析.md` | 分阶段注入矩阵：consult Phase 1-5 / build Step 1-5 各阶段注入什么、从哪里、力度（强/参考） |
| `video-design-presets.md` | 6 套已验证品牌风格浓缩 tokens（consult Phase 4 选定后一次性继承） |
| `video-tokens-spec.md` | 视频版 design tokens 规范（网页 DESIGN.md 必须映射，禁止原样套用） |
| `motion-library/` | 总动效库 95 个组件（转场 26 / 入场 22 / 背景 26 / 数据 6 / 文字 6 / 字幕 2 / 场景卡 7），build Step 4 直接 import |
| `categories/` | 按视频类别注入：voiceover-caption / data-viz / product-demo / brand-motion |
| `aesthetic-judgment/` | 审美判断规则（12 原则对照：anticipation / overshoot / staging 等） |
| `video-anti-slop.md` | 视频反 AI-slop 清单 |
| `video-real-library.md` | 真实视频参考库 |
| `video-shots-spec.md` | 镜头规范（shot list 与运镜语言） |

## 消费方

- `remotion-consult` — Phase 2/3 参考注入（审美参考库 + 设计系统库 + presets），Phase 4 强注入（继承预设 tokens + 剪辑节奏）
- `remotion-build` — Step 2 参考（从动效库挑组合），Step 4 强注入（import 组件 + 素材摄影风格词），Step 5 参考（12 原则验收）

## 相关

- 全局源副本：`~/.agents/skills/remotion-shared/`
- 上游资料：`资料库/AI工具/设计系统库/`（13 品牌）、`资料库/AI工具/审美参考库/审美参考总览.md`
- 技能清册见 [[智能体管家/50-参考层/60-技能索引]]
