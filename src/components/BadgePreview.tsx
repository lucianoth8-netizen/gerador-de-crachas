import React, { useEffect, useRef, useState } from 'react';
import { BadgeData, BADGE_WIDTH_PX, BADGE_HEIGHT_PX } from '../types';
import { drawBadge } from '../utils/drawBadge';

interface BadgePreviewProps {
  badge: BadgeData;
}

export const BadgePreview: React.FC<BadgePreviewProps> = ({ badge }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Trigger redraw on any setting changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw background
    ctx.clearRect(0, 0, BADGE_WIDTH_PX, BADGE_HEIGHT_PX);

    // If logo is a custom base64 image, we must make sure it is fully loaded before drawing
    if (badge.logoType === 'custom' && badge.logoSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = badge.logoSrc;
      
      const drawWithImage = () => {
        drawBadge(ctx, badge);
      };

      if (img.complete && img.naturalWidth > 0) {
        drawWithImage();
      } else {
        img.onload = () => {
          setImageLoaded(prev => !prev); // Force small state toggle to trigger redraw
        };
        // Draw anyway, will draw with placeholder or partial image, then redraw on load
        drawBadge(ctx, badge);
      }
    } else {
      drawBadge(ctx, badge);
    }
  }, [badge, imageLoaded]);

  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <span className="text-xs font-mono text-neutral-400 tracking-wider uppercase">
        Pré-visualização (Tamanho Real: 7 × 2,5 cm)
      </span>
      <div className="relative w-full max-w-[420px] aspect-[7/2.5] bg-black rounded-lg shadow-xl overflow-hidden border border-neutral-800 p-0.5 group">
        <canvas
          id="badge-preview-canvas"
          ref={canvasRef}
          width={BADGE_WIDTH_PX}
          height={BADGE_HEIGHT_PX}
          className="w-full h-full object-contain rounded"
        />
        {/* Dimensions badge overlays */}
        <div className="absolute top-2 left-2 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-400 border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          7,0 cm
        </div>
        <div className="absolute bottom-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-400 border border-neutral-800 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          2,5 cm (300 DPI)
        </div>
      </div>
    </div>
  );
};
