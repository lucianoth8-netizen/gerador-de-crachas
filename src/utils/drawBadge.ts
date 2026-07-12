import { BadgeData, BADGE_WIDTH_PX, BADGE_HEIGHT_PX } from '../types';

/**
 * Draws the Swift logo shape on a 2D canvas context.
 */
export function drawSwiftLogo(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  strokeWidth: number,
  color: string = '#FFFFFF'
) {
  const cx = x + size * 0.5;
  const cy = y + size * 0.5;
  const r = size * 0.35;

  ctx.beginPath();
  // Start at top tangent point (50, 15) relative to 100x100
  ctx.moveTo(x + size * 0.5, y + size * 0.15);
  // Line to top-right corner (85, 15)
  ctx.lineTo(x + size * 0.85, y + size * 0.15);
  // Line to right tangent point (85, 50)
  ctx.lineTo(x + size * 0.85, y + size * 0.5);
  // Circular arc from 0 to 270 degrees (1.5 * Math.PI) clockwise
  ctx.arc(cx, cy, r, 0, 1.5 * Math.PI, false);
  ctx.closePath();

  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/**
 * Main function to draw a full badge onto a canvas.
 */
export function drawBadge(
  ctx: CanvasRenderingContext2D,
  badge: BadgeData,
  options: {
    drawBackground?: boolean;
    scale?: number;
  } = {}
) {
  const drawBg = options.drawBackground !== false;
  const scale = options.scale || 1.0;

  // Scale the dimensions
  const width = BADGE_WIDTH_PX * scale;
  const height = BADGE_HEIGHT_PX * scale;

  // 1. Draw Background
  if (drawBg) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  }

  // Calculate coordinates based on current scale
  const logoType = badge.logoType;
  let logoWidth = 0;
  let logoEndX = 50 * scale; // default margin if no logo

  // 2. Draw Logo
  if (logoType !== 'none') {
    // Standard logo size is roughly 65% of badge height
    const baseLogoSize = height * 0.65;
    const logoSize = baseLogoSize * badge.logoScale;
    
    // Position: vertically centered, plus offsets
    const logoY = (height - logoSize) / 2 + (badge.logoYOffset * scale);
    // Horizontally placed at 8% of badge width from the left, plus offsets
    const logoX = (width * 0.08) + (badge.logoXOffset * scale);

    logoWidth = logoSize;
    logoEndX = logoX + logoSize;

    if (logoType === 'swift') {
      const computedStroke = (logoSize / 100) * badge.logoStrokeWidth;
      drawSwiftLogo(ctx, logoX, logoY, logoSize, computedStroke, '#FFFFFF');
    } else if (logoType === 'custom' && badge.logoSrc) {
      try {
        const img = new Image();
        img.src = badge.logoSrc;
        // Draw image if it is loaded (sync context assumes pre-loaded or loaded image)
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        } else {
          // If not fully loaded yet, we can draw a placeholder
          ctx.fillStyle = 'rgba(255,255,255,0.2)';
          ctx.fillRect(logoX, logoY, logoSize, logoSize);
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2 * scale;
          ctx.strokeRect(logoX, logoY, logoSize, logoSize);
        }
      } catch (e) {
        console.error('Error drawing custom logo on canvas', e);
      }
    }
  }

  // 3. Draw Text
  // Text X coordinate starts with some padding after the logo
  const textLeftPadding = width * 0.06; // 6% padding
  const textX = logoEndX + textLeftPadding;
  const maxTextWidth = width - textX - (width * 0.06); // leave 6% right padding

  // Configure text fonts
  const baseNameFont = badge.nameFontSize * scale;
  const baseRoleFont = badge.roleFontSize * scale;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  // Dynamic sizing to fit Name within maximum width
  let nameFont = `bold ${baseNameFont}px "Arial Black", "Arial", sans-serif`;
  ctx.font = nameFont;
  let currentNameFontSize = baseNameFont;
  
  while (ctx.measureText(badge.name || 'Nome').width > maxTextWidth && currentNameFontSize > 12 * scale) {
    currentNameFontSize -= 1;
    nameFont = `bold ${currentNameFontSize}px "Arial Black", "Arial", sans-serif`;
    ctx.font = nameFont;
  }

  // Dynamic sizing to fit Role within maximum width
  let roleFont = `${baseRoleFont}px "Arial Black", "Arial", sans-serif`;
  ctx.font = roleFont;
  let currentRoleFontSize = baseRoleFont;

  while (ctx.measureText(badge.role || 'Cargo').width > maxTextWidth && currentRoleFontSize > 10 * scale) {
    currentRoleFontSize -= 1;
    roleFont = `${currentRoleFontSize}px "Arial Black", "Arial", sans-serif`;
    ctx.font = roleFont;
  }

  // Vertical positions
  // We center the text block vertically, with custom vertical offset
  const textSpacing = badge.textSpacing * scale;
  const nameHeight = currentNameFontSize;
  const roleHeight = currentRoleFontSize;
  const totalTextBlockHeight = nameHeight + textSpacing + roleHeight;
  
  const textCenterY = (height / 2) + (badge.textYOffset * scale);
  const nameY = textCenterY - (totalTextBlockHeight / 2) + (nameHeight / 2);
  const roleY = textCenterY + (totalTextBlockHeight / 2) - (roleHeight / 2);

  // Draw Name
  ctx.font = nameFont;
  ctx.fillStyle = badge.nameColor || '#FFFFFF';
  ctx.fillText(badge.name || 'NOME', textX, nameY);

  // Draw Role
  ctx.font = roleFont;
  ctx.fillStyle = badge.roleColor || '#E5E7EB';
  ctx.fillText(badge.role || 'CARGO', textX, roleY);
}
