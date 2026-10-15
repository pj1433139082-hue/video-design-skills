# 视频镜头配方卡（Video Shots Spec）

> **video-shotcraft = 第二动效库 / 模板库**（已 clone 到 `资料库/AI工具/video-shotcraft/` 并 junction 注册为 skill：`.claude/skills/video-shotcraft`）：`demos/` 12 类镜头配方卡（每卡 = 场景级镜头动效 demo TSX，含运镜/节奏/转场/字体/特效/数据/首尾/UI 交互）+ `template/` 完整模板工程 + `assets/` 组件库与音效 + `references/` 流程文档。本规范说明如何把它**并入 consult→build 当动效库用**，并提炼权威技巧（搜索引擎 + 平台 2026-08-16）。

> **接入定位（组件库，不分流）**：所有视频统一走 consult→build，**不按产品片/口播片路由到 shotcraft**。build 像从总动效库 copy 组件一样从 `shotcraft/demos/{类}/{卡}/{组件}.tsx` copy 镜头卡（改 `_fixtures` import + `ACCENT` + `DesignStage` 480×270 等比放大；6 卡需 `@remotion/motion-blur`，名单见 demos/README.md）。只有用户**点名**要用 shotcraft 模板（Ink Press）/ 自主自由创作 / 共同创作 时，才 Skill 触发 `video-shotcraft` 按其自身流程走。

## 一、镜头卡体系（借鉴 shotcraft，何时用什么）

shotcraft `demos/` 12 类 202 张卡（每卡 = 一个场景级镜头动效，归一化 t 驱动确定性）：

| 类 | 看什么 | 何时用 |
|----|--------|--------|
| **camera**（运镜） | 推拉摇移 / 3D 场景 / 俯冲 / 张力运镜 | 想有空间运镜感（产品片核心） |
| **rhythm**（节奏） | 变速 / 卡点 / 冻结 | 音乐卡点 / 节奏强调 |
| **transition**（转场） | 甩镜 / 隐藏切 / 擦除 | 场景切换（进阶转场） |
| **typography**（字体） | 字距 / kinetic / 扫光 | 大字记忆点 |
| **effects**（特效） | 光效 / 粒子 / 毛刺 | 氛围增强 |
| **interaction / ui-entrance** | 交互 / UI 入场 | 产品 UI 展示 |
| **opening / outro** | 片头 / 片尾 | 首尾 |
| **data** | 数据动效 | 数据可视化片 |

**用法**：动效编排大纲 §8 按需选卡（可选）—— copy `demos/{类}/{卡名}/{组件}.tsx` 进项目（30fps/1920×1080），改 `_fixtures` import 路径 + `ACCENT` 强调色变量 + 中性占位文案。**用卡先读准确源码**（不凭卡名假设结构），改合成分辨率用 `DesignStage`（480×270 设计坐标等比放大）不动参数。

> **适配性（2026-08-16 实测）**：shotcraft 镜头卡多为**英文占位**（SVG 字形表只英文字母，如 letterspace/gradient-word-sweep 的 SUPERHUMAN/performance）或**产品 UI 卡**——**中文口播科普片直接 copy 需重做字形/文案，成本高**。中文片建议：借镜头卡的**动效思路**（运镜/扫光/聚光/字距）用总动效库/原生实现；**产品/品牌/英文片直接 copy 卡**。**选卡必读源码，不凭卡名猜**（实测教训）：`effects/spotlight-sweep-moves` 名字像"聚光扫过大字"，实际 3 变体全是 **UI 面板向**（CornerSpotlightReveal= mask 显影 UI / SlideSpotlightPan= ClickUp 面板）——不适合中文大字强调；`effects/glow-flyline-moves/GlowOrbAmbient` 才是**纯光斑背景**（只依赖 remotion 原生、无 _fixtures 依赖、seed 确定性），可直配中文背景层重蒙皮（改底色+光斑色+删 fake 卡）即用。

### 可叠加 vs 主画面卡（2026-08-16 实测：卡动效叠场景图会重叠/意义不明）

叠加到场景图的卡**只选"透明效果层"**（光效/粒子/渐变/扫光层，无独立背景、无完整主体）；有**完整画面/背景**的卡（里程表滚动/表盘/粒子柱/聚光暗场/面板类）**绝不叠在场景图上**，二选一：
- **卡当主画面**：去掉场景图，卡自带背景即画面（S6 聚光暗场 / S7 里程表）；
- **或纯场景图+字**：不用卡，场景图已表达语义（S1/S3/S5/S8/S11）。
- **场景图+透明效果层**：仅光效/粒子/扫光层可叠加（如渐变扫光叠大字），且效果层不盖场景主体。

选卡先判断**视觉独立性**：透明层可叠，完整画面不叠。DESIGN §8 每句填「视觉模式」三选一，防止"两张皮"重叠 + 动效意义不明。

DESIGN §8.2 镜头卡列格式：`类/卡名` + 意图标记，如 `camera/steep-tilt-glide [copy]` 或 `typography/gradient-word-sweep [借思路]`。build 照标记执行（consult 没写标记时，build 按卡适配性自动判：产品/品牌/英文 → copy，中文口播/科普 → 借思路）。

**`[copy]`（产品/品牌/英文片，或用户点名要该卡效果）**：
1. **定位 demo**：按卡内"参考实现"字段拿准确 demo 路径 copy 进 `src/components/shots/`（不凭卡名猜目录）；可选先经 `shotcraft/gallery/api/library.json` 校验卡名存在。
2. **读卡全文**（推荐）：`references/shots/` 该卡 frontmatter（语义/参数表/已知坑），卡上"已知坑/命门"参数不得降档。
3. **适配**：改 `_fixtures`/`Motion.tsx` import 路径 + `ACCENT` 强调色 + 中性占位文案。Motion 系卡用 `DesignStage`（480×270 设计坐标等比放大）配套 `_fixtures/Motion.tsx` 一并 copy；需 `@remotion/motion-blur` 的 6 卡先 `npm i @remotion/motion-blur`（名单 demos/README.md）。

**`[借思路]`（中文口播/科普片默认）**：卡名仅作动效思路参考（运镜/扫光/聚光/字距），用总动效库组件/原生实现，不 copy TSX。纯光效卡（聚光灯/光斑，不依赖文字）可直配中文片 copy。

## 二、权威技巧提炼（搜索 2026-08-16）

### 导演 / 分镜
- **景别递进**：一组镜头按 全→中→近→特 递进，信息由远及近（传统剪辑基本功）。
- **镜头时长节奏**：紧张场景 = 短镜头快切；情感/细腻场景 = 长镜头慢切（节奏 = 镜头长度处理）。
- **运镜**：推 / 拉 / 摇 / 移 / 升 / 俯冲；组合公式（如"前推上摇"）；运镜卡点用关键帧曲线（剪映/PR 实操）。
- **轴线/空间**：动作方向、空间关系一致，防混乱。

### 剪辑
- **动接动 / 静接静**：镜头切换以动作形态、节奏为剪辑点。
- **变速卡点**：关键动作变速（慢放强调 / 快切卡点）。
- **隐藏切 / 甩镜转场**：镜头间自然过渡（shotcraft transition 卡：whip-pan / invisible-cut）。

### 设计 / 排版
- 构图多样不每场居中（§5 硬规则：16:9 左右分栏 / 9:16 上下分层）。
- 字体动效：字距展开 / 扫光 / kinetic type（shotcraft typography 卡）。

### 声音（SFX 卡点）
- 音效锚定动作 / 转场 / 字幕词（情绪词触发强调音）。
- 音乐节奏点：画面切换对齐节拍（shotcraft sfx 库 16 类，bgm/sfx 分层）。

## 三、与现有体系关系

- **总动效库**（`_动效库`，组件级：转场/入场/背景）→ **镜头卡**（shotcraft，场景级配方：运镜+节奏+字体组合）。
- **动效编排大纲 §8**：每句 = 选镜头卡 + 素材进出场 + 字体动效 + 口播联动（三来源合成：总动效库组件 + shotcraft 镜头卡 + mmx 素材）。

## 四、B站技巧提取（可复用）

- 搜平台技巧：`agent-reach` B站通道（bili-cli 搜索）+ `资料库/AI工具/bilibili-subtitle-extractor.py <BV号> --whisper -o out.txt`（browser_cookie3 保持登录态提取字幕 → 汇总技巧）。
- 权威技巧搜索：`python scripts/search/search_engine.py "视频技巧 关键词"`。
