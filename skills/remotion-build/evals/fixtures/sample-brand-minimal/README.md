# sample-brand-minimal（evals fixture）

`skills/remotion-build/evals/evals.json` 里 id 0 / id 1 两个回归用例的**输入素材**。目的是让这套 eval
在**任何人的机器上**都能跑，而不再依赖维护者本机的 `工作台/视频/...` 私有素材（见 ticket #11）。

## 内容

| 文件 | 用途 | 对应用例 |
|------|------|----------|
| `voiceover.md` | 3 句中文口播稿（含品牌、时长、语速基准） | id 0 输入 |
| `captions.srt` | 与口播稿逐句对齐的 SRT（30fps 友好整秒时长） | id 0 输入 |
| `DESIGN.md` | 最小 DESIGN.md：审美方向 / 字体 / 配色 / 节奏 / 构图 / 转场 / Video Design Tokens / 场景蓝图 | id 1 输入 |

## 来源声明（重要）

- 本目录**全部为合成内容**：品牌「星屿咖啡」是虚构名称，文案、色值、token、场景蓝图都是为这套 fixture 编写的。
- **不含**任何真实品牌素材、客户素材、第三方图片/音频/字体文件，也**没有**从维护者本机复制任何文件。
- 因此本目录可以随仓库公开；不需要额外的授权确认。

## 边界（不要误读）

- 这是**回归评估的输入**，不是可交付案例，也不是设计范本。
- `DESIGN.md` 里的字号字重底线只写"唯一事实源在哪"，**不复制数字**——数字的唯一事实源是
  `skills/remotion-build/references/video-quality-metrics.md`。
- 素材 slot 只给描述，不带真实素材文件；渲染/视觉验收不在本 fixture 的范围内。
