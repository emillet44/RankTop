import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createElement } from 'react';

export const runtime = 'edge';

/*
Professional ranking artifact generator:
- Inter font for refined typography
- Inline rank notes for context
- Clean visual hierarchy
- Screenshot-perfect for social sharing
*/

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postTitle = searchParams.get('title') || 'Untitled Post';
    const postDescription = searchParams.get('description') || '';
    const postRanks = searchParams.getAll('rank');
    const rankNotes = searchParams.getAll('rank_note');
    const username = searchParams.get('username') || null;
    const format = searchParams.get('format') || 'default';
    // const framingLine = searchParams.get('framing') || null; // NEW: Optional framing context

    const customWidth = searchParams.get('width');
    const customHeight = searchParams.get('height');

    // Define dimensions based on format
    let width = 1200;
    let height = 630;
    let isVertical = false;

    if (customWidth && customHeight) {
      width = parseInt(customWidth);
      height = parseInt(customHeight);
      isVertical = height > width;
    } else {
      switch (format) {
        case 'square':
          width = 1080;
          height = 1080;
          break;
        case 'story':
          width = 1080;
          height = 1920;
          isVertical = true;
          break;
        case 'twitter':
          width = 1200;
          height = 675;
          break;
        default:
          width = 1200;
          height = 630;
      }
    }

    const isSquare = width === height;

    // Refined typography - using Inter-like system fonts
    let padding: string, titleSize: number, descriptionSize: number, rankSize: number,
      noteSize: number, authorSize: number; // framingSize: number;

    if (isVertical) {
      padding = '60px 50px';
      titleSize = 76;
      descriptionSize = 28;
      rankSize = 34;
      noteSize = 26; // INCREASED from 24 for better commentary feel
      authorSize = 24;
      // framingSize = 24;
    } else if (isSquare) {
      padding = '55px';
      titleSize = 58;
      descriptionSize = 24;
      rankSize = 30;
      noteSize = 23; // INCREASED from 21 for better commentary feel
      authorSize = 20;
      // framingSize = 20;
    } else {
      padding = '60px 70px';
      titleSize = 64;
      descriptionSize = 26;
      rankSize = 32;
      noteSize = 24; // INCREASED from 22 for better commentary feel
      authorSize = 22;
      // framingSize = 22;
    }

    // Text limits
    const titleLimit = isVertical ? 65 : isSquare ? 50 : 75;
    const descriptionLimit = isVertical ? 90 : isSquare ? 70 : 110;
    const rankLimit = isVertical ? 50 : isSquare ? 40 : 60;
    const noteLimit = 50; // Hard limit
    // const framingLimit = 60;

    // Fetch Inter font
    const playBold = await fetch(
      new URL('../../../public/fonts/Play-Bold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      createElement(
        'div',
        {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            // Subtle, professional gradient
            background: 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
            padding: padding,
            fontFamily: 'Play, system-ui, sans-serif',
            position: 'relative',
            boxSizing: 'border-box',
          },
        },
        // Top accent line - clean and minimal
        createElement(
          'div',
          {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
            },
          }
        ),
        // Header section - document-style framing
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              marginBottom: isVertical ? '40px' : '32px',
            },
          },
          // Title - personal document style
          createElement(
            'div',
            {
              style: {
                fontSize: titleSize,
                fontWeight: 800,
                color: '#f8fafc',
                marginBottom: username ? (isVertical ? '14px' : '10px') : 0,
                lineHeight: 1.15,
                letterSpacing: '-0.015em', // Tighter for document feel
              },
            },
            postTitle.length > titleLimit
              ? postTitle.slice(0, titleLimit) + '...'
              : postTitle
          ),
          // NEW: Optional framing line - adds context and intentionality
          // framingLine ? createElement(
          //   'div',
          //   {
          //     style: {
          //       fontSize: framingSize,
          //       color: '#94a3b8',
          //       fontStyle: 'italic',
          //       fontWeight: 400,
          //       letterSpacing: '0.01em',
          //       opacity: 0.75,
          //       marginBottom: username ? (isVertical ? '10px' : '8px') : 0,
          //     },
          //   },
          //   framingLine.slice(0, framingLimit) + (framingLine.length > framingLimit ? '...' : '')
          // ) : null,
          // Author - subtle attribution
          username ? createElement(
            'div',
            {
              style: {
                fontSize: authorSize,
                color: '#94a3b8',
                fontWeight: 500, // Lighter weight
                letterSpacing: '0.02em',
                opacity: 0.8, // Softer presence
              },
            },
            `by @${username}`
          ) : null
        ),
        // Description
        postDescription ? createElement(
          'div',
          {
            style: {
              fontSize: descriptionSize,
              fontStyle: 'italic',
              color: '#9ca3af',
              lineHeight: 1.4,
              marginBottom: isVertical ? '45px' : '36px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
            },
          },
          postDescription.slice(0, descriptionLimit) + (postDescription.length > descriptionLimit ? '...' : '')
        ) : null,
        // Rankings with notes - structural hierarchy
        postRanks.length > 0 ? createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            },
          },
          ...postRanks.slice(0, 5).map((rank, index) => {
            const note = rankNotes[index];
            const isTopRank = index === 0;
            const isLastRank = index === postRanks.length - 1;
            const totalRanks = postRanks.length;

            // Calculate visual decay based on position - NO opacity changes for main text
            const borderIntensity = isTopRank ? 0.4 : Math.max(0.12, 0.35 - (index * 0.06));
            const glowIntensity = isTopRank ? 0.12 : Math.max(0.02, 0.08 - (index * 0.02));
            
            // CHANGE 4: Last rank gets darker background to feel "end of list"
            const bgIntensity = isLastRank 
              ? 0.2 
              : isTopRank 
                ? 0.55 
                : Math.max(0.3, 0.5 - (index * 0.05));

            // CHANGE 1: Progressive spacing decay - top ranks get more breathing room
            const marginBottom = index === totalRanks - 1
              ? '0px'
              : isTopRank
                ? (isVertical ? '32px' : isSquare ? '28px' : '30px')
                : index === 1
                  ? (isVertical ? '20px' : isSquare ? '18px' : '20px')
                  : (isVertical ? '14px' : isSquare ? '12px' : '14px');

            // CHANGE 1: Vertical padding compression for lower ranks
            const verticalPadding = isTopRank
              ? (isVertical ? '22px' : isSquare ? '20px' : '22px')
              : index === 1
                ? (isVertical ? '18px' : isSquare ? '17px' : '18px')
                : (isVertical ? '14px' : isSquare ? '13px' : '14px');

            const horizontalPadding = isVertical ? '22px' : isSquare ? '20px' : '24px';

            // Rank numeral size decay
            const numeralSize = isTopRank
              ? (isVertical ? 38 : isSquare ? 34 : 38)
              : (isVertical ? 32 - (index * 1.5) : isSquare ? 28 - (index * 1.5) : 32 - (index * 1.5));

            // Text color with subtle warmth decay (keeps readability)
            const textBrightness = isTopRank ? '#f8fafc' : (index === 1 ? '#f1f5f9' : '#e2e8f0');

            return createElement(
              'div',
              {
                key: index,
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  background: `rgba(30, 41, 59, ${bgIntensity})`,
                  border: `1px solid rgba(71, 85, 105, ${isLastRank ? borderIntensity * 0.7 : borderIntensity})`, // CHANGE 4: Reduced border for last
                  borderRadius: isVertical ? '10px' : '8px',
                  padding: `${verticalPadding} ${horizontalPadding}`,
                  boxShadow: isTopRank
                    ? '0 0 0 1px rgba(59,130,246,0.35), 0 6px 16px rgba(59,130,246,0.15)'
                    : `0 1px 4px rgba(0, 0, 0, ${glowIntensity})`,
                  marginBottom: marginBottom,
                },
              },
              // Main rank row
              createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                  },
                },
                // Rank number with decay
                createElement(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: isTopRank ? (isVertical ? '48px' : isSquare ? '42px' : '48px') : (isVertical ? '42px' : isSquare ? '36px' : '42px'),
                      height: isTopRank ? (isVertical ? '48px' : isSquare ? '42px' : '48px') : (isVertical ? '42px' : isSquare ? '36px' : '42px'),
                      fontSize: numeralSize,
                      fontWeight: isTopRank ? 600 : 500,
                      color: isTopRank ? '#e5e7eb' : '#9ca3af',
                      marginRight: isVertical ? '20px' : isSquare ? '16px' : '20px',
                      flexShrink: 0,
                      letterSpacing: '-0.02em',
                      background: 'rgba(255,255,255,0.04)',
                      borderRadius: '10px',
                    },
                  },
                  (index + 1).toString()
                ),
                // Rank text
                createElement(
                  'div',
                  {
                    style: {
                      flex: 1,
                      fontSize: rankSize,
                      fontWeight: isTopRank ? 700 : Math.max(500, 600 - (index * 20)),
                      color: textBrightness,
                      letterSpacing: '-0.015em',
                      lineHeight: 1.3,
                    },
                  },
                  rank.length > rankLimit
                    ? rank.slice(0, rankLimit) + '...'
                    : rank
                )
              ),
              // CHANGE 2: Rank note styled as commentary, not footnote
              note ? createElement(
                'div',
                {
                  style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginTop: isVertical ? '14px' : '12px', // Slightly more space
                    paddingLeft: isVertical ? '68px' : isSquare ? '58px' : '68px',
                  },
                },
                createElement(
                  'div',
                  {
                    style: {
                      fontSize: noteSize, // Now larger (was noteSize - 2)
                      color: '#94a3b8',
                      fontWeight: 400,
                      fontStyle: 'italic',
                      letterSpacing: '0.005em', // Slightly tighter
                      lineHeight: 1.5, // INCREASED from 1.4 for better readability
                      opacity: 0.85,
                    },
                  },
                  note.slice(0, noteLimit) + (note.length > noteLimit ? '...' : '') // Removed the dash
                )
              ) : null
            );
          })
        ) : null,
        // Watermark - tool attribution (not promotional)
        createElement(
          'div',
          {
            style: {
              position: 'absolute',
              bottom: isVertical ? '32px' : '28px',
              right: isVertical ? '50px' : isSquare ? '55px' : '70px',
              fontSize: isVertical ? 16 : isSquare ? 15 : 17,
              color: '#475569',
              fontWeight: 500,
              opacity: 0.22, // Very subtle
              letterSpacing: '0.08em',
            },
          },
          'ranktop.net'
        )
      ),
      {
        width,
        height,
        fonts: [
          {
            name: 'Play',
            data: playBold,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}