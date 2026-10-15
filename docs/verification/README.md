# 静态一致性核查（verification harness）

本目录是 spec #1 的 seam 1（静态一致性核查），由 ticket #3 建立。它把"每个单源数字只出现一次、查找顺序表述一致、组件数一致、对比度带映射、eval 路径匹配仓库布局、维护者本地路径都有 DEPENDENCIES 分类"这些断言变成机械可查的命令。

## 运行

```bash
# 仓库根目录
bash docs/verification/consistency-checks.sh
```

退出码 0 = 全部 PASS；1 = 有 FAIL。每项输出 PASS/FAIL 及命中文件，便于定位。

## 检查维度

| # | 维度 | 规则 | 对应 ticket |
|---|------|------|-------------|
| 1 | 铁律数字单源 | "视频铁律" 仅出现于 video-quality-metrics.md（1 文件） | #5 |
| 2a | 查找顺序单源 | "查找顺序" 仅出现于 remotion-shared/SKILL.md | #4 |
| 2b | 去客户端专有名 | 无 "全局 Codex / Claude Code" 残留 | #4 |
| 3 | 参考表相对路径 | consult/build 无 `.claude/skills/remotion-shared` 硬路径 | #4 |
| 4a | 组件数去错误值 | 无 "80 组件 / 80 个里挑" 残留 | #6 |
| 4b | 组件数一致 | "XX 个组件" distinct 值 ≤1 | #6 |
| 5 | 对比度映射 | metrics 含 字幕=大字3:1 / 正文mono=4.5:1 映射 | #5 |
| 6 | eval 路径 | evals.json 无 `.claude/skills` 与 `工作台/` | #11（blocked，等素材） |
| 7 | 依赖分类 | DEPENDENCIES.md 含 必需/可选/仅维护者本地 三类 | #7 |

## 改前基线（2026-10-15，ticket #3 建立时）

在未实施 #4-#9 前运行，结果为 **PASS=1 FAIL=8**：检查 4b 已 PASS（"50 个组件" 是唯一 `XX 个组件` 表述），其余 8 项 FAIL，分别由 #4（2a/2b/3）、#5（1/5）、#6（4a）、#7（7）修复；检查 6（eval 路径）由 #11 修复，#11 当前 blocked on 维护者素材决策。

## 纪律

- **静态核查不等于渲染成功或视觉验收**（AGENTS.md / HANDOFF-QWEN.md）。涉及全片节奏、音画同步、渲染稳定性的断言须由动态/全片验证覆盖——即 seam 3 短案例 walkthrough（ticket #10/#14），本脚本不替代它。
- **未运行的检查不写通过**。本脚本只断言文档一致性，不断言任何视频产出质量。
- 本脚本落 `docs/verification/`，不进 `skills/*`，不改任何技能流程步骤。
