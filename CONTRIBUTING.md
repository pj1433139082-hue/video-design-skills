# 贡献指南 (Contributing Guide)

本仓库沉淀的是**视频设计交付技能**：`skills/remotion-consult/`（需求 → 视频设计系统）、
`skills/remotion-build/`（DESIGN.md → 代码与成片）、`skills/remotion-shared/`（两边的共享资源与契约）。

动手之前请先读：

- `AGENTS.md` —— 工作约定与质量底线：**在保持或提升质量的前提下减少无必要步骤**；
  静态检查不等于渲染成功或视觉验收。
- `README.md` —— 三个技能的职责边界、当前发布范围与开始使用方式。
- `docs/DEPENDENCIES.md` —— 哪些引用随仓提供、哪些属于外部依赖。
- `docs/HANDOFF-QWEN.md` —— 流程优化的交接口径。

---

## 1. 什么改动受欢迎

| 类型 | 例子 | 备注 |
| :--- | :--- | :--- |
| 文档一致性 | 失效路径、术语不统一、同一数字在多处各写一份 | 单源优先：同一事实只留一处正本，其余写引用 |
| 流程改进 | 合并冗余步骤、补上缺失的验收环节 | **前提是质量不降**，见 `AGENTS.md` |
| 依赖与溯源 | `docs/DEPENDENCIES.md`、`docs/ATTRIBUTION.md` | 第三方来源必须写清出处与许可状态 |
| 回归用例 | `skills/remotion-build/evals/` 的用例与 fixture | fixture 必须是**可公开的合成素材** |
| 缺陷修复 | 文档断言与实际不符、核查脚本报错 | 请附最小复现 |

---

## 2. 提交前必须跑的本地核查

仓库自带两个机械核查，**改完请都跑一遍**（在仓库根目录）：

```bash
# 1) 结构核查：技能卡片 frontmatter、仓库 YAML/JSON 可解析性、issue 表单字段
python3 .github/scripts/check_structure.py

# 2) 静态一致性核查：单源数字、查找顺序、组件数、eval 路径、依赖分类
bash docs/verification/consistency-checks.sh
```

> Windows 上把 `python3` 换成 `python`；`bash` 用 Git for Windows 自带的即可。

两个脚本都是**纯静态**的：它们不渲染、不做视觉验收。按 `AGENTS.md`，涉及全片节奏、
音画同步、渲染稳定性的断言必须由实际渲染/全片验证覆盖，**未运行的检查不写「通过」**。

CI（`.github/workflows/checks.yml`）会在 PR 上自动跑这两个脚本，其结果 `checks` 是
`main` 的必需状态检查——红了就合不进去。

---

## 3. 单源原则（最容易踩的坑）

以下事实**全仓只允许一处正本**，其余位置一律写成引用，不要复制数值或列表：

| 事实 | 正本 |
| :--- | :--- |
| 视频质量指标（字幕/标题/数据的字号字重等底线） | `skills/remotion-build/references/video-quality-metrics.md` |
| 共享库查找顺序 | `skills/remotion-shared/SKILL.md` |
| Video Design Tokens 字段契约 | `skills/remotion-shared/video-tokens-spec.md` |
| 镜头卡接入步骤 | `skills/remotion-shared/video-shots-spec.md` |

`docs/verification/consistency-checks.sh` 会机械核查其中几项，且它是按**文件计数**的：
**新增文件里出现这些标记词本身也会让它变红**（要引用请用路径，不要写标记词）。

---

## 4. 分支与提交

- 从最新 `main` 切分支：`docs/<topic>`、`fix/<topic>`、`chore/<topic>`。
- 提交信息用 Conventional Commits 风格，描述可用中文：
  `docs: ...` / `fix: ...` / `chore: ...`。
- 不要直接往 `main` 推：`main` 已开分支保护（禁强推、禁删除、必需 `checks` 通过）。

---

## 5. Pull Request

1. 推送分支后开 PR，**按 `.github/pull_request_template.md` 逐项填写**
   （变更描述 / 关联 Issue / 变更类型 / 自查清单 / 验证证据 / 质量对照）。
2. 相关工单一律挂在 **Spec #1** 下面（见 issue #1 与 `ready-for-agent` 标签）。
3. 「验证证据」表里写**实际执行的命令与结果**；没跑的检查写「未运行」和原因。
4. 等 `checks` 变绿后再请维护者合并；合并方式为 **squash**。

---

## 6. 不要提交的内容

- 真实客户/项目素材，以及生成媒体（`*.mp4` / `*.mov` / `*.webm` / `*.mp3` / `*.wav`）；
- 凭据、Token、账号设置、内网地址与本机绝对路径；
- 未经确认可公开的第三方资源（字体、音效、模板、参考站内容等）。

`.gitignore` 已覆盖常见项；eval 的 fixture 请使用合成素材（示例见
`skills/remotion-build/evals/fixtures/sample-brand-minimal/`）。

---

## 7. 语言与安全

- 仓库文档默认中文；`skills/` 内部文件名与代码标识符保持 ASCII，与既有约定一致。
- 安全问题（疑似凭据泄漏、私有素材误提交等）请走 `SECURITY.md`，**不要开公开 issue**。
