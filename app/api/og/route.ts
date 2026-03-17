import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createElement } from 'react';

export const runtime = 'edge';

/*
Professional ranking artifact generator (v2.1):
- Unified scaling and layout for all formats (Story, Square, Twitter)
- Protected Footer prevents watermark overlap
- Visible progressive spacing (decaying margins)
- Mirrored watermark styling across all canvases
- Fixed undefined limit variables
*/

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postTitle = searchParams.get('title') || 'Untitled Post';
    const postDescription = searchParams.get('description') || '';
    const postRanks = searchParams.getAll('rank').slice(0, 5);
    const rankNotes = searchParams.getAll('rank_note').slice(0, 5);
    const format = searchParams.get('format') || 'default';

    const customWidth = searchParams.get('width');
    const customHeight = searchParams.get('height');

    // ─── Canvas ──────────────────────────────────────────────────────────────
    let width = 1200;
    let height = 630;
    let isVertical = false;

    if (customWidth && customHeight) {
      width = parseInt(customWidth);
      height = parseInt(customHeight);
      isVertical = height > width;
    } else {
      switch (format) {
        case 'square':  width = 1080; height = 1080; break;
        case 'story':   width = 1080; height = 1920; isVertical = true; break;
        case 'twitter': width = 1200; height = 675;  break;
        default:        width = 1200; height = 630;
      }
    }

    const isSquare = width === height;

    // ─── Scaling ─────────────────────────────────────────────────────────────
    const scale = width / 1200;
    const px = (n: number) => Math.round(n * scale);

    // ─── Content Ratios ──────────────────────────────────────────────────────
    const padVRatio = isVertical ? 0.04 : isSquare ? 0.05 : 0.06;
    const padHRatio = isVertical ? 0.06 : isSquare ? 0.06 : 0.07;
    const padV = Math.round(height * padVRatio);
    const padH = Math.round(width  * padHRatio);

    const rankCount = postRanks.length;
    const hasNotes = rankNotes.some(n => !!n);
    const isCompact = !isVertical && (rankCount > 3 || (rankCount > 2 && hasNotes));

    // ─── Typography Sizes ───────────────────────────────────────────────────
    const titleSize       = px(isVertical ? 86 : isSquare ? 64 : (isCompact ? 56 : 64));
    const descriptionSize = px(isVertical ? 32 : isSquare ? 26 : (isCompact ? 20 : 26));
    const rankSize        = px(isVertical ? 42 : isSquare ? 32 : (isCompact ? 24 : 32));
    const noteSize        = px(isVertical ? 30 : isSquare ? 24 : (isCompact ? 18 : 24));
    const numeralSize     = px(isVertical ? 42 : isSquare ? 34 : (isCompact ? 26 : 34));
    const numeralBoxSize  = px(isVertical ? 64 : isSquare ? 52 : (isCompact ? 40 : 48));
    const cardPadV        = px(isVertical ? 28 : isSquare ? 22 : (isCompact ? 8 : 18));
    const cardPadH        = px(isVertical ? 32 : isSquare ? 26 : (isCompact ? 18 : 24));
    const watermarkSize   = px(isVertical ? 20 : isSquare ? 20 : 20);

    // ─── Spacing ─────────────────────────────────────────────────────────────
    const headerMarginBottom = px(isVertical ? 60 : isSquare ? 40 : (isCompact ? 20 : 35));
    const descMarginBottom   = px(isVertical ? 40 : isSquare ? 25 : (isCompact ? 12 : 25));
    const baseGap            = px(isVertical ? 24 : isSquare ? 18 : (isCompact ? 4 : 14));

    // ─── Limits ──────────────────────────────────────────────────────────────
    const titleLimit       = isVertical ? 60 : isSquare ? 50 : 80;
    const descriptionLimit = isVertical ? 100 : isSquare ? 80 : 130;
    const rankLimit        = isVertical ? 45 : isSquare ? 40 : 65;

    // ─── Fonts ───────────────────────────────────────────────────────────────
    const [playBold, playRegular] = await Promise.all([
      fetch(new URL('../../../public/fonts/Play-Bold.ttf', import.meta.url)).then((res) => res.arrayBuffer()),
      fetch(new URL('../../../public/fonts/Play-Regular.ttf', import.meta.url)).then((res) => res.arrayBuffer())
    ]);

    // Progressive spacing logic
    const getMarginBottom = (index: number) => {
      if (index === rankCount - 1) return 0;
      const multiplier = index === 0 ? 1.6 : index === 1 ? 1.3 : 1.0;
      return Math.round(baseGap * multiplier);
    };

    return new ImageResponse(
      createElement(
        'div',
        {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
            padding: `${padV}px ${padH}px`,
            fontFamily: 'Play',
            position: 'relative',
            boxSizing: 'border-box',
          },
        },

        // Top accent line
        createElement('div', {
          style: {
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: `${px(6)}px`,
            background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
          },
        }),

        // ── Main Content Container ───────────────────────────────────────────
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              width: '100%',
            },
          },
          // ── Header + Description Group ──────────────────────────────────────
          createElement(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
              },
            },
            createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  marginBottom: postDescription ? descMarginBottom : headerMarginBottom,
                },
              },
              createElement('div', {
                style: {
                  fontSize: titleSize,
                  fontWeight: 700,
                  color: '#f8fafc',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                },
              }, postTitle.length > titleLimit ? postTitle.slice(0, titleLimit) + '...' : postTitle)
            ),

            postDescription ? createElement('div', {
              style: {
                fontSize: descriptionSize,
                fontStyle: 'italic',
                color: '#cbd5e1',
                lineHeight: 1.4,
                marginBottom: headerMarginBottom,
                fontWeight: 400,
                opacity: 0.9,
              },
            }, postDescription.length > descriptionLimit ? postDescription.slice(0, descriptionLimit) + '...' : postDescription) : null
          ),

          // ── Ranks Container ────────────────────────────────────────────────
          createElement(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                justifyContent: 'flex-start',
              },
            },
            ...postRanks.map((rank, index) => {
              const note = rankNotes[index];
              const isTop = index === 0;
              const textBrightness = isTop ? '#ffffff' : '#e2e8f0';
              const bgOpacity = isTop ? 0.5 : 0.3;

              return createElement(
                'div',
                {
                  key: index,
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    background: `rgba(30, 41, 59, ${bgOpacity})`,
                    border: `1px solid rgba(59, 130, 246, ${isTop ? 0.4 : 0.15})`,
                    borderRadius: px(12),
                    padding: `${cardPadV}px ${cardPadH}px`,
                    boxShadow: isTop ? '0 10px 25px -5px rgba(59, 130, 246, 0.2)' : 'none',
                    marginBottom: `${getMarginBottom(index)}px`,
                  },
                },
                createElement('div', { style: { display: 'flex', alignItems: 'center' } },
                  createElement('div', {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: numeralBoxSize,
                      height: numeralBoxSize,
                      fontSize: numeralSize,
                      fontWeight: 700,
                      color: isTop ? '#3b82f6' : '#94a3b8',
                      marginRight: px(isCompact ? 16 : 24),
                      background: 'rgba(15, 23, 42, 0.6)',
                      borderRadius: px(10),
                      flexShrink: 0,
                    },
                  }, (index + 1).toString()),
                  createElement('div', {
                    style: {
                      fontSize: rankSize,
                      fontWeight: isTop ? 700 : 600,
                      color: textBrightness,
                      lineHeight: 1.2,
                    },
                  }, rank.length > rankLimit ? rank.slice(0, rankLimit) + '...' : rank)
                ),
                note ? createElement('div', {
                  style: {
                    fontSize: noteSize,
                    color: '#94a3b8',
                    marginTop: px(isCompact ? 4 : 10),
                    marginLeft: numeralBoxSize + px(isCompact ? 16 : 24),
                    fontStyle: 'italic',
                    opacity: 0.8,
                  },
                }, note) : null
              );
            })
          )
        ),

        // ── Footer (Watermark) ──────────────────────────────────────────────
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: px(isCompact ? 8 : 20),
              flexShrink: 0,
            },
          },
          createElement('div', {
            style: {
              fontSize: watermarkSize,
              color: '#475569',
              fontWeight: 500,
              letterSpacing: '0.12em',
              opacity: 0.45,
            },
          }, 'RANKTOP.NET')
        )
      ),
      {
        width,
        height,
        fonts: [
          { name: 'Play', data: playBold, weight: 700, style: 'normal' },
          { name: 'Play', data: playRegular, weight: 400, style: 'normal' },
        ],
      }
    );
  } catch (e: any) {
    console.error(`OG Image Error: ${e.message}`);
    return new Response(`Failed to generate the image`, { status: 500 });
  }
}
