'use client'
import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react'
import { getDerivedVideoSettings, VIDEO_DIMENSIONS, FONT_MAP, VideoLayoutConfig } from '@/lib/video-settings'

// --- 1. STRICT INTERFACES ---
interface PreviewProps {
  config: VideoLayoutConfig;
  videoFile?: File | null;
  title: string;
  ranks: string[];
}

type FontStatus = 'loading' | 'ready' | 'error';

// --- 2. fitText CACHE ---
const fitTextCache = new Map<string, { size: number; lines: string[] }>();

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
  initialSize: number
): { size: number; lines: string[] } {
  const key = `${text}|${maxWidth}|${maxLines}|${initialSize}`;
  if (fitTextCache.has(key)) return fitTextCache.get(key)!;

  let result: { size: number; lines: string[] } = { size: 10, lines: [text] };

  outer: for (let size = initialSize; size >= 10; size -= 2) {
    ctx.font = `${size}px CustomFont`;
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    for (const word of words) {
      const test = currentLine ? `${currentLine} ${word}` : word;
      if (ctx.measureText(test).width <= maxWidth) {
        currentLine = test;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    if (lines.length <= maxLines) {
      result = { size, lines };
      break outer;
    }
  }

  fitTextCache.set(key, result);
  return result;
}

function invalidateFitTextCache() {
  fitTextCache.clear();
}

// --- 3. LAYER CONSTANTS ---
const W = VIDEO_DIMENSIONS.WIDTH;
const H = VIDEO_DIMENSIONS.HEIGHT;

export const OverlayPreview = memo(function OverlayPreview({
  config,
  videoFile,
  title,
  ranks,
}: PreviewProps) {
  const bgCanvasRef   = useRef<HTMLCanvasElement>(null);
  const textCanvasRef = useRef<HTMLCanvasElement>(null);
  const wmCanvasRef   = useRef<HTMLCanvasElement>(null);

  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [fontStatus, setFontStatus]   = useState<FontStatus>('loading');
  const [frameLoaded, setFrameLoaded] = useState(false);

  const bgRafRef   = useRef<number | null>(null);
  const textRafRef = useRef<number | null>(null);
  const wmRafRef   = useRef<number | null>(null);

  useEffect(() => {
    const off = document.createElement('canvas');
    off.width  = W;
    off.height = H;
    offscreenRef.current = off;
  }, []);

  useEffect(() => {
    let active = true;
    let loadedFont: FontFace | null = null;

    const loadFont = async () => {
      setFontStatus('loading');
      invalidateFitTextCache();
      try {
        const fontName = config.fontFamily || 'Archivo Expanded Bold';
        const fileName  = FONT_MAP[fontName] || 'font.ttf';
        const font      = new FontFace('CustomFont', `url(/fonts/${fileName})`);
        await font.load();
        if (active) {
          document.fonts.add(font);
          loadedFont = font;
          setFontStatus('ready');
        }
      } catch (err) {
        console.error('Font loading failed:', err);
        if (active) setFontStatus('error');
      }
    };

    loadFont();

    return () => {
      active = false;
      if (loadedFont) document.fonts.delete(loadedFont);
    };
  }, [config.fontFamily]);

  useEffect(() => {
    if (!videoFile) {
      setFrameLoaded(false);
      if (videoRef.current) videoRef.current.src = '';
      return;
    }

    const url   = URL.createObjectURL(videoFile);
    const video = videoRef.current;
    if (video) {
      video.src         = url;
      video.currentTime = 0.1;
      video.load();
    }

    return () => {
      if (video) video.src = '';
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  const handleVideoLoad = useCallback(() => {
    setFrameLoaded((prev) => (prev ? prev : true));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // SERVER CONSTANTS (Explicitly halving config values to match 540x960)
  // ─────────────────────────────────────────────────────────────────────────
  const SERVER = useMemo(() => getDerivedVideoSettings(config, 0.5), [config]);

  // ─────────────────────────────────────────────────────────────────────────
  // LAYER A — Background / video frame
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (bgRafRef.current !== null) cancelAnimationFrame(bgRafRef.current);

    bgRafRef.current = requestAnimationFrame(() => {
      bgRafRef.current = null;
      const canvas = bgCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, W, H);

      if (frameLoaded && videoRef.current) {
        const v       = videoRef.current;
        const tAspect = W / H;
        const vAspect = v.videoWidth / v.videoHeight;
        let sx = 0, sy = 0, sw = v.videoWidth, sh = v.videoHeight;
        if (vAspect > tAspect) {
          sw = v.videoHeight * tAspect;
          sx = (v.videoWidth - sw) / 2;
        } else {
          sh = v.videoWidth / tAspect;
          sy = (v.videoHeight - sh) / 2;
        }
        ctx.drawImage(v, sx, sy, sw, sh, 0, 0, W, H);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, W, H);
      }
    });

    return () => {
      if (bgRafRef.current !== null) {
        cancelAnimationFrame(bgRafRef.current);
        bgRafRef.current = null;
      }
    };
  }, [frameLoaded]);

  // ─────────────────────────────────────────────────────────────────────────
  // LAYER B — Backdrop + title + ranks
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (fontStatus !== 'ready') return;
    if (textRafRef.current !== null) cancelAnimationFrame(textRafRef.current);

    textRafRef.current = requestAnimationFrame(() => {
      textRafRef.current = null;
      const canvas = textCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, W, H);
      ctx.lineJoin = 'round';
      ctx.lineCap  = 'round';

      // ── Measure title layout ──
      const { size: tSize, lines: tLines } = fitText(
        ctx, title || 'Title',
        SERVER.titleBoxWidth, SERVER.titleMaxLines, SERVER.titleFontSize
      );

      const textH     = tLines.length * tSize + (tLines.length - 1) * SERVER.titleLineSpacing;
      const subtitleH = config.subtitle
        ? SERVER.subtitleTopMargin + SERVER.subtitleFontSize
        : 0;
      const boxH = SERVER.titleBoxTopPadding + textH + subtitleH + SERVER.titleBoxBottomPadding;

      // ── Backdrop ──
      if (config.titleBackdrop === 'blurred') {
        const bgCanvas = bgCanvasRef.current;
        const off      = offscreenRef.current;
        if (bgCanvas && off) {
          off.width  = W;
          off.height = boxH;
          const offCtx = off.getContext('2d');
          if (offCtx) {
            offCtx.drawImage(bgCanvas, 0, 0, W, boxH, 0, 0, W, boxH);
            offCtx.filter = 'blur(20px)';
            offCtx.drawImage(off, 0, 0);
            offCtx.filter = 'none';
            ctx.drawImage(off, 0, 0);
          }
        }
      } else if (config.titleBackdrop === 'black' || config.titleBackdrop === 'white') {
        ctx.fillStyle = config.titleBackdrop;
        ctx.fillRect(0, 0, W, boxH);
      }

      // ── Title word-coloured text ──
      const wordColorMap = new Map<string, string>();
      (config.titleWordColors || []).forEach((item) => {
        wordColorMap.set(item.word.toLowerCase(), item.color);
      });

      const drawColoredLine = (line: string, centerX: number, y: number, fontSize: number) => {
        ctx.save();
        ctx.font      = `${fontSize}px CustomFont`;
        ctx.textAlign = 'left';
        ctx.lineJoin  = 'round';
        ctx.lineCap   = 'round';

        const totalLineWidth = ctx.measureText(line).width;
        let currentX = centerX - totalLineWidth / 2;

        line.split(' ').forEach((word, i, arr) => {
          const displayWord = i < arr.length - 1 ? `${word} ` : word;
          const color       = wordColorMap.get(word.toLowerCase()) || 'white';
          if (config.textShadow !== false) {
            ctx.strokeStyle = 'black';
            ctx.lineWidth   = SERVER.textOutlineWidth;
            ctx.strokeText(displayWord, currentX, y);
          }
          ctx.fillStyle = color;
          ctx.fillText(displayWord, currentX, y);
          currentX += ctx.measureText(displayWord).width;
        });
        ctx.restore();
      };

      ctx.textBaseline = 'top';
      ctx.shadowColor  = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur   = config.titleShadowBlur ? config.titleShadowBlur * 0.5 : 0;

      let currY = (boxH - subtitleH - textH) / 2;
      tLines.forEach((line) => {
        drawColoredLine(line, W / 2, currY, tSize);
        currY += tSize + SERVER.titleLineSpacing;
      });

      // ── Subtitle ──
      if (config.subtitle) {
        ctx.save();
        ctx.shadowBlur  = 0;
        ctx.font        = `${SERVER.subtitleFontSize}px CustomFont`;
        ctx.textAlign   = 'center';
        ctx.lineJoin    = 'round';
        ctx.lineCap     = 'round';
        if (config.textShadow !== false) {
          ctx.strokeStyle = 'black';
          ctx.lineWidth   = SERVER.textOutlineWidth * 0.5;
          ctx.strokeText(config.subtitle, W / 2, currY + SERVER.subtitleTopMargin);
        }
        ctx.fillStyle = config.subtitleColor || '#CCCCCC';
        ctx.fillText(config.subtitle, W / 2, currY + SERVER.subtitleTopMargin);
        ctx.restore();
      }

      // ── Ranks ──
      ranks.forEach((rank, i) => {
        if (!rank) return;
        const y         = SERVER.rankPaddingY + boxH + i * SERVER.rankSpacing;
        const fontSize  = SERVER.rankFontSize;
        const rankColor = config.rankColors?.[i] ?? 'white';

        ctx.save();
        ctx.textBaseline = 'top';
        ctx.textAlign    = 'left';
        ctx.shadowBlur   = config.rankShadowBlur ? config.rankShadowBlur * 0.5 : 0;
        ctx.shadowColor  = 'rgba(0,0,0,0.8)';
        ctx.lineJoin     = 'round';
        ctx.lineCap      = 'round';

        ctx.font = `${fontSize}px CustomFont`;
        if (config.textShadow !== false) {
          ctx.strokeStyle = 'black';
          ctx.lineWidth   = SERVER.textOutlineWidth;
          ctx.strokeText(`${i + 1}.`, SERVER.rankNumX, y);
        }
        ctx.fillStyle = rankColor;
        ctx.fillText(`${i + 1}.`, SERVER.rankNumX, y);

        const rRes       = fitText(ctx, rank, SERVER.rankBoxWidth, 1, fontSize);
        const centeredY  = y + (fontSize - rRes.size) / 2;
        ctx.font         = `${rRes.size}px CustomFont`;
        if (config.textShadow !== false) {
          ctx.strokeText(rRes.lines[0], SERVER.rankTextX, centeredY);
        }
        ctx.fillStyle = config.matchRankColor ? rankColor : 'white';
        ctx.fillText(rRes.lines[0], SERVER.rankTextX, centeredY);
        ctx.restore();
      });
    });

    return () => {
      if (textRafRef.current !== null) {
        cancelAnimationFrame(textRafRef.current);
        textRafRef.current = null;
      }
    };
  }, [config, fontStatus, title, ranks, SERVER]);

  // ─────────────────────────────────────────────────────────────────────────
  // LAYER C — Watermarks
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (fontStatus !== 'ready') return;
    if (wmRafRef.current !== null) cancelAnimationFrame(wmRafRef.current);

    wmRafRef.current = requestAnimationFrame(() => {
      wmRafRef.current = null;
      const canvas = wmCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, W, H);
      ctx.textBaseline = 'top';
      ctx.lineJoin     = 'round';
      ctx.lineCap      = 'round';
      ctx.shadowBlur   = 15;
      ctx.shadowColor  = 'rgba(0,0,0,0.8)';

      // ranktop.net
      ctx.globalAlpha = 0.6;
      ctx.font         = `${SERVER.watermarkFontSize}px CustomFont`;
      ctx.textAlign    = 'right';
      const siteX = W - SERVER.watermarkPadding;
      const siteY = H - SERVER.watermarkFontSize - SERVER.watermarkPadding;
      
      if (config.textShadow !== false) {
        ctx.strokeStyle = 'black';
        ctx.lineWidth   = SERVER.textOutlineWidth;
        ctx.strokeText('ranktop.net', siteX, siteY);
      }
      ctx.fillStyle   = 'white';
      ctx.fillText('ranktop.net', siteX, siteY);

      // creator
      if (config.creatorWatermark) {
        ctx.globalAlpha = 0.7;
        ctx.font         = `${SERVER.creatorWatermarkFontSize}px CustomFont`;
        ctx.textAlign    = 'center';
        const cwY       = H - SERVER.creatorWatermarkFontSize - SERVER.creatorWatermarkBottomPadding;
        
        if (config.textShadow !== false) {
          ctx.strokeStyle = 'black';
          ctx.lineWidth   = SERVER.textOutlineWidth * 0.6;
          ctx.strokeText(config.creatorWatermark, W / 2, cwY);
        }
        ctx.fillStyle   = config.creatorWatermarkColor || 'white';
        ctx.fillText(config.creatorWatermark, W / 2, cwY);
      }
    });

    return () => {
      if (wmRafRef.current !== null) {
        cancelAnimationFrame(wmRafRef.current);
        wmRafRef.current = null;
      }
    };
  }, [fontStatus, config.creatorWatermark, config.creatorWatermarkColor, config.textShadow, SERVER]);

  // ─────────────────────────────────────────────────────────────────────────
  // FONT ERROR STATE
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (fontStatus !== 'error') return;
    const canvas = textCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#450a0a';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle   = 'white';
    ctx.font        = '20px sans-serif';
    ctx.textAlign   = 'center';
    ctx.fillText('CRITICAL: FONT LOADING FAILED', W / 2, H / 2);
  }, [fontStatus]);

  return (
    <div style={{ willChange: 'transform' }} className="relative w-full aspect-[9/16] max-w-[280px] mx-auto bg-black rounded-lg overflow-hidden border-2 border-slate-700">
      <canvas
        ref={bgCanvasRef}
        width={W}
        height={H}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas
        ref={textCanvasRef}
        width={W}
        height={H}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <canvas
        ref={wmCanvasRef}
        width={W}
        height={H}
        className="absolute inset-0 w-full h-full object-cover"
      />

      <video
        ref={videoRef}
        onLoadedData={handleVideoLoad}
        onSeeked={handleVideoLoad}
        className="hidden"
        muted
        playsInline
      />
    </div>
  );
});