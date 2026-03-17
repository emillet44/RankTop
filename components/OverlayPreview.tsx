'use client'
import React, { useEffect, useRef, useState } from 'react'

// --- 1. STRICT INTERFACES ---
interface WordColor {
  word: string;
  color: string;
}

interface LayoutConfig {
  stylePreset: string;
  titleBackdrop: string;
  subtitle: string;
  subtitleColor: string;
  creatorWatermark: string;
  creatorWatermarkColor: string;
  titleWordColors: WordColor[];
  titleShadowBlur: number;
  rankShadowBlur: number;
  // Optional overrides to match server logic
  subtitleFontSize?: number;
  subtitleTopMargin?: number;
  titleFontSize?: number;
  titleLineSpacing?: number;
  titleBoxWidth?: number;
  titleMaxLines?: number;
  titleBoxTopPadding?: number;
  titleBoxBottomPadding?: number;
  rankFontSize?: number;
  rankSpacing?: number;
  rankPaddingY?: number;
  rankBoxWidth?: number;
  textOutlineWidth?: number;
  rankColors?: string[];
}

interface PreviewProps {
  config: LayoutConfig;
  videoFile?: File | null;
  title: string;
  ranks: string[];
}

type FontStatus = 'loading' | 'ready' | 'error';

export function OverlayPreview({ config, videoFile, title, ranks }: PreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const [fontStatus, setFontStatus] = useState<FontStatus>('loading');
  const [frameLoaded, setFrameLoaded] = useState(false);

  // --- 2. FONT LOADING ---
  useEffect(() => {
    let active = true;
    const loadFont = async () => {
      try {
        const font = new FontFace('CustomFont', 'url(/fonts/font.ttf)');
        await font.load();
        if (active) {
          document.fonts.add(font);
          setFontStatus('ready');
        }
      } catch (err) {
        console.error("Font loading failed:", err);
        if (active) setFontStatus('error');
      }
    };
    loadFont();
    return () => { active = false; };
  }, []);

  // --- 3. VIDEO SOURCE HANDLING ---
  useEffect(() => {
    if (!videoFile) {
      setFrameLoaded(false);
      if (videoRef.current) videoRef.current.src = '';
      return;
    }

    const url = URL.createObjectURL(videoFile);
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
      // Ensure we are at the first frame
      videoRef.current.currentTime = 0.1; 
    }

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  const handleVideoLoad = () => {
    setFrameLoaded(true);
  };

  // --- 4. RENDER LOOP ---
  useEffect(() => {
    // --- SERVER CONSTANTS (Internal Parity) ---
    const SERVER = {
      titleFontSize: config.titleFontSize ?? 100,
      titleLineSpacing: config.titleLineSpacing ?? 30,
      titleBoxWidth: config.titleBoxWidth ?? 980,
      titleMaxLines: config.titleMaxLines ?? 2,
      titleBoxTopPadding: config.titleBoxTopPadding ?? 30,
      titleBoxBottomPadding: config.titleBoxBottomPadding ?? 40,
      subtitleFontSize: config.subtitleFontSize ?? 44,
      subtitleTopMargin: config.subtitleTopMargin ?? 10,
      rankFontSize: config.rankFontSize ?? 60,
      rankSpacing: config.rankSpacing ?? 140,
      rankPaddingY: config.rankPaddingY ?? 80,
      rankBoxWidth: config.rankBoxWidth ?? 830,
      textOutlineWidth: config.textOutlineWidth ?? 18,
      watermarkFontSize: 48,
      watermarkPadding: 20,
      creatorWatermarkFontSize: 44,
      creatorWatermarkBottomPadding: 80,
    };

    // --- TYPED DRAWING HELPERS ---
    const fitText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number, initialSize: number) => {
      for (let size = initialSize; size >= 10; size -= 2) {
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
        if (lines.length <= maxLines) return { size, lines };
      }
      return { size: 10, lines: [text] };
    };

    const drawColoredLine = (
      ctx: CanvasRenderingContext2D,
      line: string,
      centerX: number,
      y: number,
      fontSize: number,
      config: LayoutConfig
    ): void => {
      ctx.save();
      ctx.font = `${fontSize}px CustomFont`;
      ctx.textAlign = 'left';

      const wordColors = config.titleWordColors || [];
      const wordColorMap = new Map<string, string>();
      wordColors.forEach((item) => {
        wordColorMap.set(item.word.toLowerCase(), item.color);
      });

      const totalLineWidth = ctx.measureText(line).width;
      let currentX = centerX - (totalLineWidth / 2);

      const words = line.split(' ');
      words.forEach((word, i) => {
        const displayWord = i < words.length - 1 ? `${word} ` : word;
        const color = wordColorMap.get(word.toLowerCase()) || 'white';

        ctx.strokeStyle = 'black';
        ctx.lineWidth = SERVER.textOutlineWidth;
        ctx.strokeText(displayWord, currentX, y);

        ctx.fillStyle = color;
        ctx.fillText(displayWord, currentX, y);

        currentX += ctx.measureText(displayWord).width;
      });
      ctx.restore();
    };

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 1080, 1920);

    // Hard Stop for Font Failure
    if (fontStatus === 'error') {
      ctx.fillStyle = "#450a0a";
      ctx.fillRect(0, 0, 1080, 1920);
      ctx.fillStyle = "white";
      ctx.font = "40px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CRITICAL: FONT LOADING FAILED", 1080 / 2, 1920 / 2);
      return;
    }

    // Still Loading
    if (fontStatus === 'loading') {
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, 1080, 1920);
      return;
    }

    // DRAWING START
    // Layer 1: Video
    if (frameLoaded && videoRef.current) {
      const v = videoRef.current;
      const tAspect = 1080 / 1920;
      const vAspect = v.videoWidth / v.videoHeight;
      let sx = 0, sy = 0, sw = v.videoWidth, sh = v.videoHeight;
      if (vAspect > tAspect) {
        sw = v.videoHeight * tAspect;
        sx = (v.videoWidth - sw) / 2;
      } else {
        sh = v.videoWidth / tAspect;
        sy = (v.videoHeight - sh) / 2;
      }
      ctx.drawImage(v, sx, sy, sw, sh, 0, 0, 1080, 1920);
    } else {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 1080, 1920);
    }

    // Layer 2: Backdrop Math
    const { size: tSize, lines: tLines } = fitText(
      ctx, title || "Title",
      SERVER.titleBoxWidth, SERVER.titleMaxLines, SERVER.titleFontSize
    );

    const textH = (tLines.length * tSize) + ((tLines.length - 1) * SERVER.titleLineSpacing);
    const subtitleH = config.subtitle ? SERVER.subtitleTopMargin + SERVER.subtitleFontSize : 0;
    const boxH = SERVER.titleBoxTopPadding + textH + subtitleH + SERVER.titleBoxBottomPadding;

    if (config.titleBackdrop === 'blurred') {
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, 1080, boxH); ctx.clip();
      ctx.filter = 'blur(40px)';
      ctx.drawImage(canvas, 0, 0); ctx.restore();
    } else if (config.titleBackdrop === 'black' || config.titleBackdrop === 'white') {
      ctx.fillStyle = config.titleBackdrop;
      ctx.fillRect(0, 0, 1080, boxH);
    }

    // Layer 3: Title
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = config.titleShadowBlur;

    let currY = ((boxH - subtitleH) - textH) / 2;
    tLines.forEach((line) => {
      drawColoredLine(ctx, line, 1080 / 2, currY, tSize, config);
      currY += tSize + SERVER.titleLineSpacing;
    });

    if (config.subtitle) {
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.font = `${SERVER.subtitleFontSize}px CustomFont`;
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = SERVER.textOutlineWidth * 0.5;
      ctx.strokeText(config.subtitle, 1080 / 2, currY + SERVER.subtitleTopMargin);
      ctx.fillStyle = config.subtitleColor || '#CCCCCC';
      ctx.fillText(config.subtitle, 1080 / 2, currY + SERVER.subtitleTopMargin);
      ctx.restore();
    }

    // Layer 4: Ranks
    ranks.forEach((rank, i) => {
      if (!rank) return;
      const y = SERVER.rankPaddingY + boxH + (i * SERVER.rankSpacing);
      const fontSize = SERVER.rankFontSize;

      ctx.save();
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.shadowBlur = config.rankShadowBlur;
      ctx.shadowColor = 'rgba(0,0,0,0.8)';

      // Number
      ctx.font = `${fontSize}px CustomFont`;
      ctx.strokeStyle = 'black';
      ctx.lineWidth = SERVER.textOutlineWidth;
      ctx.strokeText(`${i + 1}.`, 45, y);
      ctx.fillStyle = config.rankColors?.[i] ?? 'white';
      ctx.fillText(`${i + 1}.`, 45, y);

      // Text
      const rRes = fitText(ctx, rank, SERVER.rankBoxWidth, 1, fontSize);
      const centeredY = y + ((fontSize - rRes.size) / 2);
      ctx.font = `${rRes.size}px CustomFont`;
      ctx.strokeText(rRes.lines[0], 125, centeredY);
      ctx.fillStyle = 'white';
      ctx.fillText(rRes.lines[0], 125, centeredY);
      ctx.restore();
    });

    // Layer 5: Watermarks
    ctx.save();
    ctx.textBaseline = 'top';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    
    ctx.globalAlpha = 0.6;
    ctx.font = `${SERVER.watermarkFontSize}px CustomFont`;
    ctx.textAlign = 'right';
    ctx.fillStyle = 'white';
    ctx.fillText('ranktop.net', 1080 - 20, 1920 - 48 - 20);

    if (config.creatorWatermark) {
      ctx.globalAlpha = 0.7;
      ctx.font = `${SERVER.creatorWatermarkFontSize}px CustomFont`;
      ctx.textAlign = 'center';
      ctx.fillStyle = config.creatorWatermarkColor || 'white';
      const cwY = 1920 - SERVER.creatorWatermarkFontSize - SERVER.creatorWatermarkBottomPadding;
      ctx.fillText(config.creatorWatermark, 1080 / 2, cwY);
    }
    ctx.restore();

  }, [config, frameLoaded, fontStatus, title, ranks]);

  return (
    <div className="relative w-full aspect-[9/16] max-w-[280px] mx-auto bg-black rounded-lg overflow-hidden border-2 border-slate-700">
      <canvas ref={canvasRef} width={1080} height={1920} className="w-full h-full object-cover" />
      
      {/* Hidden Video for Frame Extraction */}
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
}