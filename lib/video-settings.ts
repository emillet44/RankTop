export const VIDEO_DIMENSIONS = {
  WIDTH: 540,
  HEIGHT: 960,
  ORIGINAL_WIDTH: 1080,
  ORIGINAL_HEIGHT: 1920,
};

export const FONT_MAP: Record<string, string> = {
  'Archivo Expanded Bold': 'font.ttf',
  'Arial Regular': 'Arial-Regular.ttf',
};

export interface WordColor {
  word: string;
  color: string;
}

export interface VideoLayoutConfig {
  titleBackdrop: 'none' | 'black' | 'white' | 'blurred';
  subtitle: string;
  subtitleColor: string;
  creatorWatermark: string;
  creatorWatermarkColor: string;
  titleWordColors: WordColor[];
  titleShadowBlur: number;
  rankShadowBlur: number;
  matchRankColor: boolean;
  textShadow: boolean;
  rankSpacing: number;
  fontFamily: string;
  rankColors: string[];
  
  // Advanced / Internal overrides (optional in UI, but used in rendering)
  subtitleFontSize?: number;
  subtitleTopMargin?: number;
  titleFontSize?: number;
  titleLineSpacing?: number;
  titleBoxWidth?: number;
  titleMaxLines?: number;
  titleBoxTopPadding?: number;
  titleBoxBottomPadding?: number;
  rankFontSize?: number;
  rankPaddingY?: number;
  rankBoxWidth?: number;
  textOutlineWidth?: number;
}

export const DEFAULT_VIDEO_STYLE: VideoLayoutConfig = {
  titleBackdrop: 'black',
  subtitle: '',
  subtitleColor: '#CCCCCC',
  creatorWatermark: '',
  creatorWatermarkColor: '#FFFFFF',
  titleWordColors: [],
  titleShadowBlur: 25,
  rankShadowBlur: 5,
  matchRankColor: false,
  textShadow: true,
  rankSpacing: 140,
  fontFamily: 'Archivo Expanded Bold',
  rankColors: ['#FFD700', '#C0C0C0', '#CD7F32', 'white', 'white'],
  titleFontSize: 100,
  rankFontSize: 60,
};

/**
 * Returns derived settings scaled for a specific width/height.
 * This ensures consistency between the 540x960 preview and the 1080x1920 final render.
 */
export function getDerivedVideoSettings(config: Partial<VideoLayoutConfig>, scale: number = 0.5) {
  return {
    titleFontSize:                 (config.titleFontSize          ?? 100) * scale,
    titleLineSpacing:              (config.titleLineSpacing       ?? 30)  * scale,
    titleBoxWidth:                 (config.titleBoxWidth          ?? 980) * scale,
    titleMaxLines:                 config.titleMaxLines                   ?? 2,
    titleBoxTopPadding:            (config.titleBoxTopPadding     ?? 30)  * scale,
    titleBoxBottomPadding:         (config.titleBoxBottomPadding  ?? 40)  * scale,
    subtitleFontSize:              (config.subtitleFontSize       ?? 44)  * scale,
    subtitleTopMargin:             (config.subtitleTopMargin      ?? 10)  * scale,
    rankFontSize:                  (config.rankFontSize           ?? 60)  * scale,
    rankSpacing:                   (config.rankSpacing            ?? 140) * scale,
    rankPaddingY:                  (config.rankPaddingY           ?? 80)  * scale,
    rankNumX:                      45 * scale,
    rankTextX:                     125 * scale,
    rankBoxWidth:                  (config.rankBoxWidth           ?? 830) * scale,
    textOutlineWidth:              (config.textOutlineWidth       ?? (config.fontFamily === 'Arial Regular' ? 9 : 18))  * scale,
    watermarkFontSize:             48 * scale,
    watermarkPadding:              20 * scale,
    creatorWatermarkFontSize:      44 * scale,
    creatorWatermarkBottomPadding: 80 * scale,
  };
}
