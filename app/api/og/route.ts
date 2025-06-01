import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createElement } from 'react';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postTitle = searchParams.get('title') || 'Untitled Post';
    const postDescription = searchParams.get('description') || '';
    const postRanks = searchParams.get('ranks')?.split(',').filter(Boolean) || [];

    return new ImageResponse(
      createElement(
        'div',
        {
          style: {
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e293b',
            fontSize: 32,
            fontWeight: 600,
            color: 'white',
            padding: '40px',
          },
        },
        // Header
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              alignItems: 'center',
              marginBottom: '40px',
            },
          },
          createElement(
            'div',
            {
              style: {
                fontSize: 24,
                color: '#94a3b8',
                fontWeight: 400,
              },
            },
            'RankTop'
          )
        ),
        // Main Content
        createElement(
          'div',
          {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '800px',
            },
          },
          // Title
          createElement(
            'div',
            {
              style: {
                fontSize: 48,
                fontWeight: 700,
                marginBottom: '20px',
                lineHeight: 1.2,
              },
            },
            postTitle
          ),
          // Description (conditional)
          postDescription ? createElement(
            'div',
            {
              style: {
                fontSize: 24,
                color: '#cbd5e1',
                marginBottom: '30px',
                lineHeight: 1.4,
              },
            },
            postDescription.slice(0, 150) + (postDescription.length > 150 ? '...' : '')
          ) : null,
          // Ranks (conditional)
          postRanks.length > 0 ? createElement(
            'div',
            {
              style: {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              },
            },
            createElement(
              'div',
              {
                style: {
                  fontSize: 20,
                  color: '#94a3b8',
                  marginBottom: '15px',
                },
              },
              `Top ${postRanks.length}:`
            ),
            createElement(
              'div',
              {
                style: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  gap: '10px',
                },
              },
              ...postRanks.slice(0, 3).map((rank, index) =>
                createElement(
                  'div',
                  {
                    key: index,
                    style: {
                      backgroundColor: '#374151',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: 18,
                      color: '#e2e8f0',
                    },
                  },
                  `${index + 1}. ${rank}`
                )
              )
            )
          ) : null
        ),
        // Footer
        createElement(
          'div',
          {
            style: {
              position: 'absolute',
              bottom: '30px',
              right: '40px',
              fontSize: 16,
              color: '#64748b',
            },
          },
          'ranktop.com'
        )
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}