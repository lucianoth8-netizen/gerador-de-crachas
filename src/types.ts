export type LogoType = 'swift' | 'custom' | 'none';

export interface BadgeData {
  id: string;
  name: string;
  role: string;
  
  // Text configurations
  nameFontSize: number; // in pixels at 300 DPI (canvas size)
  roleFontSize: number;  // in pixels at 300 DPI
  textSpacing: number;   // spacing between name and role
  textYOffset: number;   // vertical offset of texts
  nameColor: string;     // color of name (default: #FFFFFF)
  roleColor: string;     // color of role (default: #FFFFFF)
  
  // Logo configurations
  logoType: LogoType;
  logoSrc: string;       // base64 data for custom logo
  logoScale: number;     // multiplier
  logoXOffset: number;   // horizontal shift
  logoYOffset: number;   // vertical shift
  logoStrokeWidth: number; // line weight for Swift logo outline
}

export interface SheetSettings {
  showCutLines: boolean;
  showBorders: boolean;
  marginsMm: number;     // outer margins of A4 in mm
  gapMm: number;         // gap between badges in mm
}

// Dimensions at 300 DPI for 7cm x 2.5cm
export const BADGE_WIDTH_PX = 827;
export const BADGE_HEIGHT_PX = 295;

// Physical dimensions
export const BADGE_WIDTH_CM = 7.0;
export const BADGE_HEIGHT_CM = 2.5;

// Default values for new badges
export const DEFAULT_BADGE_VALUES = {
  nameFontSize: 46,
  roleFontSize: 24,
  textSpacing: 12,
  textYOffset: 0,
  nameColor: '#FFFFFF',
  roleColor: '#E5E7EB', // light gray
  logoType: 'swift' as LogoType,
  logoSrc: '',
  logoScale: 1.0,
  logoXOffset: 0,
  logoYOffset: 0,
  logoStrokeWidth: 8,
};
