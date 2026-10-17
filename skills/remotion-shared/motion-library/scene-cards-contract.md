# 场景卡数据契约（Scene Cards Contract）— T1 tracer

> 目的：让 build **数据驱动**地组装画面——每句/每段口播对应一个 `cut`，`SceneRenderer` 按 `cut.type` 分发到对应场景卡，而不是每帧手写 SVG 动画。
>
> 许可边界（AGPL-3.0 clean-room）：本系统 clean-room 借鉴"数据驱动 `cut.type` → 场景组件分发"的**架构思路**（来源项目 calesthio/OpenMontage，AGPL-3.0，见 `docs/ATTRIBUTION.md`）；**未复制其任何源码或资产**，`scene-cards.tsx` 全部从零自写，随本仓 MIT。禁止把该项目代码 copy 进本仓（AGPL 强传染）。

## 一、契约（TypeScript）

正本 = `scene-cards.tsx` 的 `SceneCut` union。T1 只含 `stat`（StatCard）；T2/T3 按同一模式扩充——**每加一种 type = union 加一支 + SceneRenderer 加一个 case + 写一张卡**。

| cut.type | 场景卡 | 关键字段 | 状态 |
|----------|--------|---------|------|
| `stat` | StatCard | label / value / prefix / suffix / decimals / caption | T1 ✅ |
| `text` / `callout` / `comparison` / `hero` / `section` / `end` | TextCard / CalloutBox / ComparisonCard / HeroTitle / SectionTitle / EndTag | 各自 cut 字段（heading+body / title+body / left+right / title+subtitle / index+title / tagline+credit） | T2 ✅（#28） |
| `pie` / `kpi` / `bar` / `line` / `ring` | PieCard / KPIGrid / BarChartCard / LineChartCard / RingCard | slices / items / bars(value 0-100) / points / progress(0-1) | T3 ✅（#29）；Bar/Line/Ring **包装已有原语**（AnimatedBarChart/LineChartAnim/ProgressRing），Pie/KPI 新建 |

## 二、怎么用（build Step 4）

1. consult §8.2「视觉模式 = 纯卡」的句子，填该句的 `cut`（type + 字段）。
2. build：把 `<SceneRenderer cut={...} theme={...} />` 放进该句 `<Sequence>`，例如
   ```tsx
   <SceneRenderer
     cut={{ type: "stat", label: "蓝光散射 / 红光", value: 4.35, prefix: "≈", suffix: "×", decimals: 2 }}
     theme={{ accent: THEME.colors.accent, surface: "rgba(18,41,79,0.92)", monoFont: THEME.fonts.mono.family, labelFont: THEME.fonts.caption.family }}
     durationFrames={30}
   />
   ```
3. 颜色/字体走**项目 tokens**：通过 `SceneRenderer` 的 `theme`（`SceneCardTheme`）注入 `accent` / `surface` / `textColor` / `monoFont` / `labelFont`，SceneRenderer 转发给场景卡，**不写死**；不传则用卡内默认值。
4. 底层动效**复用已有原语**（StatCard 组合 `data-anim.tsx` 的 `AnimatedNumber`），不重写数字滚动。
5. 未知 `cut.type` → SceneRenderer **显式抛错**，绝不静默渲染空白。
6. **背靠背串联（T5）**：多张场景卡连续出现时，用 `scene-transition.tsx` 的 `<SceneTransitionSeries items={[...]} segmentFrames crossfadeFrames />` 交叉淡化串联，**不要**用相邻 `<Sequence>` 硬接——硬接会硬切 pop 且段首若干帧只剩平底背景（渐入空白）。crossfade 的 overlap 期 outgoing/incoming 透明度互补（和≈1），不露空底；首卡默认不渐入。零新增依赖。

## 三、验收（build Step 5）

场景卡是否正确渲染：抽**终态帧**，确认——① 数值/标签/单位齐全；② 对比度达底线（走 `frame_judge.py`，大字场景 ≥3.0）；③ 视觉模式 = 纯卡时，卡是主画面，不与背景场景图重叠（§8.2 视觉模式规则）。

## 四、边界

- 场景卡选型（用哪张、`cut` 编排）仍是 consult 的**设计决策**，不是自动套模板（守 anti-slop「模板只换字」红线）。
- T1 是**最小薄片**：只证明"契约 → 分发 → 卡 → 流程"整条链可跑通，不追求卡族齐全（那是 T2/T3）。
- 组件数：T1 新增 StatCard（场景卡类 1）+ SceneRenderer（分发入口），全仓"组件总数"由 88 → 89（见各 SKILL/注入点分析表述）。
