#!/usr/bin/env bash
# 静态一致性核查 harness（ticket #3 / spec seam 1）
# 用途：把"每个单源数字只出现一次、查找顺序表述一致、组件数一致、对比度带映射、
#       eval 路径匹配仓库布局、维护者本地路径都有 DEPENDENCIES 分类"这些断言
#       变成机械可查的命令，供 #4-#9 文档一致性 ticket 自验，也供审查者一键复现。
#
# 运行：在仓库根目录执行  bash docs/verification/consistency-checks.sh
# 退出码：0 = 全部 PASS；1 = 有 FAIL。
#
# 纪律（来自 AGENTS.md / HANDOFF-QWEN.md）：
#   静态核查不等于渲染成功或视觉验收。涉及全片节奏、音画同步、渲染稳定性的断言
#   须由动态/全片验证覆盖（seam 3 短案例 walkthrough），本脚本不替代它。
#   未运行的检查不写通过。

set -u
cd "$(git rev-parse --show-toplevel 2>/dev/null || echo .)"

PASS=0
FAIL=0
RESULTS=()

ok()   { PASS=$((PASS+1)); RESULTS+=("PASS  $1"); }
bad()  { FAIL=$((FAIL+1)); RESULTS+=("FAIL  $1"); }
note() { RESULTS+=("NOTE  $1"); }

SKILLS="skills"
METRICS="skills/remotion-build/references/video-quality-metrics.md"
SHARED_SKILL="skills/remotion-shared/SKILL.md"
CONSULT_SKILL="skills/remotion-consult/SKILL.md"
BUILD_SKILL="skills/remotion-build/SKILL.md"
EVALS="skills/remotion-build/evals/evals.json"
DEPS="docs/DEPENDENCIES.md"

# ---- 检查 1：字幕铁律数字单源（"视频铁律"只应在 metrics 出现一次）----
# 方案 A：metrics.md 为唯一数字源，consult 红线 / DESIGN 模板 / tokens 契约 / 类别模板改引用式表述。
n=$(grep -rl "视频铁律" "$SKILLS" 2>/dev/null | wc -l | tr -d ' ')
if [ "$n" = "1" ] && grep -q "视频铁律" "$METRICS" 2>/dev/null; then
  ok "1 铁律单源：'视频铁律' 仅出现于 metrics（1 文件）"
else
  bad "1 铁律单源：'视频铁律' 出现于 $n 个文件（应=1，仅 metrics）；命中：$(grep -rl '视频铁律' "$SKILLS" 2>/dev/null | tr '\n' ' ')"
fi

# ---- 检查 2：共享库查找顺序单源 ----
# 方案 A：shared/SKILL.md 为查找顺序正本；consult/build 引用它，不再各自重述；
#         客户端专有词（全局 Codex / 全局 Claude Code）应消失。
n_order=$(grep -rl "查找顺序" "$SKILLS" 2>/dev/null | wc -l | tr -d ' ')
if [ "$n_order" = "1" ] && grep -q "查找顺序" "$SHARED_SKILL" 2>/dev/null; then
  ok "2a 查找顺序单源：'查找顺序' 仅出现于 shared/SKILL.md"
else
  bad "2a 查找顺序单源：'查找顺序' 出现于 $n_order 个文件（应=1，仅 shared）；命中：$(grep -rl '查找顺序' "$SKILLS" 2>/dev/null | tr '\n' ' ')"
fi
n_client=$(grep -rn "全局 Codex\|全局 Claude Code\|全局Codex\|全局Claude" "$SKILLS" 2>/dev/null | wc -l | tr -d ' ')
if [ "$n_client" = "0" ]; then
  ok "2b 查找顺序去客户端专有名：无 '全局 Codex/Claude Code' 残留"
else
  bad "2b 查找顺序去客户端专有名：仍有 $n_client 处 '全局 Codex/Claude Code'"
fi

# ---- 检查 3：参考文件表不再用客户端专有硬路径 ----
# 方案 A：consult/build 参考表用查找顺序无关的相对表述（remotion-shared/xxx），不用 .claude/skills/remotion-shared/xxx。
n_hard=$(grep -rn "\.claude/skills/remotion-shared" "$CONSULT_SKILL" "$BUILD_SKILL" 2>/dev/null | wc -l | tr -d ' ')
if [ "$n_hard" = "0" ]; then
  ok "3 参考表相对路径：consult/build 无 .claude/skills/remotion-shared 硬路径"
else
  bad "3 参考表相对路径：consult/build 仍有 $n_hard 处 .claude/skills/remotion-shared 硬路径"
fi

# ---- 检查 4：动效库组件数一致 ----
# 方案 A：全仓统一到实际组件数（或统一为"见 index.ts"）；错误数字 80 应消失；"XX 个组件" 只剩一个 distinct 值。
n_80=$(grep -rn "80 组件\|80 个里挑\|（80 组件\|(80 组件" "$SKILLS" 2>/dev/null | wc -l | tr -d ' ')
if [ "$n_80" = "0" ]; then
  ok "4a 组件数去错误值：无 '80 组件' 残留"
else
  bad "4a 组件数去错误值：仍有 $n_80 处 '80 组件/80 个里挑'"
fi
distinct_counts=$(grep -rhoE "[0-9]+ 个组件" "$SKILLS" 2>/dev/null | sort -u | wc -l | tr -d ' ')
if [ "$distinct_counts" -le 1 ]; then
  ok "4b 组件数一致：'XX 个组件' distinct 值 = $distinct_counts（≤1）"
else
  bad "4b 组件数一致：'XX 个组件' 有 $distinct_counts 个不同值：$(grep -rhoE '[0-9]+ 个组件' "$SKILLS" 2>/dev/null | sort -u | tr '\n' ' ')"
fi

# ---- 检查 5：对比度口径带"字幕=大字"映射 ----
# 方案：metrics.md 含 caption→WCAG 大字(3:1) / 小字 mono·正文→4.5:1 的映射行。
if grep -qE "字幕.*(大字|3:1|3\.0)" "$METRICS" 2>/dev/null && grep -qE "(正文|mono|body).*4\.5" "$METRICS" 2>/dev/null; then
  ok "5 对比度映射：metrics 含 字幕=大字3:1 / 正文4.5:1 映射"
else
  bad "5 对比度映射：metrics 缺 '字幕=大字3:1 / 正文mono=4.5:1' 明确映射行"
fi

# ---- 检查 6：eval 路径匹配仓库布局 ----
# evals.json 不应含 .claude/skills（仓库布局是 skills/）或 工作台/（维护者本地）。
n_eval=$(grep -cE "\.claude/skills|工作台/" "$EVALS" 2>/dev/null | tr -d ' ')
if [ "$n_eval" = "0" ]; then
  ok "6 eval 路径：evals.json 无 .claude/skills 与 工作台/ 路径"
else
  bad "6 eval 路径：evals.json 仍有 $n_eval 行含 .claude/skills 或 工作台/（ticket #11 修，当前 blocked）"
fi

# ---- 检查 7：DEPENDENCIES 含引用点分类表 ----
# 方案 A：DEPENDENCIES.md 含 必需/可选/仅维护者本地 三类 + 消费者替代方案。
if grep -q "仅维护者本地" "$DEPS" 2>/dev/null && grep -q "必需" "$DEPS" 2>/dev/null && grep -q "可选" "$DEPS" 2>/dev/null; then
  ok "7 依赖分类：DEPENDENCIES.md 含 必需/可选/仅维护者本地 三类"
else
  bad "7 依赖分类：DEPENDENCIES.md 缺 必需/可选/仅维护者本地 分类表（ticket #7 修）"
fi

# ---- 输出 ----
echo "==== 静态一致性核查 ===="
for r in "${RESULTS[@]}"; do echo "$r"; done
echo "------------------------"
echo "PASS=$PASS  FAIL=$FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo "结论：存在未修复的一致性问题（见上 FAIL 项）。静态核查不等于渲染成功；流程行为改动须由短案例 walkthrough 动态验证。"
  exit 1
fi
echo "结论：全部静态一致性检查通过。"
exit 0
