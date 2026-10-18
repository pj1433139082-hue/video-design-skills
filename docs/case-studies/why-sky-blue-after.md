# 《为什么天空是蓝的》优化后五维对照（#14 · HANDOFF-QWEN 验收口径收口）

> 口径：同案例、同输入（`public/captions.srt` / `audio/s1-s5.mp3` / `img/s1-s5.jpg` 不变）。
> **before** = `out/final.mp4`（motion-design 版，场景卡系统接入前，PR #26 记录）；
> **after** = `out/final-scenecards.mp4`（场景卡系统重做版，734 帧 / 24.512s）。
> 所有结论附实测证据；未实测项显式标注，不冒充通过。本文件不改 skills/*。

## 一、五维质量对照

| 维度 | before（final.mp4） | after（final-scenecards.mp4） | 判定 |
|------|--------------------|------------------------------|------|
| ① 内容准确 | 脚本/srt 一致；缺"蓝光散射≈红光 4.35×"数据卡与"为什么不是紫色"要点 | 同脚本；**补 stat 数据卡（≈4.35×，字段齐全）+ callout（为什么不是紫色）+ end 卡**（抽帧 v_13/v_18/v_19 对账一致） | after ↑ |
| ② 视觉/可读 | 整句字幕 + 写死底部 scrim | **逐词字幕**（中文预分词，"天空/为什么/染红/天际"逐词点亮实证）+ **自适应衬底**（分段 bgLightness）；卡段字幕对比 **12.41≥3.0 PASS** | after ↑ |
| ③ 节奏/动效 | 自定义光谱/散射动画 + 连续背景层 crossfade（真 motion，非轮播） | 保留全部自定义动效 + **场景卡入场/数字滚动/卡间 crossfade**；gap 窗口逐帧差分 YAVG **1.236≥0.10**（连续底在动）、整片 YAVG 均值 **0.587≥0.05**（非轮播） | after ↑ |
| ④ 音画同步 | audio_sync 5/5 OK、0 静音（基线已验） | audio_sync **5/5 OK、0 静音**（新片复测） | 持平 |
| ⑤ 交付完整 | mp4 + 部分门禁（四技能未跑，标"非合规交付"） | mp4 + **逐条门禁台账式报告**（5.1–5.10/层1/符合性 逐行证据）+ 过程缺陷修复记录（word 字幕整篇同显、句尾滞留 gap） | after ↑ |

**回归检查**：五维无一项回退（④ 持平、其余 ↑）→ 满足 #14"质量不得回退，回退先修"。

## 二、消耗指标（after-run 实测）

| 指标 | 数值 | 说明 |
|------|------|------|
| 工程 init 次数 | **1** | 案例工程唯一一次 init（node_modules junction 复用）；重做全程复用，未二次 init（#13 目标达成） |
| 全片 render 次数 | 2 | 首渲 + 字幕缺陷修复后重渲（734 帧/次） |
| 抽帧/提取帧数 | 2(sanity) + 3(chk) + 21(Step5) + 2(crossfade) = **28** | 其中 sanity/chk 3 帧复用为 Step5 证据（#13 抽帧复用）；Step5 仅补抽未覆盖 beat |
| 需求对齐问答轮数（模式4） | **0** | DESIGN.md 七段+§8+tokens 字段齐全（干跑扫描缺失=0），复用决策不重问（#12 目标达成） |
| 总耗时 | **未精确计量** | 未埋点；仅记录 render/抽帧次数。不编造时长。 |

## 三、门禁台账（after 片，摘要；完整见会话报告）

| 门禁 | 状态 | 证据 |
|------|------|------|
| 5.1 compositions | PASS | WhySkyBlue 30fps 1080×1920 734 |
| 5.2 抽帧覆盖 | PASS | 21 帧：句首/句尾/呼吸gap/卡/转场/句中 |
| 5.3 字幕对齐 | PASS | 句首有字幕、gap 无字幕、句尾按 srt ms 消失 |
| 5.4 frame_judge | PASS | gap 空帧全 PASS；卡段对比 12.41 |
| 5.5 checklist | PASS（vision 抽样） | v_01/chk40/v_12/v_18/v_19 |
| 5.6 遮挡/视觉模式 | PASS | 卡为纯卡段不叠照片；字幕不压主体 |
| 5.7 四技能审查 | **PASS** | 第四轮独立子智能体四审（技能已装齐：hallmark/ui-ux-pro-max 预装 + taste-skill junction + open-design wrapper）：hallmark **15/15=100%**（≥90%）、taste-skill **16/16=100%**（≥85% 且 Color/Shape/Theme/Contrast 各 Lock 全过）、ui-ux-pro-max **关键项全过**（橙/盒 5.06–5.47:1）、open-design **0 罪 0 fail**（§8.2 对账全 PASS、补证闭合） |
| 5.9 动作证明 | PASS | gap YAVG 1.236、动效窗口 0.996、crossfade 帧见混合 |
| 5.10 音画同步 | PASS | 5/5 OK 0 静音 |
| 层1 layout_calc | WARN（已知保守） | s1/s4 均匀天空"顶部侵入"保守判定（基线已记录），s5=0 |
| DESIGN→build 符合性 | PASS | stat/callout/end 三卡字段与规划对账一致 |

**定性：合规交付**（门禁台账全 PASS，含 5.7 四技能审查第四轮全过；按 #21 runbook §四，全 PASS 方可标合规）。

## 四·五、5.7 修复轮次记录（FAIL→修→复审，逐轮证据）

| 轮 | 四审结果 | 发现 | 修复 |
|----|---------|------|------|
| R1 | hallmark 96.6% PASS / taste 94.1% PASS / **ui-ux FAIL** / open-design PASS | 字幕换行孤字+拆词（"色。"/"射。"独占二行） | WordLine 按标点断行 |
| R2 | hallmark 88% **FAIL** / taste **FAIL**(Lock) / ui-ux **FAIL** / open-design **FAIL** | ① 照片帧橙高亮 2.0–2.24:1<3:1；② a_05 金色 λ 注=第二 accent；③ S5 卡段缺晚霞与 §8 脱节；④ S1 缺 §8.2 声明大字；⑤ s4 payoff 被粒子盖住；根因另含 **s1.jpg 自带浅蓝 matte 边框** | 字幕加半暗盒底；λ 注改橙；SunsetGlow 延至 734；S1 补 hook 大字；粒子 70→40/opacity .55；**裁掉 s1 matte**（备份 s1-original.jpg） |
| R3 | hallmark 95.5% PASS / taste **FAIL**(Lock) / ui-ux **FAIL** / open-design PASS | S1 hook kinetic 未落位字=金色（第二 accent）且亮照片上 1.26–1.6:1；DESIGN §2 与 build 漂移 | kinetic 加半暗盒底 + active 改橙 + inactive 改半透白；DESIGN §2/§7/§8.3 对齐 word+橙+盒底 |
| R4 | **hallmark 100% / taste 100% / ui-ux 全过 / open-design 0罪0fail** | —（观察项：DESIGN 残留漂移已闭合） | 升级定性为合规交付 |

## 五、结论

场景卡系统（#27/T1–T7）+ 字幕/衬底/门禁补强（#42/#21）落地后，同案例同输入下五维质量**无回退、四维提升**，消耗侧 init=1、模式4 对齐 0 问、抽帧复用生效，达成 #12/#13/#14 的验收口径。5.7 四技能审美门禁已装齐并经四轮独立审查全过（R4：hallmark 100% / taste 100% / ui-ux 关键项全过 / open-design 0罪0fail），本片定性升级为**合规交付**；修复轮次与证据见 §四·五。
