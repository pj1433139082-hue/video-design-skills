// motion-library/captions-highlight.tsx
// 字幕组件：词级高亮（TikTok 风）/ 整句模式
// 依赖 @remotion/captions 的 createTikTokStyleCaptions + remotion 的 Sequence/useCurrentFrame
//
// 注意：
// 1. 中文无空格分词，createTikTokStyleCaptions 会将整句作单 token → 词级高亮对中文退化为句级。
// 2. 更重要：createTikTokStyleCaptions 会把间隔 < combineTokensWithinMilliseconds 的相邻句子
//    合并成一个 page。因此 line/none 模式（最常见的逐句字幕）**不走该函数**，
//    直接用 captions 数组逐句 <Sequence>，帧对齐完全可控。只有明确要词级高亮的 word 模式才用。

import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { createTikTokStyleCaptions } from "@remotion/captions";
import type { Caption } from "@remotion/captions";

export type HighlightMode = "word" | "line" | "none";

export type CaptionTheme = {
  activeColor: string; // 当前高亮色
  inactiveColor: string; // 未高亮色
  stroke: string; // 描边色
  bg: string; // 背景色（可为 transparent）
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
};

export type CaptionLayout = {
  x: number;
  y: number;
  width: number;
  maxLines: number;
  switchEveryMs: number;
};

const defaultTheme: CaptionTheme = {
  activeColor: "#39E508",
  inactiveColor: "#ffffff",
  stroke: "rgba(0,0,0,0.6)",
  bg: "rgba(0,0,0,0.45)",
  fontFamily: "Noto Sans SC, sans-serif",
  fontSize: 64,
  fontWeight: 700,
  lineHeight: 1.4,
};

const defaultLayout: CaptionLayout = {
  x: 80,
  y: 1500,
  width: 920,
  maxLines: 2,
  switchEveryMs: 1200,
};

type Props = {
  captions: Caption[];
  theme?: Partial<CaptionTheme>;
  layout?: Partial<CaptionLayout>;
  highlightMode?: HighlightMode;
};

export const CaptionLayer: React.FC<Props> = ({
  captions,
  theme = {},
  layout = {},
  highlightMode = "line",
}) => {
  const t = { ...defaultTheme, ...theme };
  const l = { ...defaultLayout, ...layout };
  const { fps } = useVideoConfig();

  if (highlightMode === "word") {
    return <WordHighlight captions={captions} theme={t} layout={l} />;
  }

  // line / none：逐句 Sequence，帧对齐由 startMs/endMs 精确控制
  return (
    <AbsoluteFill>
      {captions.map((cap, i) => {
        const startFrame = Math.round((cap.startMs / 1000) * fps);
        const endFrame = Math.round((cap.endMs / 1000) * fps);
        const durationInFrames = Math.max(1, endFrame - startFrame);
        return (
          <Sequence key={i} from={startFrame} durationInFrames={durationInFrames}>
            <CaptionBox theme={t} layout={l}>
              <span
                style={{
                  color:
                    highlightMode === "line" ? t.activeColor : t.inactiveColor,
                }}
              >
                {cap.text}
              </span>
            </CaptionBox>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// word 模式：createTikTokStyleCaptions 分页 + 当前词高亮
const WordHighlight: React.FC<{
  captions: Caption[];
  theme: CaptionTheme;
  layout: CaptionLayout;
}> = ({ captions, theme, layout }) => {
  const { fps } = useVideoConfig();
  // 中文整句单 token → combineThreshold 取小值，避免把相邻句子合并成一页
  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: 50,
  });

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endFrame = Math.round(
          ((page.startMs + page.durationMs) / 1000) * fps
        );
        const durationInFrames = Math.max(1, endFrame - startFrame);
        return (
          <Sequence key={i} from={startFrame} durationInFrames={durationInFrames}>
            <WordPage page={page} theme={theme} layout={layout} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

type TikTokPage = {
  text: string;
  startMs: number;
  durationMs: number;
  tokens: { text: string; fromMs: number; toMs: number }[];
};

const WordPage: React.FC<{
  page: TikTokPage;
  theme: CaptionTheme;
  layout: CaptionLayout;
}> = ({ page, theme, layout }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000; // 本页内相对时间
  const absMs = page.startMs + ms;

  return (
    <CaptionBox theme={theme} layout={layout}>
      {page.tokens.map((tok, idx) => {
        const active = absMs >= tok.fromMs && absMs < tok.toMs;
        return (
          <span
            key={idx}
            style={{
              color: active ? theme.activeColor : theme.inactiveColor,
              transform: active ? "scale(1.06)" : "scale(1)",
              display: "inline-block",
              transition: "transform 80ms linear",
            }}
          >
            {tok.text}
          </span>
        );
      })}
    </CaptionBox>
  );
};

const CaptionBox: React.FC<{
  theme: CaptionTheme;
  layout: CaptionLayout;
  children: React.ReactNode;
}> = ({ theme, layout, children }) => (
  <div
    style={{
      position: "absolute",
      left: layout.x,
      top: layout.y,
      width: layout.width,
      maxLines: layout.maxLines,
      textAlign: "center",
      whiteSpace: "pre-line",
      background: theme.bg,
      borderRadius: 16,
      padding: "12px 24px",
      fontFamily: theme.fontFamily,
      fontSize: theme.fontSize,
      fontWeight: theme.fontWeight,
      lineHeight: theme.lineHeight,
      WebkitTextStroke: `2px ${theme.stroke}`,
      paintOrder: "stroke fill",
    }}
  >
    {children}
  </div>
);

// 单条整句字幕（不依赖分页，直接给定时间戳）
export const CaptionLine: React.FC<{
  text: string;
  startMs: number;
  endMs: number;
  theme?: Partial<CaptionTheme>;
  layout?: Partial<CaptionLayout>;
}> = ({ text, startMs, endMs, theme = {}, layout = {} }) => {
  const t = { ...defaultTheme, ...theme };
  const l = { ...defaultLayout, ...layout };
  const { fps } = useVideoConfig();
  const startFrame = Math.round((startMs / 1000) * fps);
  const durationInFrames = Math.max(1, Math.round((endMs / 1000) * fps) - startFrame);
  return (
    <Sequence from={startFrame} durationInFrames={durationInFrames}>
      <CaptionBox theme={t} layout={l}>
        <span style={{ color: t.inactiveColor }}>{text}</span>
      </CaptionBox>
    </Sequence>
  );
};
