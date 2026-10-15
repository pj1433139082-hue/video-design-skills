# 视频动效模式（Motion Patterns - Video）

> remotion-build Step 2/5 动效借鉴 + 实现参考。Remotion 原语版（网页版是滚动触发，视频版是**帧号触发**）。总动效库组件清单见 `remotion-shared/motion-library/`。

## 一、Remotion 原语速查

| 原语 | 作用 |
|------|------|
| `useCurrentFrame()` | 当前帧号（0,1,2,...），驱动一切动画 |
| `useVideoConfig()` | 取 fps / width / height / durationInFrames |
| `interpolate(frame, [in],[out], opts)` | 帧范围 → 属性范围映射 |
| `spring({frame, fps, config})` | 弹性值 0→1 |
| `<Sequence from={n} durationInFrames={d}>` | 时间段切片（场景/字幕对齐核心） |
| `<AbsoluteFill>` | 全屏容器（叠层基础） |

## 二、转场库（帧驱动）

| 转场 | 实现 | 时长建议 |
|------|------|---------|
| cut 硬切 | `<Sequence>` 直接切换 | 0 帧 |
| fade 淡入淡出 | opacity 0→1 | 8-12 帧 |
| slide-up 上滑 | translateY + opacity | 10-15 帧 |
| punch-in 推近 | scale(1→1.08) + translateY | 10-15 帧 |
| 遮罩滑动 | clip-path 或两 AbsoluteFill 叠层 | 12-20 帧 |

每场选一种，时长走 tokens（`transitionDurationFrames`）。**至少两种交替**（不全程同一种）。

## 三、字幕动效

- **词级高亮**：`createTikTokStyleCaptions` 分页 → 当前 token 放大 + 变色（`captionActive`），过渡 80ms。
- **整句入场**：slide-up + fade。
- 中文整句单 token → 词级退化为句级（见 captions-guide 中文注意）。

## 四、借鉴机制（拆解动效法）

参考视频 → 拆成"字幕风 + 转场 + 节奏"三段描述 → 转成 Remotion 原语组合：

```
参考视频"第 3 秒有个推近" 
  → PunchInTransition(scale 1→1.08, 12帧) 在字幕第 N 句 startFrame 触发
参考视频"数字是滚出来的" 
  → AnimatedNumber(durationFrames=30)
```

从 `video-real-library.md` 抓参考 → 用 `motion-list.md`（类别模板）匹配组件 → 参数按 DESIGN.md tokens 覆盖。

## 五、纪律

- 只动 transform/opacity；禁布局属性。
- 时长 120-700ms 或按 tokens；进入 ease-out、退出 ease-in。
- 确定性动画（无 `Math.random`、无浏览器定时器）。
- `prefers-reduced-motion` 不适用于视频（无用户偏好），但 **SEIZURE 红线**适用（避免 >3Hz 闪烁）。
