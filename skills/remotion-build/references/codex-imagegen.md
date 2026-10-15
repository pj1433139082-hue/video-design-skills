# Codex 图片生成集成（imagegen）

> design-build §4 图片素材在 **Codex** 里的实现细节。依据 openai/codex 自带 `imagegen` 技能（内置 `image_gen` 工具）。目标：让设计构建在 Codex 里自动出图，且图能正确落进 `<页面目录>/assets/`。

## 一、Codex 的两条生成路径

| 路径 | 何时用 |
|------|--------|
| **内置 `image_gen` 工具（默认）** | 常规生成/编辑/简单透明底。**无需 `OPENAI_API_KEY`**。 |
| **CLI fallback**（`$CODEX_HOME/skills/.system/imagegen/scripts/image_gen.py`） | 仅当用户明确要求 CLI/API 路径、或用户确认走 `gpt-image-1.5` 真透明底。需要 API key。 |

**规则**：默认永远走内置 `image_gen`；不要为了"质量/尺寸/路径控制"擅自切 CLI；`batch` 不意味着要切 CLI（多个不同资产 = 一次一个内置调用）。

## 二、保存路径（关键）

内置工具把图存在 **`$CODEX_HOME/generated_images/...`**（默认）。**绝不**只留在这个默认路径。

保存优先级：
1. 用户指定了位置 → 移/复制过去
2. 图是给当前项目的 → **收尾前移到/复制进工作区**（即 `<页面目录>/assets/`）
3. 仅预览/头脑风暴 → 可留在默认路径

**design-build 要求**：图生成后必须 `cp`/`mv` 从 `$CODEX_HOME/generated_images/<file>` 到 `<页面目录>/assets/<page>-<slot>.webp`，然后 HTML 用相对路径引用。不要覆盖已有资产（除非用户明确要求），否则用 `-v2` 式版本名。

## 三、调用方式

- 一个 asset 一次内置 `image_gen` 调用（**不要**用 `n` 参数凑多个不同资产；`n` 只是同一 prompt 的变体）。
- 编辑已有图：内置 edit 只作用于**会话上下文里可见的图**——先 `view_image` 加载本地文件，再走 edit 流程。
- 透明底：先内置生成在**纯色 chroma-key 背景**（主体非绿用 `#00ff00`，主体绿用 `#ff00ff`），禁止阴影/渐变/地面/反射，再本地跑：
  `python "$CODEX_HOME/skills/.system/imagegen/scripts/remove_chroma_key.py" --input <src> --out <final.png> --auto-key border --soft-matte --transparent-threshold 12 --opaque-threshold 220 --despill`
  复杂透明（毛发/玻璃/烟/液体）或去除失败 → 才问用户是否走 CLI `gpt-image-1.5`。

## 四、prompt 结构（与 design-build 图片规格表对齐）

按固定顺序写：**场景/背景 → 主体 → 关键细节 → 约束 → 用途**。复杂请求用短标签行而不是长段落。

- **具体优先**：用户给的 prompt 已具体就规范化成清晰规格，不加创作性要求；太泛才补"品味细节"。
- **文字**：图内文字用引号或全大写 + 指定字体/字号/颜色/位置；需要精确的字要逐字母拼。要无额外字符的 verbatim 渲染。
- **约束/invariant**：编辑时写"只改 X，Y 保持不变"，每次迭代重复关键约束。
- **构图**：指明景别/视角（特写/全景/俯视）只在对结果有帮助时；需要给 UI/文案留空间时明确要 negative space。
- **用途**：注明 intended use（UI mock / 广告 / 信息图），设定完成度档位。

## 五、design-build 图片规格表 → imagegen prompt 映射

| image-spec 字段 | imagegen prompt 位置 |
|-----------------|---------------------|
| `subject` 主体 | 主体段 |
| `style` 风格（编码页面视觉语言） | 场景/细节段 |
| `mood` 情绪 | 场景/细节段 |
| `aspect` 比例 | 构图段（framing） |
| `notes` 备注（留白/构图/禁止项） | 约束段 |
| （新增）`scene` 场景/背景 | 场景段（放最前） |
| （新增）`text` 图内文字 | 文字段（引号+全大写） |
| （新增）`intent` 用途 | 用途段（结尾） |

> 无图 harness（Claude Code）仍按旧路径：把规格表转成 GPT 可粘贴提示词。Codex 里则是把规格表按上表展开成 image_gen 的 prompt。
