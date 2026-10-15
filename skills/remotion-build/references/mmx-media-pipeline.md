# 视频媒体管线（图片 / 语音 / 音乐）

> MiniMax 是历史默认后端，不再是单点依赖。图片可走 Codex，配音优先走无 Key 或国内云端 TTS，音乐优先走授权素材库或本地 ACE-Step；本文件保留 MiniMax 原路由作为显式可选项。

## 一、三通道总览

| 通道 | 工具 | 命令 | 输出 |
|------|------|------|------|
| 图片 | `scripts/media/media_gen.py` | `python scripts/media/media_gen.py --provider minimax --prompt "…" --size 1024x1536 --save assets/x.png` | PNG/JPG |
| 语音 | `scripts/media/tts_gen.py` | `python scripts/media/tts_gen.py --provider edge-tts --lines lines.txt --save-dir public/audio/ --voice male-qn-qingse` | mp3 × N |
| 音乐 | 授权素材库 / ACE-Step / 云端后端 | 见下方「音乐（BGM）」 | mp3/wav |

## 二、语音（TTS 配音）

### 推荐路由（MiniMax 套餐不可用时）

| 后端 | 成本/网络 | 适用 | 接入方式 |
|------|------|------|------|
| `edge-tts` | 无 API Key；在线服务，网络受限时可能需要代理 | 现在就要出片、中文普通话配音 | `python -m pip install --user edge-tts`，再用下方命令 |
| 火山引擎 `doubao-tts` | 国内云端；需开通/鉴权 | 中文情绪、短视频和长文本正式稿 | Open Design 媒体路由的 `doubao-tts`，或按火山语音 API 接入 |
| 腾讯云 TTS | 国内云端；需 SecretId/SecretKey | 稳定播报、SSML、批量合成 | `TextToVoice` / 长文本 TTS API |
| `senseaudio-tts` / FishAudio | 云端；需各自 Key | 声音复刻或特定音色 | Open Design 媒体路由 |
| ElevenLabs / OpenAI TTS | 全球云端；需 Key/套餐 | 英文、多语种、表现力优先 | 各自官方 API；不作为零成本默认 |

**当前默认**：`edge-tts`。它是在线客户端，不承诺生产 SLA；如果代理或网络不稳定，改用火山引擎/腾讯云，或在 Open Design 中选 `senseaudio-tts`。

```bash
# 零 Key 默认路线（中文别名会自动映射到 Edge voice）
python -m pip install --user edge-tts
python scripts/media/tts_gen.py --provider edge-tts --lines lines.txt --save-dir public/audio/ --voice female-chengshu
# 也可直接传 Edge voice id，例如 zh-CN-XiaoxiaoNeural
python scripts/media/tts_gen.py --provider edge-tts --text "零糖。植物基咖啡因。" --save public/audio/s1.mp3 --voice zh-CN-XiaoxiaoNeural
```

### MiniMax 原路由（仅在套餐/配额可用时）

- **脚本** `scripts/media/tts_gen.py`：MiniMax T2A v2 `https://api.minimaxi.com/v1/t2a_v2`，Bearer key（.env `MINIMAX_KEY*` 用 `startswith` 匹配，实际变量名是 `MINIMAX_KEY_1`），**无需 GroupId**。
- 请求：`model: speech-02-hd` + `voice_setting.voice_id` + `audio_setting{format:mp3, sample_rate:32000}`。
- 响应：`data.audio`（**hex 编码的 mp3**，`bytes.fromhex` 写文件）。
- **可用模型**：`speech-02-hd`（默认，tts_gen.py 用）/ `speech-2.8-hd`（较新，eval baseline 用过，配 `Lyrical_Voice` 类 voice）。渲染前先小样本试听确认音质与语速。
- 中文 voice：`male-qn-qingse`（青年男声，能量品牌）/ `female-chengshu`（成熟女声，温润茶饮）/ `female-shaonv`；部分 voice 配 `speed` 参数调语速（1.0 基准）。
- 批量：`--lines lines.txt`（每行一句）→ `s1.mp3…s6.mp3`；或 `--text "…" --save out.mp3` 单句。
- **配音是 srt 的唯一时间源**：生成后 `ffprobe -show_entries format=duration` 每句时长 → 重建 srt（见 `captions-guide.md` §七）。

## 三、音乐（BGM）

### 推荐路由（MiniMax 套餐不可用时）

1. **现有授权素材库（不生曲时默认最稳）**：`video-shotcraft/assets/audio/bgm/` 已有 BGM，`assets/audio/sfx/` 已有音效；选用时记录 `ATTRIBUTION.md`，按视频长度用 ffmpeg 裁剪/循环。适合不需要定制旋律、先完成 Remotion 片子的场景，不依赖任何音乐套餐。
2. **ACE-Step 1.5（AI 生曲默认主后端）**：需要按提示词生成新音乐时优先使用。官方仓库支持 Windows 和 REST API；你的 RTX 4060 Laptop GPU 是 8GB，按官方档位选 2B turbo + `acestep-5Hz-lm-0.6B`，不要选需要至少 12GB 显存的 XL 模型。安装后启动 `uv run acestep-api`，再把生成的 mp3/wav 放入项目 `public/audio/`。
3. **Eleven Music（云端高质量）**：支持纯音乐/人声、最长 5 分钟和 API，但音乐 API 面向付费订阅；适合需要提示词生曲且接受新套餐的项目。
4. **Stable Audio 3.0（云端 API）**：支持最长 6 分钟文本/音频生成；当前按成功生成计费，适合需要音频参考或更长 BGM 的项目。
5. **Suno/Udio/Lyria**：可以手动生成后导入，但当前本地媒体注册表把 Suno/Udio 标为未集成，不把它们当 Remotion 自动化默认后端。

### 本地/授权素材处理

```bash
# 先查看原曲时长
ffprobe -v error -show_entries format=duration -of csv=p=0 <input.mp3>
# 裁剪或循环到视频全长
ffmpeg -y -v error -stream_loop -1 -i <input.mp3> -t <视频秒数> -c:a libmp3lame -b:a 192k public/audio/bgm.mp3
```

Remotion 集成：全片铺底 `<Audio src={staticFile("audio/bgm.mp3")} volume={0.3} />`，音量低于口播（口播 volume 1.0）。

### MiniMax 原路由（仅在套餐/配额可用时）

- `mmx music generate`（模型 `music-3.0`），参数：`--prompt` 风格 / `--instrumental` 纯音乐 / `--genre` / `--mood` / `--use-case "background music for video"` / `--out`。
- **关键坑**：mmx-cli 默认拼出 `/v1/v1/music_generation`（双 v1）→ **404**。**必须加 `--base-url https://api.minimaxi.com` 绕过**（去掉内置 `/v1`）。
- 生成后原始音乐可能 1-3 分钟，**裁剪到视频全长**：
  ```bash
  ffprobe -v error -show_entries format=duration -of csv=p=0 bgm_raw.mp3   # 看原始时长
  ffmpeg -y -v error -i bgm_raw.mp3 -t <视频秒数> -c:a libmp3lame -b:a 192k bgm.mp3
  ```
- Remotion 集成：全片铺底 `<Audio src={staticFile("audio/bgm.mp3")} volume={0.3} />`，音量低于口播（口播 volume 1.0）。

## 四、MiniMax CLI（可选）

- 安装：`npm i -g mmx-cli`（仅在需要 MiniMax 路由时）；验证 `mmx --version`。
- 登录：`mmx auth login --api-key <key>`（成功即输出配额：general 99% / video 等）。
- 子命令：`auth` / `text` / `speech` / `image` / `video` / `music` / `search` / `vision` / `quota` / `config` / `file` / `update`。
- **已知坑**：
  - `mmx quota show` → **HTTP 404**（CLI 1.0.19 bug；auth login 已能显示配额，不影响用）。
  - `npx skills add MiniMax-AI/cli -y -g` → 失败「PromptScript 不支持全局装 skill」。
  - `music generate` / 其他走 `/v1/v1/` 的命令 → 加 `--base-url https://api.minimaxi.com`。

## 五、素材对齐视频（provider-independent）

1. **口播配音 → 重建 srt**：配音时长（ffprobe）是 srt 时间戳唯一来源；句间呼吸 0.8s 给画面展示时间。
2. **背景音乐 → 裁剪到视频全长**，音量 0.3 不抢口播。
3. **图片素材**：`media_gen.py` 生成（volta-can.jpg 3 次迭代去 AI 乱码文字），放 `public/`（`staticFile` 从 public 读）供 `staticFile("volta-can.jpg")` 引用。
4. **AI 图文字检查**：用 `claude-vision` 描述校验 —— AI 生成图常带乱码小字（如罐身假标签），提示词强约束「no text except logo」或重生成，必要时接受无文字极简版。
