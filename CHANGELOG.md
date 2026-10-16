# Changelog

## 2026-10-16 — 仓库自身许可证（MIT）

- 新增根目录 `LICENSE`：MIT，`Copyright (c) 2026 video-design-skills contributors`，与同名姊妹仓 `learn-model-framework`、`agent-workflow-framework` 的许可保持一致。
- 前置条件已满足：Spec #1 的 #9（第三方来源清单）已完成关闭，`docs/ATTRIBUTION.md` 已按类别逐项标注 `已知`/`待核对`，因此这次能写清许可边界——本仓**原创文本与源码适用 MIT**，清单中的第三方引用**各自保留原有许可**，不因被引用而适用 MIT。
- 同步修正此前两处「暂不添加许可证 / 属单独决策」的表述：`README.md` 新增「许可证」节并指向 `LICENSE`；`docs/ATTRIBUTION.md` 的边界声明与「维护约定」由「单独决策」改为已定案。此前记在本文件「贡献者行为准则」条目里的「仍未新增 `LICENSE`」由本条取代。
- 未改动任何第三方引用的许可状态：`待核对` 保持 `待核对`，不因本仓加了 `LICENSE` 就改标 `已知`。

## 2026-10-15 — 贡献者行为准则

- 新增根目录 `CODE_OF_CONDUCT.md`：Contributor Covenant 2.1 的中文版（含四档执行阶梯），上报渠道与 `SECURITY.md` 一致，使用维护者邮箱 `pj1433139082@gmail.com`。
- 该文件明确写出**本仓库未启用 GitHub Private vulnerability reporting**，因此不存在 GitHub 内的私密通报入口——沿用 PR #20 的事实口径，避免再次写出与实际不符的通道。
- `CONTRIBUTING.md` 的「动手前必读」后补一行，指向 `CODE_OF_CONDUCT.md` 与 `SECURITY.md`。
- **仍未新增 `LICENSE`**：统一许可须待 Spec #1 的 #9（第三方来源清单）完成后决定，见下方 2026-10-15「贡献与安全政策」条目。

## 2026-10-15 — 修正 SECURITY.md 的上报通道说明

- PR #19 曾在 `SECURITY.md` 里断言 `/security/advisories/new`「会返回 404」。**该断言是错的**：以维护者身份实际打开该页面会正常渲染草稿公告页（维护者始终可见），因此不能据此判断外部报告者也能用。
- 事实复核：`GET /repos/pj1433139082-hue/video-design-skills/private-vulnerability-reporting` → `{"enabled": false}`，即 **Private vulnerability reporting 未启用**，外部报告者看不到「Report a vulnerability」按钮。
- 已按事实改写该节（并说明维护者可见 ≠ 报告人可用），同时修正本 Changelog 中同源的错误表述。邮箱渠道不变。

## 2026-10-15 — 贡献与安全政策

- 新增根目录 `CONTRIBUTING.md`：两个机械核查的跑法、单源正本清单、分支 / 提交 / PR 约定、不提交内容清单。
- 新增根目录 `SECURITY.md`：支持的版本、已启用的仓库保护（secret scanning / push protection / `main` 分支保护），以及**邮箱上报渠道**——本仓库未启用 GitHub Private vulnerability reporting，外部报告者看不到「Report a vulnerability」入口。
- 未新增 `LICENSE` 与 `CODE_OF_CONDUCT.md`：第三方来源与许可清单仍在 Spec #1 的 #9 范围内，统一许可须待来源逐项核对后再决定。

## 2026-10-15 — eval 路径与 fixture 化（ticket #11）

- `skills/remotion-build/evals/evals.json` 的 `files` 与 prompt 路径改为仓内 fixture（`skills/remotion-build/evals/fixtures/sample-brand-minimal/`），不再指向维护者本机路径；技能路径统一为 `skills/remotion-*`，不再使用 `.claude/skills/` 前缀。
- 新增合成 fixture：3 句口播稿 + 逐句对齐的 SRT + 最小 DESIGN.md（含 Video Design Tokens 与场景蓝图）。品牌为虚构，不含任何真实素材，可随仓公开。
- 未使用 volta-brand 原始素材（其是否可公开由维护者另行决定）；**三个 eval 的实际运行与结论记录仍待补**，本条目不声称 eval 已通过。

## 2026-10-15 — 仓库协作工程配置

- 新增 issue 模板（缺陷反馈 / 能力提案 / 文档一致性）与 PR 模板，统一 Spec #1 的工单与验收口径。
- 新增 `checks` workflow：核查 `skills/*/SKILL.md` 的 frontmatter 与仓库 YAML / JSON 可解析性；`docs/verification/consistency-checks.sh` 随仓提供后自动纳入同一入口。
- 修复 issue 模板 contact link 的名称与说明被 YAML 注释截断（含 ` #` 的纯量必须加引号）；`check_structure.py` 增加对应机械核查，同类回归由 `checks` 拦住。
- 本批次只动 `.github/`，未改动任何技能流程、质量阈值或验收环节。

## 2026-10-15 — 明确优化目标

- 按用户补充，明确减少无必要步骤的前提是保持或提升质量。
- 补充质量对照验收口径，保留必要设计判断与验证，不以降低阈值或减少调用数作为优化成功依据。

## 2026-10-15 — 初始维护基线

- 导入已有实际视频产出的 consult / build / shared 技能目录。
- 将构建指南中的个人 Chrome 路径替换为示例路径。
- 增加仓库说明、依赖边界及千问办公流程优化交接。
- 本次未实施流程优化、环境安装、技能同步或视频渲染。
