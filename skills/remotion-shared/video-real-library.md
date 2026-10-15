# 视频参考库（Video Real Library）

> remotion-consult Phase 2 研究 / remotion-build Step 2 找参考用的目录——不是规则书。原则与 `design-shared/real-design-library.md` 一致：**有参考就复刻它的字幕风/转场/节奏，只换内容；自由发挥时只看 video-anti-slop 反向提示词。**

## 一、来源：用户已收集的借鉴网站

| 维度 | 站点 | 看什么 |
|------|------|--------|
| 设计灵感 | https://getdesign.md/ | 设计系统/规范灵感 |
| 组件体系 | https://www.shadcn.com.cn/ | 组件设计系统参考 |
| 交互模式 | https://mobbin.com/ | 真实 App/网页交互流 |
| 动效 | https://www.landing.love/ | 滚动/悬停/转场动效的"手感" |
| 审美 | https://land-book.com/ | 高审美 landing 精选集 |
| 创意 | https://www.awwwards.com/ | 获奖/年度最佳站点，创意标杆 |
| 精致 | https://onepagelove.com/ | 单页精品，排版/留白讲究 |
| 酷炫 | https://www.lapa.ninja/ | 炫酷视觉/商业站 |
| 现成组件 | https://21st.dev/ | 真实可复用组件（含代码） |
| 设计感 | https://www.siteinspire.com/ | 高设计感画廊，可按类型/行业精确分类 |

## 二、来源：搜索引擎补充（AnySearch 2026-08-15）

| 维度 | 站点 | 看什么 |
|------|------|--------|
| 设计灵感 | https://www.siteofsites.co/ | 按行业分类的站点集合 |
| 设计灵感 | https://muz.li/ | Muzli 设计灵感流（每日更新） |
| 灵感合集 | https://www.toools.design/blog-posts/ultimate-list-100-best-inspiration-sites-to-inspire-designers | 100 个灵感站合集 |
| 运动图形 | https://motionographer.com/ | 运动图形行业权威，reel 案例 |
| 动效 reel | https://dribbble.com/search/motion-graphics-reel | 动效 reel 搜索 |
| 品牌动效 | https://www.superside.com/blog/motion-graphic-examples | 品牌动效案例 |
| 动效趋势 | https://elements.envato.com/learn/motion-design-trends | 2026 动效趋势（含 analog/VHS 复古风） |

## 三、Remotion 官方参考（视频工作流专属）

| 资源 | 看什么 |
|------|--------|
| https://www.remotion.dev/templates | 官方模板库，composition 复用 |
| https://www.remotion.dev/showcase | 真实 Remotion 作品 |
| https://www.remotion.dev/docs/examples/ | 官方示例（含动效/字幕/地图等） |
| https://www.remotion.dev/docs/captions/ | 字幕系统官方文档（时间戳对齐） |
| `_dev/remotion-tutorial/` | 本库教程项目，4 个 composition 现成可用 |

## 四、怎么用（短，别过度设计）

1. **挑参考**：内容匹配优先（用户给的 > 本目录 > 自由发挥）。
2. **抓视频参考用"拆解动效"法**：把参考视频的字幕风/转场/节奏，描述成 Remotion 原语组合（见 `remotion-build/references/motion-patterns-video.md`），而不是照抄视觉。
3. **自由发挥时**：只看 `video-anti-slop.md` 的反向提示词，其余随便。
4. 需要抓网页参考正文时，按 CLAUDE.md 网页信息获取优先级（r.jina.ai / 搜索引擎 API）拉取。

## 五、可扒源码性 + 免费/付费（opencli 实测 2026-08-16）

| 站 | 免费/付费 | 能扒什么 | 用途 |
|----|----------|---------|------|
| **21st.dev** ✅ | 免费浏览 + 每组件 2 copy/天（读 DOM 扒源码不限） | **完整 React 组件源码**（Code 标签 Component.tsx，12000+） | 动效/背景/字体/特效源码（最高价值） |
| **getdesign.md** ✅ | 免费（需登录） | **300+ 品牌 DESIGN.md**（`/design-md` 页） | `设计系统库/` 扩展源 |
| **shadcn.com.cn** | 完全免费 | shadcn 注册表源码 | 组件模式（已知结构） |
| **landing.love** | 免费 | 无源码（索引，2141 动效站按分类） | 发现动效参考站 |
| **mobbin.com** ❌ | **付费订阅**（Pro per month） | 交互流截图（免费额度少，无代码） | 交互参考（有订阅才看） |
| **elements.envato.com** ❌ | **付费订阅**（素材/模板） | 趋势文章免费读，素材付费 | 只读趋势文章 |
| land-book.com | 免费浏览 + 付费功能 | 无源码（画廊） | 审美索引 |
| awwwards.com | 免费浏览 + Pro | 无源码（画廊） | 创意标杆索引 |
| onepagelove.com | 免费浏览 + 模板单个收费 | 无源码（画廊+模板市场） | 单页排版参考 |
| lapa.ninja | 免费浏览 + Premium | 无源码（7300+ landing 画廊） | 落地页构图索引 |
| siteinspire.com | 免费浏览 + 订阅 | 无源码（画廊） | 高设计感画廊 |
| muz.li | 基本免费（登录保存） | 无源码（设计流） | 每日灵感流 |
| toools.design | 免费 + Pro | 无源码（工具合集） | 找工具 |
| motionographer.com | 免费文章 + 会员 | 无源码（文章/reel） | 运动图形趋势 |
| dribbble.com | 免费浏览 + Pro | 无源码（作品集） | 动效 reel 搜索 |
| superside.com | 博客免费读（卖服务） | 无源码（案例文章） | 品牌动效案例 |
| siteofsites.co | 免费 + 部分解锁 | 无源码（按行业目录） | 找行业参考站 |

**结论**：
1. **能"直接扒源码"的只有 3 个**：21st.dev（代码）、getdesign.md（DESIGN.md）、shadcn（注册表）。
2. **纯付费 2 个**：mobbin（交互流）、elements.envato（素材）——没订阅时跳过，看免费的替代。
3. **其余全免费浏览**（画廊/索引/博客），只用于**发现参考**：找到目标站后再用 opencli 去目标站看（很多本身免费）。
4. 需要新动效词汇时：21st.dev 按 `工作台/视频/_参考源码/README.md` §二 扒法抓，存 `_参考源码/` 并登记清单。
