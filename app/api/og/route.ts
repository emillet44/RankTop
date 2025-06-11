import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createElement } from 'react';

export const runtime = 'edge';

/*
This component is used for generating post preview images, which is used in the ShareButton component to allow users to create sharing links with image previews, or to download the 
post itself for sharing on other websites or just for storage. There is a lot of formatting calculations, and this entire component is essentially just from Claude, but most of it 
appears useful so I'm not going to mess with it too much. 
*/

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postTitle = searchParams.get('title') || 'Untitled Post';
    const postDescription = searchParams.get('description') || '';
    const postRanks = searchParams.get('ranks')?.split(',').filter(Boolean) || [];
    const format = searchParams.get('format') || 'default';
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

    // Simplified responsive scaling
    const isSquare = width === height;
    
    let padding, titleSize, descriptionSize, rankSize: number;
    
    if (isVertical) {
      padding = '80px 60px';
      titleSize = Math.max(72, Math.min(96, width * 0.08));
      descriptionSize = Math.max(28, Math.min(36, width * 0.032));
      rankSize = Math.max(24, Math.min(32, width * 0.028));
    } else if (isSquare) {
      padding = '70px';
      titleSize = Math.max(52, Math.min(72, width * 0.065));
      descriptionSize = Math.max(24, Math.min(32, width * 0.028));
      rankSize = Math.max(20, Math.min(28, width * 0.024));
    } else {
      padding = '80px';
      titleSize = Math.max(48, Math.min(80, width * 0.06));
      descriptionSize = Math.max(22, Math.min(36, width * 0.026));
      rankSize = Math.max(18, Math.min(30, width * 0.022));
    }

    // Dynamic text limits
    const titleLimit = isVertical ? 80 : isSquare ? 60 : 90;
    const descriptionLimit = isVertical ? 120 : isSquare ? 100 : 140;
    const rankLimit = isVertical ? 60 : isSquare ? 50 : 70;

    // Calculate available space for dynamic rank fitting
    const paddingNum = parseFloat(padding.split(' ')[0]);
    const titleHeight = titleSize * 1.3;
    const descriptionHeight = postDescription ? descriptionSize * 1.8 : 0;
    const watermarkSpace = 80; // Fixed space for watermark
    const usedSpace = paddingNum * 2 + titleHeight + descriptionHeight + watermarkSpace + 200; // margins
    const availableSpace = height - usedSpace;
    const rankHeight = rankSize * 1.2 + 48; // estimate with padding
    const maxRanks = Math.max(2, Math.floor(availableSpace / rankHeight));
    const ranksToShow = Math.min(maxRanks, postRanks.length);

    return new ImageResponse(
      createElement(
        'div',
        {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            // Your original gradient
            background: 'radial-gradient(ellipse at center, #030712 0%, #040713 10%, #050714 25%, #080814 50%, #0a0908 75%, #0c0a09 100%)',
            padding: padding,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            boxSizing: 'border-box',
          },
        },
        // Main content container
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'flex-start',
              minHeight: 0, // Allows proper flex shrinking
            },
          },
          // Title
          createElement(
            'div',
            {
              style: {
                fontSize: titleSize,
                fontWeight: 700,
                color: '#e2e8f0',
                marginBottom: isVertical ? '40px' : isSquare ? '35px' : '50px',
                lineHeight: 1.1,
                textAlign: 'left',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                letterSpacing: isVertical ? '-0.5px' : '-0.3px',
              },
            },
            postTitle.length > titleLimit 
              ? postTitle.slice(0, titleLimit) + '...' 
              : postTitle
          ),
          // Description
          postDescription ? createElement(
            'div',
            {
              style: {
                fontSize: descriptionSize,
                color: '#cbd5e1',
                lineHeight: 1.4,
                marginBottom: isVertical ? '50px' : isSquare ? '45px' : '70px',
                maxWidth: '90%',
                opacity: 0.9,
                letterSpacing: '0.3px',
              },
            },
            postDescription.slice(0, descriptionLimit) + (postDescription.length > descriptionLimit ? '...' : '')
          ) : null,
          // Ranks display
          postRanks.length > 0 ? createElement(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                gap: isVertical ? '18px' : isSquare ? '16px' : '20px',
                maxWidth: '100%',
              },
            },
            ...postRanks.slice(0, ranksToShow).map((rank, index) =>
              createElement(
                'div',
                {
                  key: index,
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(148, 163, 184, 0.08)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: isVertical ? '16px' : isSquare ? '14px' : '18px',
                    padding: isVertical ? '20px 24px' : isSquare ? '18px 22px' : '24px 30px',
                    fontSize: rankSize,
                    color: '#94a3b8',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                  },
                },
                // Rank number - plain styling
                createElement(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: isVertical ? '32px' : isSquare ? '28px' : '36px',
                      height: isVertical ? '32px' : isSquare ? '28px' : '36px',
                      fontSize: isVertical ? '22px' : isSquare ? '20px' : '26px',
                      fontWeight: 700,
                      color: '#94a3b8',
                      marginRight: isVertical ? '20px' : isSquare ? '18px' : '24px',
                      flexShrink: 0,
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
                      fontWeight: 500,
                      letterSpacing: '0.2px',
                    },
                  },
                  rank.length > rankLimit 
                    ? rank.slice(0, rankLimit) + '...' 
                    : rank
                )
              )
            ),
            // More items indicator
            postRanks.length > ranksToShow ? createElement(
              'div',
              {
                style: {
                  fontSize: isVertical ? 20 : isSquare ? 18 : 22,
                  color: '#64748b',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  marginTop: isVertical ? '15px' : '12px',
                  opacity: 0.7,
                  letterSpacing: '0.3px',
                },
              },
              `+ ${postRanks.length - ranksToShow} ${postRanks.length - ranksToShow === 1 ? 'more item' : 'more items'}`
            ) : null
          ) : null
        ),
        // Watermark
        createElement(
          'div',
          {
            style: {
              position: 'absolute',
              bottom: isVertical ? '50px' : isSquare ? '45px' : '60px',
              right: isVertical ? '60px' : isSquare ? '70px' : '80px',
              fontSize: isVertical ? 24 : isSquare ? 22 : 28,
              color: '#94a3b8',
              fontWeight: 500,
              opacity: 0.4,
              letterSpacing: '0.5px',
            },
          },
          'ranktop.net'
        ),
        // Decorative accent
        createElement(
          'div',
          {
            style: {
              position: 'absolute',
              top: '0px',
              right: '0px',
              width: isVertical ? '8px' : isSquare ? '6px' : '10px',
              height: '100%',
              background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0.2) 30%, rgba(59, 130, 246, 0.1) 70%, transparent 100%)',
            },
          }
        ),
        // Additional accent for story format
        isVertical ? createElement(
          'div',
          {
            style: {
              position: 'absolute',
              top: '0px',
              left: '0px',
              width: '4px',
              height: '100%',
              background: 'linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.1) 30%, rgba(59, 130, 246, 0.2) 50%, rgba(59, 130, 246, 0.1) 70%, transparent 100%)',
            },
          }
        ) : null
      ),
      {
        width,
        height,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}