# 预设设计系统库（Video Design Presets）

> 从 getdesign.md 的 300+ DESIGN.md 分析中提炼的**已验证品牌风格**，作为视频模板库的现成视觉起点。每个预设 = 完整 tokens 色板 + 字体 + 转场性格 + 适用类别。consult Phase 4 可直接套用，build 写 theme.ts 时照此填值。

## 用法

consult Phase 4 时：按用户审美方向选一个预设 → 继承其 tokens → 覆盖差异字段。预设是"起点"不是"终点"，可混搭（如 Framer 底 + Linear 的精确节奏）。

---

## ① Framer 动感风（bold black + blue, motion-first）
| token | 值 |
|-------|-----|
| bg / surface | `#0a0a0a` / `#161616` |
| accent / accent2 | `#3b82f6` / `#60a5fa` |
| textPrimary / Muted | `#f5f5f5` / `#8a8a8a` |
| line | `#262626` |
| 字体 | Noto Sans SC 900 标题 / mono 点缀 |
| 转场性格 | motion-first：Slide+Punch 交替、Spring 弹性弹入、数字滚动 |
| 适用 | 产品演示 / 工作流介绍 / 技术教程 |

## ② Linear 精确风（ultra-minimal, precise, purple accent）
| token | 值 |
|-------|-----|
| bg / surface | `#0d0e11` / `#1a1b1f` |
| accent / accent2 | `#5e6ad2` / `#8b93e8` |
| textPrimary / Muted | `#f0f0f2` / `#7a7b85` |
| line | `#2a2b30` |
| 字体 | 极简无衬线，小字号阶梯，超细标题 |
| 转场性格 | 克制精确：Fade 为主、极少量 Slide、无夸张弹入 |
| 适用 | 数据可视化 / 项目管理类 / 精确叙事 |

## ③ Stripe 渐变风（signature purple gradients）
| token | 值 |
|-------|-----|
| bg / surface | `#0a0a1a` / `#141428` |
| accent / accent2 | `#7c3aed` / `#a78bfa` |
| textPrimary / Muted | `#ffffff` / `#9ca3af` |
| 背景 | 深紫极光渐变（AuroraBackground） |
| 字体 | 优雅无衬线，weight-300 超细大标题 |
| 转场性格 | 流畅渐变：Fade + Parallax 视差，克制优雅 |
| 适用 | 品牌片 / 高端产品 / 优雅叙事 |

## ④ MiniMax 霓虹风（bold dark, neon accents）
| token | 值 |
|-------|-----|
| bg / surface | `#0a0a12` / `#14141f` |
| accent / accent2 | `#00e5ff` / `#ff3d81` |
| textPrimary / Muted | `#e8e8f0` / `#6f6f84` |
| 背景 | 网格 + 霓虹点缀（GridBackground + 粒子） |
| 字体 | 科技无衬线，mono 强调 |
| 转场性格 | 高冲击：Punch + Cut + 粒子背景，数字滚动 |
| 适用 | AI 产品 / 科技演示 / HUD 数据风 |

## ⑤ Supabase 代码风（dark emerald, code-first）
| token | 值 |
|-------|-----|
| bg / surface | `#0f1014` / `#1a1c22` |
| accent / accent2 | `#3ecf8e` / `#7dd3a8` |
| textPrimary / Muted | `#e8ecef` / `#7d838c` |
| 背景 | 极光绿 + 噪点（AuroraBackground + NoiseOverlay） |
| 字体 | 代码感，mono 大标题 |
| 转场性格 | code-first：Wipe + Slide，terminal 感 |
| 适用 | 开发者工具 / 开源项目 / 代码演示 |

## ⑥ Vercel 黑白风（black and white precision）
| token | 值 |
|-------|-----|
| bg / surface | `#000000` / `#0a0a0a` |
| accent / accent2 | `#ffffff` / `#888888` |
| textPrimary / Muted | `#ffffff` / `#888888` |
| line | `#222222` |
| 字体 | 极简无衬线（Geist 风格），大字粗黑 |
| 转场性格 | 黑白精确：Cut + Fade，零花哨 |
| 适用 | 极简品牌 / 严肃技术 / monochrome |

---

## 快速选择表

| 想要的感觉 | 选预设 |
|-----------|--------|
| 动感科技 | ① Framer |
| 精确克制 | ② Linear |
| 优雅渐变 | ③ Stripe |
| 霓虹冲击 | ④ MiniMax |
| 代码/终端 | ⑤ Supabase |
| 黑白极简 | ⑥ Vercel |

## 来源
- getdesign.md DESIGN.md collection（300+ 品牌分析）——各预设的配色/字体/风格特征提炼自对应品牌的公开设计系统分析（Framer/Linear/Stripe/MiniMax/Supabase/Vercel 条目）。
