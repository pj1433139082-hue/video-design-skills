# Remotion 构建技术规范（Build Guide）

> remotion-build Step 4 工程规范，非风格向。技术底线：确定性动画、tokens 引用、Chrome 路径配置、字幕驱动时长。

## 一、项目 init

**主推（复用已验证项目，免 npm install 网络）**：从 `工作台/视频/remotion-workflow-intro` 复制骨架 + node_modules：

```bash
mkdir -p 工作台/视频/{slug}/src/components
cd 工作台/视频/{slug}
cp ../../remotion-workflow-intro/package.json .
cp ../../remotion-workflow-intro/tsconfig.json .
cp ../../remotion-workflow-intro/remotion.config.ts .
cp -r ../../remotion-workflow-intro/node_modules .   # zod 已修到 4.4.3
cp ../../_动效库/*.tsx src/components/ && cp ../../_动效库/index.ts src/components/index.ts
# 注意：动效库 index 是 .ts 不是 .tsx，只 cp *.tsx 会漏
```

> **动效库唯一源**：`remotion-shared/motion-library/`（主源，被 git 跟踪）→ `工作台/视频/_动效库/`（工作副本，视频项目 import 用）。**改动效库只改主源**，改完跑 `bash scripts/sync_motion_library.sh` 同步工作副本（先 diff 后 cp）。不要双份手工改，会漂移。

**备选**：`npx create-video@latest --blank my-video` 或从 `_dev/remotion-tutorial` 复制（但需 `npm install` + 修 zod）。

**必须**：
- `remotion.config.ts` 写系统 Chrome 路径（网络受限环境）：
  ```ts
  Config.setBrowserExecutable("C:\\path\\to\\chrome.exe");
  ```
- 动效组件从 `工作台/视频/_动效库/` import（已复制到 `src/components/`），统一 `import { ... } from "./components"`。
- `captions.srt` 复制到 `public/`（`staticFile` 从 public 读）；配音 mp3 放 `public/audio/`。

**镜头卡接入（第二动效库，单一事实源 = `remotion-shared/video-shots-spec.md`「镜头卡接入步骤」）**：DESIGN §8.2 镜头卡列带意图标记（`[copy]` / `[借思路]`，consult 没写时 build 按卡适配性自动判）。`[copy]` → 按 spec 步骤从 `shotcraft/demos/{类}/{卡}` 定位 demo → 读卡全文 → 改 `_fixtures`/`Motion.tsx` import + `ACCENT` + 占位文案 → copy 进 `src/components/shots/`（Motion 系配 `DesignStage`，6 卡先 `npm i @remotion/motion-blur`）。`[借思路]` → 借卡动效思路用总动效库实现。**点名走 shotcraft 模板/共同创作时**：才按其自身 pipeline。

## 二、命令速查

| 命令 | 作用 |
|------|------|
| `npx remotion compositions` | 列真 composition id（不依赖 package 脚本） |
| `npx remotion studio` | 交互预览 localhost:3000 |
| `npx remotion still <id> --frame=N --scale=0.25` | 抽帧 QA（渲染前必做） |
| `npx remotion render <id> out/final.mp4` | 渲染 MP4 |

## 三、src 分层

```
src/
├── Root.tsx        Composition 注册（显式 id/fps/宽高/时长）
├── theme.ts        video design tokens（DESIGN.md → tokens.ts）
├── captions.ts     parseSrt + createTikTokStyleCaptions
├── components/     场景组件 + 字幕层 + 背景层
└── index.ts        registerRoot
```

- Composition 时长**由字幕推导**（`max(endMs)/1000*fps + trailing`），不手写死。
- 组件分层：背景层 → 场景层 → 字幕层（绝对定位叠层）。

## 四、确定性动画（硬规则）

- 只用 `useCurrentFrame` / `interpolate` / `spring`。
- **禁 `Math.random` 与浏览器定时器**（每次渲染结果必须一致）。
- 只动 transform/opacity，时长走 tokens 不写死。

## 五、交付前检查清单

- [ ] 单 composition，id/fps/画幅/时长明确
- [ ] 全部引用 theme.ts tokens（无 inline 色值/字体/时长）
- [ ] captions.srt 全句到齐、时间戳覆盖全片
- [ ] 字幕帧对齐（句首帧字幕已出现、句尾帧未提前消失）
- [ ] still 抽帧 3-5 张通过（构图/字幕/转场）
- [ ] `npx remotion render` 成功产出 MP4
- [ ] 确定性动画（无随机）

## 六、常见坑（VOLTA 实测）

- **StaggerEntrance 是绝对定位全屏堆叠**：它把每个 child 包成 AbsoluteFill 叠在一起，**不是竖排列表**。要竖排/横排逐项入场，写个自定义 `StaggerList`（flex + 每项 `interpolate(frame, [i*stagger, i*stagger+18], [0,1])` 控 opacity/translateY）。
- **转场组件在场景首帧 opacity=0**：SlideUp/PunchIn/Fade 等第 0 帧透明，`still --frame=` 抽到场景首帧会全空。验收抽**场景中段**帧（Sequence 内 frame 30+）。
- **Entrance 组件是 AbsoluteFill 会破坏居中（实测 2026-08-16）**：FadeEntrance/ScaleEntrance/SpringEntrance/PunchInTransition 返回 `<AbsoluteFill>`（全屏容器），包**单个素材**会把素材推到左上角、脱离 flex 居中。**主体素材居中布局时不要用 Entrance 包素材**，素材直接放 flex 容器；入场动效给背景/字幕/数据/大字（用 SpotlightSweep 之类 relative 包装）。
- **mmx 素材是竖图比例（1024×1536），w 控制会超高挤压文字（实测 2026-08-16）**：`<Img width:520>` 高度自动爆到 ~780px，垂直堆叠时把大字/字幕挤重叠。**素材图用 `h`（高度）控制 + `objectFit:"contain"`**，各场景素材限高（中景 250-360px、辅助 240px）防压字幕区（y:795）。
- **场景继承网页设计系统**：若品牌已做过 HTML（consult/build 产出 DESIGN.md），**consult Phase 0 预检必须读它** —— 视频场景直接继承其色板/字体/卡片/口味卡/配方格等视觉元素（配色/字体/情绪是跨网页与视频共享的品牌 DNA），不要重起炉灶。
- **`useCaptions` 异步加载**：captions.srt 经 `fetch(staticFile)` + `useDelayRender` 加载，`captions` 为 null 时先渲染兜底（黑屏），加载完再渲染正片。
- **theme 缺字段**：`THEME.fonts` 契约统一为 **caption/title/mono/body 四档**（见 `remotion-shared/video-tokens-spec.md`）—— **mono 必填**（数据标签），**body 可选**（无 body 时卡片描述字体写死 `"Inter, sans-serif"`，别引用 `F.body.*`）。
- **纯代码交付阶段 still 抽帧无法执行**（无渲染环境）：不能跑 `npx remotion still` 时，用**静态核对**代替 —— ① 帧对齐表逐句算 `round(ms/1000*fps)` 核对、② grep 无 inline 色值/字体、③ `tsc --strict` 类型检查。渲染核验留给用户（交付说明写清 `still --frame=` 与 `render` 命令），非阻塞。
