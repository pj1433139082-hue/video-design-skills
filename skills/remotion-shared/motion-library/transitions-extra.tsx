// motion-library/transitions-extra.tsx
// 补充转场：柔和擦除 / 霓虹光带 / 层叠揭示 / 透视翻转 / 摆动 / 环绕 / 分裂 / 色差 / 光圈 / 溶解
// 确定性动画，帧驱动；只动 transform/opacity / clip-path / filter

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

type P = { children: React.ReactNode; durationFrames?: number; direction?: "in" | "out" };

// 柔和擦除：带圆形弧度的蒙版从左上角平滑展开（比直角 Wipe 更柔和）
export const SmoothWipe: React.FC<P & { from?: "left" | "right" | "top" | "bottom" }> = ({
  children,
  durationFrames = 20,
  from = "left",
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationFrames], [100, 0], { extrapolateRight: "clamp" });
  const clip =
    from === "left" ? `inset(0 ${progress}% 0 0 round 40px)` :
    from === "right" ? `inset(0 0 0 ${progress}% round 40px)` :
    from === "top" ? `inset(${progress}% 0 0 0 round 40px)` :
    `inset(0 0 ${progress}% 0 round 40px)`;
  return <AbsoluteFill style={{ clipPath: clip }}>{children}</AbsoluteFill>;
};

// 霓虹光带：一道亮色光带横向扫过，把下层内容照亮显现
export const NeonWipe: React.FC<P & { color?: string }> = ({
  children,
  durationFrames = 24,
  color = "#22d3ee",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const progress = interpolate(frame, [0, durationFrames], [-0.2, 1.2], { extrapolateRight: "clamp" });
  const x = width * progress;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 下层内容先以低亮显示，光带扫过后恢复正常 */}
      <AbsoluteFill style={{ opacity: 0.35, filter: "saturate(0.4)" }}>{children}</AbsoluteFill>
      {/* 高亮内容随光带移动，形成擦除 */}
      <AbsoluteFill style={{ clipPath: `inset(0 ${Math.max(0, 100 - progress * 100)}% 0 0)` }}>
        {children}
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: x - 30,
          width: 120,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          filter: `blur(6px)`,
          opacity: interpolate(frame, [Math.floor(durationFrames * 0.1), durationFrames], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          boxShadow: `0 0 40px 10px ${color}`,
          height,
        }}
      />
    </AbsoluteFill>
  );
};

// 层叠揭示：多条内容以叠放卡片的形式依次错位落定（适合多图层场景）
export const StackReveal: React.FC<P & { layers?: number; offset?: number }> = ({
  children,
  durationFrames = 24,
  layers = 3,
  offset = 24,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = React.Children.toArray(children);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative" }}>
        {items.map((child, i) => {
          const start = Math.round((i / Math.max(1, items.length - 1)) * durationFrames);
          const p = interpolate(frame, [start, start + Math.max(1, Math.round(fps * 0.2))], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const settle = 1 - Math.pow(1 - p, 3); // ease-out 落定
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: (items.length - 1 - i) * offset * 0.5,
                top: i * offset * 0.4,
                opacity: p,
                transform: `translateY(${(1 - settle) * 60}px) scale(${1 - (items.length - 1 - i) * 0.03})`,
                zIndex: items.length - i,
              }}
            >
              {child}
            </div>
          );
        })}
        {/* 占位撑起高度，避免外层塌陷 */}
        <div style={{ opacity: 0 }}>{items[items.length - 1]}</div>
      </div>
    </AbsoluteFill>
  );
};

// 透视翻转：带 perspective 的 Y 轴 3D 翻转（比 FlipTransition 多一层景深感）
export const PerspectiveFlip: React.FC<P & { axis?: "x" | "y"; perspective?: number }> = ({
  children,
  durationFrames = 26,
  axis = "y",
  perspective = 800,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const progress = interpolate(frame, [0, durationFrames], [100, 0], { extrapolateRight: "clamp" });
  const angle = progress;
  const transform = axis === "y" ? `rotateY(${angle}deg)` : `rotateX(${angle}deg)`;
  return (
    <AbsoluteFill
      style={{
        width,
        height,
        perspective,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ transform, transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};

// 摆动入场：绕底部中心来回摆动后稳定（门轴感）
export const SwingTransition: React.FC<P & { maxDeg?: number }> = ({
  children,
  durationFrames = 28,
  maxDeg = 20,
}) => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / durationFrames);
  // 阻尼正弦：先大幅摆动，逐步收敛到 0
  const deg = maxDeg * Math.exp(-3.5 * t) * Math.cos(t * 6.5);
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `rotate(${deg}deg)`,
        transformOrigin: "center bottom",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 环绕：内容绕画布中心沿圆弧切入（行星入轨感）
export const OrbitTransition: React.FC<P & { distance?: number; arc?: number }> = ({
  children,
  durationFrames = 30,
  distance = 300,
  arc = 90,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationFrames], [0, 1], { extrapolateRight: "clamp" });
  const angle = (p * arc * Math.PI) / 180; // 0 → arc 度
  const x = Math.sin(angle) * distance;
  const y = (1 - Math.cos(angle)) * distance * 0.6;
  const opacity = interpolate(frame, [0, Math.floor(durationFrames * 0.3)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity,
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// 分裂揭示：内容从中间向两侧裂开（上半上移、下半下移），露出下层
export const SplitReveal: React.FC<P & { gap?: number }> = ({
  children,
  durationFrames = 22,
  gap = 0,
}) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, durationFrames], [0, 1], { extrapolateRight: "clamp" });
  const split = progress * 50 + gap / 2;
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {/* 上半：向上移出 */}
      <AbsoluteFill style={{ clipPath: `inset(0 0 ${100 - split}% 0)`, transform: `translateY(${-progress * 100}px)` }}>
        {children}
      </AbsoluteFill>
      {/* 下半：向下移出 */}
      <AbsoluteFill style={{ clipPath: `inset(${split}% 0 0 0)`, transform: `translateY(${progress * 100}px)` }}>
        {children}
      </AbsoluteFill>
      {/* 下层内容（被揭示）始终可见 */}
    </AbsoluteFill>
  );
};

// 色差抖动：RGB 三通道分离再合拢（故障风格）
export const ChromaticAberration: React.FC<P & { maxOffset?: number }> = ({
  children,
  durationFrames = 16,
  maxOffset = 12,
}) => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / durationFrames);
  const amp = maxOffset * (1 - t) * Math.sin(t * Math.PI);
  const rx = Math.sin(frame * 7.3) * amp;
  const bx = Math.cos(frame * 5.1) * amp;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill style={{ color: "rgba(255,0,60,0.55)", transform: `translateX(${rx}px)` }}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{ color: "rgba(0,180,255,0.55)", transform: `translateX(${bx}px)` }}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - amp / maxOffset }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// 光圈揭示：菱形/圆角矩形蒙版从中心向外扩（舞台追光感）
export const IrisReveal: React.FC<P & { shape?: "circle" | "diamond" }> = ({
  children,
  durationFrames = 24,
  shape = "diamond",
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const progress = interpolate(frame, [0, durationFrames], [0, 1], { extrapolateRight: "clamp" });
  const radius = Math.hypot(width, height) * progress;
  const clip =
    shape === "circle"
      ? `circle(${radius}px at 50% 50%)`
      : `polygon(50% ${50 - radius}%, ${50 + radius}% 50%, 50% ${50 + radius}%, ${50 - radius}% 50%)`;
  return <AbsoluteFill style={{ clipPath: clip }}>{children}</AbsoluteFill>;
};

// 溶解转场：棋盘格逐块淡出，露出下层
export const DissolveTransition: React.FC<P & { cols?: number; rows?: number }> = ({
  children,
  durationFrames = 26,
  cols = 8,
  rows = 6,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, durationFrames], [0, 1], { extrapolateRight: "clamp" });
  const cells = cols * rows;
  return (
    <AbsoluteFill style={{ background: "#0a0a0a" }}>
      {children}
      {Array.from({ length: cells }, (_, i) => {
        // 每块按 index 交错出现，形成随机溶解感
        const start = ((i * 53) % cells) / cells * durationFrames;
        const local = interpolate(frame, [start, start + 6], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const c = i % cols;
        const r = Math.floor(i / cols);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${(c / cols) * 100}%`,
              top: `${(r / rows) * 100}%`,
              width: `${100 / cols}%`,
              height: `${100 / rows}%`,
              background: "#0a0a0a",
              opacity: Math.min(1, Math.max(0, local * 1.2)),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
