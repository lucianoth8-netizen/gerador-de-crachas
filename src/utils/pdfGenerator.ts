import { jsPDF } from 'jspdf';
import { BadgeData, BADGE_WIDTH_PX, BADGE_HEIGHT_PX } from '../types';
import { drawBadge } from './drawBadge';

/**
 * Generates and downloads a PDF in A4 size containing the listed badges.
 */
export async function generateA4Pdf(
  badges: BadgeData[],
  options: {
    showCutLines: boolean;
    showBorders: boolean;
  }
) {
  // A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Grid layout parameters (in mm)
  const badgeWidthMm = 70;
  const badgeHeightMm = 25;
  const colGapMm = 10;
  const rowGapMm = 2;
  const leftMarginMm = 30;
  const topMarginMm = 15;
  
  const badgesPerPage = 20; // 2 columns x 10 rows
  const numBadges = badges.length;

  if (numBadges === 0) {
    alert('Adicione pelo menos um crachá para gerar o PDF.');
    return;
  }

  // Create a temporary canvas for high-quality rendering at 300 DPI
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = BADGE_WIDTH_PX;
  tempCanvas.height = BADGE_HEIGHT_PX;
  const tempCtx = tempCanvas.getContext('2d');

  if (!tempCtx) {
    console.error('Could not get 2D context for PDF generator');
    return;
  }

  // Pre-load all image objects for custom logos to ensure they are drawn sync
  const customImages: Record<string, HTMLImageElement> = {};
  for (const badge of badges) {
    if (badge.logoType === 'custom' && badge.logoSrc && !customImages[badge.logoSrc]) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = badge.logoSrc;
        img.onload = () => {
          customImages[badge.logoSrc] = img;
          resolve();
        };
        img.onerror = () => {
          console.error('Error loading custom logo for PDF generation');
          resolve();
        };
      });
    }
  }

  // Loop through badges and layout them on pages
  for (let i = 0; i < numBadges; i++) {
    const pageIndex = Math.floor(i / badgesPerPage);
    const badgeIndexOnPage = i % badgesPerPage;

    // Add new page for pageIndex > 0
    if (i > 0 && badgeIndexOnPage === 0) {
      doc.addPage();
    }

    const badge = badges[i];
    
    // Clear temporary canvas
    tempCtx.clearRect(0, 0, BADGE_WIDTH_PX, BADGE_HEIGHT_PX);

    // If there is a custom logo, we assign the loaded image reference to a temporary variable
    // We modify drawBadge slightly or make sure it draws sync since we pre-loaded the image
    drawBadge(tempCtx, badge);

    // Get base64 PNG data
    const imgData = tempCanvas.toDataURL('image/png');

    // Calculate grid position
    const col = badgeIndexOnPage % 2;
    const row = Math.floor(badgeIndexOnPage / 2);

    const x = leftMarginMm + col * (badgeWidthMm + colGapMm);
    const y = topMarginMm + row * (badgeHeightMm + rowGapMm);

    // Draw badge image
    doc.addImage(imgData, 'PNG', x, y, badgeWidthMm, badgeHeightMm);

    // Draw solid border if option is active
    if (options.showBorders) {
      doc.setDrawColor(180, 180, 180); // gray border
      doc.setLineWidth(0.1);
      doc.rect(x, y, badgeWidthMm, badgeHeightMm);
    }

    // Draw crop/cut lines around the badge if active
    if (options.showCutLines) {
      doc.setDrawColor(150, 150, 150); // mid-gray cutting lines
      doc.setLineWidth(0.15);
      const lineLen = 3; // length of crop line

      // For horizontal cut marks
      // Top-left horizontal
      doc.line(x - lineLen - 1, y, x - 1, y);
      // Top-right horizontal
      doc.line(x + badgeWidthMm + 1, y, x + badgeWidthMm + lineLen + 1, y);
      // Bottom-left horizontal
      doc.line(x - lineLen - 1, y + badgeHeightMm, x - 1, y + badgeHeightMm);
      // Bottom-right horizontal
      doc.line(x + badgeWidthMm + 1, y + badgeHeightMm, x + badgeWidthMm + lineLen + 1, y + badgeHeightMm);

      // For vertical cut marks
      // Top-left vertical
      doc.line(x, y - lineLen - 1, x, y - 1);
      // Top-right vertical
      doc.line(x + badgeWidthMm, y - lineLen - 1, x + badgeWidthMm, y - 1);
      // Bottom-left vertical
      doc.line(x, y + badgeHeightMm + 1, x, y + badgeHeightMm + lineLen + 1);
      // Bottom-right vertical
      doc.line(x + badgeWidthMm, y + badgeHeightMm + 1, x + badgeWidthMm, y + badgeHeightMm + lineLen + 1);
    }
  }

  // Save the PDF file
  doc.save('crachas_swift_a4.pdf');
}
