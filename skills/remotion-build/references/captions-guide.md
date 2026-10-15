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
