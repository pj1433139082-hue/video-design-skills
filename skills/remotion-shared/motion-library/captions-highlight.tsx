// motion-library/captions-highlight.tsx
// 字幕组件：词级高亮（TikTok 风）/ 整句模式
// 依赖 remotion 的 Sequence/useCurrentFrame；word 模式分页为**本文件自实现**（#42 修复）。
//
// 注意（#42 修复后）：
// 1. 分页不再依赖 @remotion/captions 的 createTikTokStyleCaptions——它仅以"token 以空格开头"换页
//    （英文行为），中文无空格会整篇并入一页；且其 page.durationMs 延到下一页开始，导致句尾字幕
//    滞留进呼吸 gap。现改为自分页：句末标点（。！？；!?;）/ 单页字数上限 / 词间 gap 阈值 断页，
//    中文无需前导空格 hack（旧数据的前导空格会被 trim 兼容）。
// 2. 页显示区间 = [首 token.fromMs, 末 token.toMs]，**句尾即消失**，gap 无字幕（字幕对齐预期）。
// 3. line/none 模式不走分页，直接用 captions 数组逐句 Sequence，帧对齐完全可控。

import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
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

// ---------- word 模式：自分页（#42 修复）+ 当前词高亮 ----------
type WordToken = { text: string; fromMs: number; toMs: number };
type WordPage = { tokens: WordToken[]; startMs: number; endMs: number };

const SENT_END = /[。！？；!?;]$/; // 句末标点断页
const MAX_PAGE_CHARS = 18; // 单页字数上限（防超长句溢出）
const PAGE_GAP_MS = 350; // 词间间隔超此值断页（句间呼吸 gap）

// 中文无需前导空格 hack：按 句末标点 / 字数上限 / 词间 gap 断页；
// 页区间 = [首 token.fromMs, 末 token.toMs]（句尾即消失，gap 无字幕）。
export const buildWordPages = (captions: Caption[]): WordPage[] => {
  const pages: WordPage[] = [];
  let cur: WordToken[] = [];
  let chars = 0;
  const flush = () => {
    if (cur.length === 0) return;
    pages.push({
      tokens: cur,
      startMs: cur[0].fromMs,
      endMs: cur[cur.length - 1].toMs,
    });
    cur = [];
    chars = 0;
  };
  captions.forEach((c) => {
    const text = c.text.trim(); // 兼容旧"前导空格换页"数据
    if (text === "") return;
    if (cur.length > 0 && c.startMs - cur[cur.length - 1].toMs > PAGE_GAP_MS) {
      flush();
    }
    cur.push({ text, fromMs: c.startMs, toMs: c.endMs });
    chars += text.length;
    if (SENT_END.test(text) || chars >= MAX_PAGE_CHARS) flush();
  });
  flush();
  return pages;
};

const WordHighlight: React.FC<{
  captions: Caption[];
  theme: CaptionTheme;
  layout: CaptionLayout;
}> = ({ captions, theme, layout }) => {
  const { fps } = useVideoConfig();
  const pages = buildWordPages(captions);

  return (
    <AbsoluteFill>
      {pages.map((page, i) => {
        const startFrame = Math.round((page.startMs / 1000) * fps);
        const endFrame = Math.round((page.endMs / 1000) * fps);
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

const WordPage: React.FC<{
  page: WordPage;
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
