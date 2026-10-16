// motion-library/scene-transition.tsx
// 场景卡转场层 T5：SceneTransitionSeries —— 把多张场景卡以 **crossfade（交叉淡化）** 串联，
// 解决两个实测缺陷（T2 e2e 发现，见 #31）：
//   ① 卡间硬切：上一张满画面直接跳下一张（pop）；
//   ② 渐入空白：单卡入场 opacity 0→1，段首若干帧只剩平底背景（近空白）。
// 原理：overlap 期间 outgoing 与 incoming 透明度互补（和≈1），任何一帧都至少有一张卡可见 →
//       不露空底、不硬跳；首卡默认不渐入（firstFadeIn=false），消掉开头空白。
//
// 依赖边界：本实现 **零新增依赖**（只用 remotion 核心 interpolate，clean-room 自写）。
// 官方 `@remotion/transitions`（更多 presentation：slide/wipe/flip）在 docs/DEPENDENCIES.md
// 登记为**可选**上游；本仓默认 crossfade 不依赖它（本地骨架 toolchain 未含该包，见 #31 订正）。
//
// 确定性动画：帧驱动 interpolate，禁 Math.random 与浏览器定时器。

import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { SceneRenderer, type SceneCut, type SceneCardTheme } from "./scene-cards";

export type SceneTransitionItem = {
  cut: SceneCut;
  theme?: SceneCardTheme;
};

type SceneTransitionSeriesProps = {
  items: SceneTransitionItem[];
  segmentFrames?: number; // 每卡占用帧数 L（含 overlap）
  crossfadeFrames?: number; // 交叉淡化帧数 X（overlap）
  theme?: SceneCardTheme; // 全局默认 theme（item.theme 优先）
  firstFadeIn?: boolean; // 首卡是否渐入（默认 false = 首帧即满画面，防开头空白）
  durationFrames?: number; // 传给场景卡的内部动效帧数
};

const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// 总帧数 = N*L - (N-1)*X
export const sceneTransitionTotalFrames = (
  count: number,
  segmentFrames: number,
  crossfadeFrames: number
) => count * segmentFrames - (count - 1) * crossfadeFrames;

export const SceneTransitionSeries: React.FC<SceneTransitionSeriesProps> = ({
  items,
  segmentFrames = 45,
  crossfadeFrames = 12,
  theme,
  firstFadeIn = false,
  durationFrames,
}) => {
  const frame = useCurrentFrame();
  const L = segmentFrames;
  const X = Math.min(crossfadeFrames, L - 1); // overlap 不能超过段长
  const step = L - X; // 相邻卡起点间隔

  return (
    <AbsoluteFill>
      {items.map((item, i) => {
        const start = i * step;
        const end = start + L;
        const preRoll = Math.max(0, start - X);
        // 预滚窗口 [start-X, start) 内卡片不可见但内部入场时钟已跑，
        // 使 crossfade 开始时 incoming 内部 opacity 已=1（避免双重淡化变暗/空白）
        if (frame < preRoll || frame > end) return null;
        const fadeIn = i === 0 && !firstFadeIn ? 1 : ramp(frame, start, start + X);
        const fadeOut = i === items.length - 1 ? 1 : 1 - ramp(frame, end - X, end);
        const opacity = fadeIn * fadeOut;
        return (
          <AbsoluteFill key={i} style={{ opacity }}>
            <Sequence from={preRoll} layout="none">
              <SceneRenderer
                cut={item.cut}
                theme={item.theme ?? theme}
                durationFrames={durationFrames}
                delayFrames={0}
              />
            </Sequence>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
