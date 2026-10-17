// motion-library/adaptive-scrim.tsx
// 自适应字幕衬底 T6：按背景明暗（bgLightness 0-1）自动决定字幕衬底强度，替写死的固定 scrim。
//
// 许可边界（AGPL-3.0 clean-room）：借鉴 OpenMontage heroScrim 的**思路**（按背景明暗自适应衬底，
// 来源项目 AGPL-3.0，见 docs/ATTRIBUTION.md）；**未复制其任何源码**，以下映射与组件全部从零自写，随本仓 MIT。
//
// 设计约束（守 video-quality-metrics 对比度底线）：字幕=大字 ≥3:1。映射保证任意 bgLightness 下
// 衬底把字幕背后的有效背景压到足够暗，使白字幕对比 ≥3:1（实测亮底 0.85→opacity0.725→对比≈9.4；
// 暗底 0.1→opacity0.35→对比更高）。自适应的目标是"始终≥底线"，不是"允许更低"。
//
// bgLightness 来源：DESIGN §8.1 每场景字段（0-1），由 layout_calc / 视觉判断 / 素材平均亮度给出。
// 确定性：纯函数映射 + 可选帧驱动淡入，禁 Math.random。

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// 衬底基色（近黑深蓝，与暗色设计协调）
const SCRIM_RGB = "6,16,38";

// 背景明暗 → 衬底不透明度：亮底需要更强衬底，暗底只需轻衬底。
// opacity = clamp(0.30 + 0.50 * lightness, 0.30, 0.80)
export const bgLightnessToScrim = (
  bgLightness: number
): { color: string; opacity: number } => {
  const l = Math.min(1, Math.max(0, bgLightness));
  const opacity = Math.min(0.8, Math.max(0.3, 0.3 + 0.5 * l));
  return { color: `rgb(${SCRIM_RGB})`, opacity };
};

// 字幕胶囊/盒衬底的 CSS（box 模式）：直接给 CaptionBox 类容器用
export const captionScrimBoxStyle = (
  bgLightness: number
): React.CSSProperties => {
  const { color, opacity } = bgLightnessToScrim(bgLightness);
  return {
    background: `rgba(${SCRIM_RGB},${opacity.toFixed(3)})`,
    borderRadius: 16,
    padding: "12px 24px",
    color,
  };
};

type AdaptiveScrimProps = {
  bgLightness: number; // 该场景背景明暗 0-1（DESIGN §8.1）
  mode?: "gradient" | "solid"; // 底部渐变（默认）或整幅纯色
  height?: number; // gradient 模式的底部高度 px（默认 520）
  fadeFrames?: number; // 入场淡入帧数（默认 12；0=不淡入）
};

// 底部自适应 scrim 层：放在字幕层之下、场景层之上
export const AdaptiveCaptionScrim: React.FC<AdaptiveScrimProps> = ({
  bgLightness,
  mode = "gradient",
  height = 520,
  fadeFrames = 12,
}) => {
  const frame = useCurrentFrame();
  const { opacity } = bgLightnessToScrim(bgLightness);
  const fade =
    fadeFrames > 0
      ? interpolate(frame, [0, fadeFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const o = opacity * fade;

  if (mode === "solid") {
    return (
      <AbsoluteFill
        style={{ background: `rgba(${SCRIM_RGB},${o.toFixed(3)})`, pointerEvents: "none" }}
      />
    );
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none", justifyContent: "flex-end" }}>
      <div
        style={{
          height,
          width: "100%",
          background: `linear-gradient(to top, rgba(${SCRIM_RGB},${o.toFixed(3)}) 0%, rgba(${SCRIM_RGB},${(o * 0.6).toFixed(3)}) 45%, rgba(${SCRIM_RGB},0) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
