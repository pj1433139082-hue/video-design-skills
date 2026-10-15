## 变更描述 (Summary & Motivation)

<!-- 说明此 PR 解决了什么问题、改动了哪条流程或文档，以及为什么这样改。 -->

## 关联 Issue (Related Issue)

<!-- 使用 GitHub 关键字自动关联，例如 Closes #12 / Refs #1。相关工单一律挂在 Spec #1 下。 -->

## 变更类型 (Type of Change)

- [ ] 📝 **文档一致性**（单源化、术语统一、失效路径修正；Spec #1 批次 1）
- [ ] 🔀 **流程改动**（consult Phase / build Step 的步骤合并或拆分；Spec #1 批次 2）
- [ ] 📦 **依赖与合规**（DEPENDENCIES.md / ATTRIBUTION.md；Spec #1 批次 3）
- [ ] 🧪 **回归与用例**（evals.json fixture 化、短案例 walkthrough；Spec #1 批次 4）
- [ ] 🎬 **动效库与共享资源**（motion-library / presets / tokens / 类别模板）
- [ ] 🔧 **CI 与仓库工程**（.github/、仓库设置、核查脚本）
- [ ] 🐛 **缺陷修复**

## 变更自查清单 (Checklist)

- [ ] **单源未被重新引入**：涉及「视频铁律」字号字重、共享库查找顺序、动效库组件数的改动，已确认正本只有一处、其余为引用式表述。
- [ ] **技能卡片未被破坏**：`skills/*/SKILL.md` 的 YAML frontmatter 完整，`name` 与目录名一致，`description` 非空（由 `.github/scripts/check_structure.py` 核查）。
- [ ] **静态核查已运行**：本地执行 `bash docs/verification/consistency-checks.sh` 通过；若该 harness 尚未随仓提供或本次不适用，已在下方「验证边界」写明。
- [ ] **验证边界已声明**：明确列出哪些检查实际运行、哪些**未运行**。按 `AGENTS.md`，静态检查不等同于渲染成功或视觉验收。
- [ ] **质量未下调**：没有通过放宽阈值、删除设计决策点、跳过风格样张审批或省略验收来减少步骤。
- [ ] **文档语言与路径**：文档默认中文；新增或修改的引用使用相对查找顺序表述，不写入本机绝对路径或客户端专有路径。
- [ ] **无私有资产泄漏**：未包含真实私有素材、生成媒体、凭据、账号设置或内网路径。
- [ ] **CHANGELOG 已同步**：对外可见的改动已在 `CHANGELOG.md` 追加条目。

## 验证证据 (Verification Evidence)

<!-- 贴出实际执行的命令与结果；未执行的检查请在此明确写「未运行」及原因。 -->

| 检查 | 命令 | 结果 |
| --- | --- | --- |
|  |  |  |

## 质量对照 (Quality Comparison)

<!-- 涉及流程改动的 PR 必填：优化前 vs 优化后，在内容准确性 / 视觉设计与可读性 / 节奏与动效 / 音画同步 / 交付完整度五个维度上的对照。纯文档或纯工程改动可写「不适用」。 -->
