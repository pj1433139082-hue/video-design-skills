# 字幕时间戳对齐技术参考（Captions Guide）

> remotion-build Step 1 字幕驱动流程的技术参考。核心：让 .srt 字幕**精确对齐到视频帧**，不靠估算。依赖 `@remotion/captions`（独立包，需 `npm i @remotion/captions@<与remotion相同版本>`）。

## 一、API 速查（@remotion/captions）

| API | 作用 | 返回 |
|-----|------|------|
| `parseSrt({ input })` | 解析 .srt → 字幕数组 | `{ captions: Caption[] }` |
| `parseVtt({ input })` | 解析 .vtt（如可用） | `{ captions: Caption[] }` |
| `createTikTokStyleCaptions({ captions, combineTokensWithinMilliseconds })` | 分页 + 词级 token | `{ pages: TikTokPage[] }` |
| `serializeSrt({ lines })` | 回写 .srt | string |

**Caption 字段**：`text` / `startMs` / `endMs` / `confidence` / `timestampMs`
**TikTokPage 字段**：`text` / `startMs` / `durationMs` / `tokens[{ text, fromMs, toMs }]`

> **中文注意**：中文无空格分词，`createTikTokStyleCaptions` 会把整句当一个 token。词级高亮对中文**退化为句级**；想要逐词高亮需先按标点/语气断句，或接受句级高亮。build 时用 DESIGN.md 的 `highlightMode` 决策。

## 二、帧对齐公式（精确到帧）

```ts
const startFrame = Math.round((startMs / 1000) * fps); // 用 round 防句首差 1 帧
const endFrame   = Math.round((endMs / 1000) * fps);
const durationInFrames = Math.max(1, endFrame - startFrame);
```

每句包一个 `<Sequence from={startFrame} durationInFrames={durationInFrames}>`。

**全片时长**（字幕驱动的总时长）：
```ts
const totalMs = Math.max(...captions.map(c => c.endMs)) + trailingMs;
const totalFrames = Math.round((totalMs / 1000) * fps);
```

## 三、字幕驱动流程

1. **来源路由**：
   - 已有 `.srt`/`.vtt` → `parseSrt` 直接用。
   - 已有 `口播稿.md` → 起草草稿 .srt（见下面节奏规则）。
   - 从零 → 先草稿口播稿再草稿 .srt。
2. **导入校验**：空段 / 时间重叠 / 越界（startMs < 0 或 endMs 超时）。
3. **分页**：`createTikTokStyleCaptions` → `{ pages }`，`switchEveryMs` 从 DESIGN.md tokens 读。
4. **渲染**：`CaptionLayer` 组件（总动效库）处理所有 `<Sequence>` 对齐 + 词级高亮。
5. **画面节奏绑定字幕**：场景切换/图片切入以字幕句首 `startMs` 为锚点，字幕是唯一时间轴。
6. **改词后回写**：`serializeSrt({ lines })`。

## 四、从口播稿起草 .srt 的节奏规则

| 项 | 中文标准 |
|----|---------|
| 语速 | 4-5 字/秒 |
| 句间停顿 | 200-400ms |
| 句尾 hold | ≥800ms（让观众读完） |
| 每行字数上限 | 竖屏 ≤14 字 / 横屏 ≤18 字（1920 宽可读）；超长句**拆行优先于降字号** |
| 拆行规则 | srt 内用 `\n` 拆两行（仍单条 cue 单 token），字幕组件 `whiteSpace: pre-line` 保留换行；降字号是不得已的兜底 |
| 断句位置 | 语气停顿处，别断在词中 |

## 四·五、配音驱动 srt 重建（provider-independent）

> **2026-08-15 VOLTA 品牌片实测最佳实践**。无论使用哪一个 TTS 后端（默认 `edge-tts`，或国内云端/ MiniMax），srt 时间戳**不应手写估算** —— 先配音，再用配音实际时长重建 srt，音画绝对同步：

1. 草稿口播稿（每句一行）→ `tts_gen.py --provider <backend> --lines` 生成 `s1.mp3…s6.mp3`。
2. `ffprobe -v error -show_entries format=duration -of csv=p=0 s1.mp3` 查每句实际时长。
3. **重建 srt**：
   - 句首 = 上句尾 + 呼吸（默认 **0.8s**，给画面展示时间）
   - 句尾 = 句首 + 配音实际时长
4. 场景/画面 `fromMs` 对齐新 srt（srt 仍是唯一时间轴，只是时间来自真实配音）。
5. 换 voice / 改文案 → 重新配音 → 重建 srt（一套流程）。

> **句间呼吸**：用 srt 呼吸控制展示时间（配音说完画面继续停留），**不要**试图让 TTS 文本内停顿 —— TTS 停顿会改变配音时长，重配音 + 重算 srt 链条不稳。
> **口播音量** 1.0，背景音乐（授权素材库 / ACE-Step / 已配置云端后端）volume 0.3 不抢戏，见 `mmx-media-pipeline.md`。

## 五、常见坑

- **毫秒 vs 帧量化误差**：`Math.round` 而非 `floor`；误差 ≤1 帧为可接受。
- **首尾 pad**：首句前加 pad（如 500ms），末句后加 trailing（如 1s），避免首尾字幕贴边。
- **时间重叠**：两段字幕 startMs 重叠会导致 <Sequence> 覆盖，校验时排掉。
- **BOM/空行**：.srt 文件开头 BOM 或多余空行会导致 parse 异常，先清理。
- **中文整句单 token**：词级高亮退化，见上文"中文注意"。
- **抽帧抽场景中段**：转场/入场组件（SlideUp/PunchIn/Fade 等）在场景 Sequence 第 0 帧 opacity=0，`still --frame=` 抽到场景首帧会看到全透明只剩字幕。验收抽帧要抽**场景中段**（Sequence 内 frame 30+，动画完成），别抽首帧。

## 六、示例

```tsx
// captions.ts
import { parseSrt } from "@remotion/captions";
export const { captions } = parseSrt({
  input: require("fs").readFileSync("public/captions.srt", "utf-8"),
});
```

## 七、中文逐词 captions 制备（预分词，T4）

`createTikTokStyleCaptions` 按**空白**切 token。中文无空格 → 整句 captions 在 word 模式 = 单 token = **整句同亮（退化为句级）**。要真逐词高亮，captions 必须是 **word 级条目**（预分词）：

1. 把每句口播按**词 / 标点 / 语气**预分词（如"蓝光 散射 比 红光 强 得多"）。
2. 每个词一条 `Caption`：`{ text, startMs, endMs }`；词时间戳在该句 span 内按字数**线性插值**分配（有 TTS word 时间戳则用真值）。
3. word 模式即逐词依次点亮；验收用 vision 核高亮粒度 = **逐词**（多 token 依次 active），**非整句同亮**。
4. **降级规则**：拿不到 word 级时间戳 / 不预分词 → 用 `highlightMode="line"`，并在 DESIGN.md 与验收记录**显式标注"句级降级"**；**禁止** word 模式配句级 captions 静默退化。

```tsx
// 中文 word 级 captions 示例（预分词 + 句内插值）
const captions: Caption[] = [
  { text: "蓝光", startMs: 0, endMs: 400 },
  { text: "散射", startMs: 400, endMs: 800 },
  { text: "比红光强", startMs: 800, endMs: 1600 },
];
```

## 八、自适应字幕衬底（adaptive scrim，T6）

写死的固定 scrim（如 `captionStroke 0.85` / `captionBg 0.45`）在**亮底过暗、暗底对比不足**。改用 `motion-library/adaptive-scrim.tsx`（clean-room 借鉴 heroScrim 思路，未复制代码）：

- `bgLightnessToScrim(l)`：`opacity = clamp(0.30 + 0.50*l, 0.30, 0.80)`——亮底强衬底、暗底轻衬底；保证白字幕对比 ≥3:1（实测亮底 0.85 → opacity 0.725 → 对比 ≈9.4:1；暗底更高）。
- `<AdaptiveCaptionScrim bgLightness mode="gradient" height />`：底部渐变衬底层，放**字幕层之下、场景层之上**。
- `captionScrimBoxStyle(l)`：字幕胶囊/盒衬底 CSS（box 模式）。
- `bgLightness`（0-1）= DESIGN §8.1 每场景字段，由 layout_calc / 视觉判断 / 素材平均亮度给出。
- **验收**：frame_judge 的 `--text-bg-hex` 用"衬底 over 背景"加权合成后的有效色核字幕对比 ≥3:1；衬底强度必须由 bgLightness 驱动，**不得写死固定值**。
