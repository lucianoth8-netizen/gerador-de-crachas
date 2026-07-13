import React, { useEffect, useRef, useState } from 'react';
import { BadgeData, BADGE_WIDTH_PX, BADGE_HEIGHT_PX, SheetSettings } from '../types';
import { drawBadge } from '../utils/drawBadge';
import { Trash2, Copy, FileCode, Printer, Download, Eye, EyeOff, LayoutGrid } from 'lucide-react';

interface A4SheetProps {
  badges: BadgeData[];
  settings: SheetSettings;
  onUpdateSettings: (settings: SheetSettings) => void;
  onRemoveBadge: (id: string) => void;
  onDuplicateBadge: (badge: BadgeData) => void;
  onEditBadge: (badge: BadgeData) => void;
  onClearSheet: () => void;
  onPrint: () => void;
  onDownloadPdf: () => void;
}

// Small helper canvas to draw each badge inside the grid preview
const GridBadgeCanvas: React.FC<{ badge: BadgeData }> = ({ badge }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Simple drawing, ensures loaded images are drawn correctly
    const draw = () => {
      ctx.clearRect(0, 0, BADGE_WIDTH_PX, BADGE_HEIGHT_PX);
      drawBadge(ctx, badge);
    };

    if (badge.logoType === 'custom' && badge.logoSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = badge.logoSrc;
      if (img.complete) {
        draw();
      } else {
        img.onload = draw;
      }
    } else {
      draw();
    }
  }, [badge]);

  return (
    <canvas
      ref={canvasRef}
      width={BADGE_WIDTH_PX}
      height={BADGE_HEIGHT_PX}
      className="w-full h-full object-cover select-none"
    />
  );
};

export const A4Sheet: React.FC<A4SheetProps> = ({
  badges,
  settings,
  onUpdateSettings,
  onRemoveBadge,
  onDuplicateBadge,
  onEditBadge,
  onClearSheet,
  onPrint,
  onDownloadPdf,
}) => {
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const maxBadges = 20; // 2 columns x 10 rows
  const fillPercentage = Math.min((badges.length / maxBadges) * 100, 100);

  // Group badges into pages of 20
  const pages: BadgeData[][] = [];
  for (let i = 0; i < badges.length; i += maxBadges) {
    pages.push(badges.slice(i, i + maxBadges));
  }

  // If there are no badges, show at least one blank page preview
  const activePages = pages.length > 0 ? pages : [[]];

  const toggleCutLines = () => {
    onUpdateSettings({ ...settings, showCutLines: !settings.showCutLines });
  };

  const toggleBorders = () => {
    onUpdateSettings({ ...settings, showBorders: !settings.showBorders });
  };

  return (
    <div className="flex flex-col gap-6 w-full text-neutral-100">
      
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-bold flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-orange-500" />
            Organização da Folha A4
          </h2>
          <p className="text-xs text-neutral-400">
            Os crachás são distribuídos automaticamente em colunas e linhas no tamanho real de 7x2,5 cm.
          </p>
        </div>

        {/* Collection Stats & Global Action */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-xs font-semibold">
              {badges.length} {badges.length === 1 ? 'crachá adicionado' : 'crachás adicionados'}
            </span>
            <div className="w-32 bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
              <div 
                className="bg-orange-500 h-full rounded-full transition-all duration-300" 
                style={{ width: `${(badges.length % maxBadges || (badges.length > 0 ? maxBadges : 0)) / maxBadges * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-neutral-500">
              Página {Math.max(1, pages.length)} (Capacidade: {maxBadges}/pág)
            </span>
          </div>

          {badges.length > 0 && (
            <button
              id="btn-clear-sheet"
              type="button"
              onClick={() => {
                if (isConfirmingClear) {
                  onClearSheet();
                  setIsConfirmingClear(false);
                } else {
                  setIsConfirmingClear(true);
                  setTimeout(() => {
                    setIsConfirmingClear(false);
                  }, 4000);
                }
              }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                isConfirmingClear
                  ? 'border-red-500 bg-red-500 text-white animate-pulse'
                  : 'border-red-500/30 hover:border-red-500 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white'
              }`}
            >
              {isConfirmingClear ? 'Confirmar?' : 'Limpar Tudo'}
            </button>
          )}
        </div>
      </div>

      {/* Grid of options + A4 Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Controls and Badge List Sidebar (LHS) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          
          {/* Layout settings options */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Opções de Layout de Impressão</h3>
            
            <div className="flex flex-col gap-3">
              {/* Toggle crop lines */}
              <button
                id="btn-toggle-cutlines"
                type="button"
                onClick={toggleCutLines}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 hover:bg-neutral-950/80 border border-neutral-800 text-left transition-all group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Linhas de Corte (Crop Marks)</span>
                  <span className="text-[10px] text-neutral-500">Guias fora do crachá para auxiliar no corte preciso</span>
                </div>
                {settings.showCutLines ? (
                  <Eye className="w-5 h-5 text-orange-500" />
                ) : (
                  <EyeOff className="w-5 h-5 text-neutral-600" />
                )}
              </button>

              {/* Toggle border outline */}
              <button
                id="btn-toggle-borders"
                type="button"
                onClick={toggleBorders}
                className="flex items-center justify-between p-3 rounded-lg bg-neutral-950 hover:bg-neutral-950/80 border border-neutral-800 text-left transition-all group"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Bordas de Referência</span>
                  <span className="text-[10px] text-neutral-500">Delimitador cinza fino ao redor de cada crachá</span>
                </div>
                {settings.showBorders ? (
                  <Eye className="w-5 h-5 text-orange-500" />
                ) : (
                  <EyeOff className="w-5 h-5 text-neutral-600" />
                )}
              </button>
            </div>

            {/* Quick Actions if sheet not empty */}
            {badges.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  id="btn-print-sheet"
                  type="button"
                  onClick={onPrint}
                  className="py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir A4
                </button>
                <button
                  id="btn-pdf-sheet"
                  type="button"
                  onClick={onDownloadPdf}
                  className="py-2.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 text-white font-semibold text-xs border border-neutral-700 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar PDF A4
                </button>
              </div>
            )}
          </div>

          {/* List of Badges Added */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Lista de Crachás na Folha</h3>
            
            {badges.length === 0 ? (
              <div className="py-8 text-center text-neutral-600 text-xs flex flex-col items-center gap-2">
                <FileCode className="w-8 h-8 text-neutral-700" />
                Nenhum crachá adicionado à folha ainda.<br/>Digite os dados e clique em "Adicionar à Folha A4".
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
                {badges.map((badge, idx) => (
                  <div 
                    key={badge.id} 
                    className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 hover:border-neutral-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-neutral-900 text-[10px] font-mono text-neutral-500 border border-neutral-800">
                        {idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{badge.name || 'Sem nome'}</p>
                        <p className="text-[10px] text-neutral-500 truncate">{badge.role || 'Sem cargo'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`btn-edit-badge-${badge.id}`}
                        type="button"
                        onClick={() => onEditBadge(badge)}
                        title="Carregar de volta no editor"
                        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-orange-400 transition-colors text-[10px] font-medium"
                      >
                        Editar
                      </button>
                      <button
                        id={`btn-duplicate-badge-${badge.id}`}
                        type="button"
                        onClick={() => onDuplicateBadge(badge)}
                        title="Duplicar na folha"
                        className="p-1.5 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`btn-delete-badge-${badge.id}`}
                        type="button"
                        onClick={() => onRemoveBadge(badge.id)}
                        title="Excluir"
                        className="p-1.5 rounded hover:bg-red-500/10 text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Visual A4 Layout Canvas (RHS) */}
        <div className="lg:col-span-7 flex flex-col items-center gap-4">
          <div className="flex justify-between items-center w-full max-w-[500px] px-1">
            <span className="text-xs font-mono text-neutral-400">Layout de Impressão Virtual (A4)</span>
            <span className="text-[10px] text-neutral-500">Escalado para caber na tela</span>
          </div>

          {activePages.map((pageBadges, pageIdx) => (
            <div 
              key={pageIdx}
              id={`print-section-page-${pageIdx}`}
              className="w-full max-w-[500px] aspect-[210/297] bg-white border border-neutral-200 shadow-2xl relative text-black p-0 overflow-hidden rounded-xl print:m-0 print:border-none print:shadow-none print:rounded-none"
              style={{
                // Explicit margin offsets in screen rendering inside page container
                // Mirroring real margins of left/right: 14.28%, top: 5.05%, bottom: 4.71%
                paddingLeft: '14.28%',
                paddingRight: '14.28%',
                paddingTop: '5.05%',
                paddingBottom: '4.71%',
              }}
            >
              {/* Virtual Grid containing exactly 2 cols x 10 rows */}
              <div 
                className="w-full h-full grid grid-cols-2 grid-rows-10 relative"
                style={{
                  columnGap: '4.76%', // gap of 10mm relative to A4 printable area width
                  rowGap: '0.67%',    // gap of 2mm relative to A4 printable area height
                }}
              >
                {/* Render up to 20 grid positions */}
                {Array.from({ length: 20 }).map((_, idx) => {
                  const badge = pageBadges[idx];
                  return (
                    <div 
                      key={idx} 
                      className="relative w-full h-full select-none"
                    >
                      {badge ? (
                        <div 
                          className="w-full h-full relative"
                          style={{
                            outline: settings.showBorders ? '1px solid rgb(200, 200, 200)' : 'none',
                          }}
                        >
                          <GridBadgeCanvas badge={badge} />
                          
                          {/* Cut Line Overlays if active */}
                          {settings.showCutLines && (
                            <>
                              {/* Horizontal lines outside the badge */}
                              {/* Top-Left Horizontal */}
                              <div className="absolute top-0 -left-2.5 w-2 h-[1px] bg-neutral-400 pointer-events-none" />
                              {/* Top-Right Horizontal */}
                              <div className="absolute top-0 -right-2.5 w-2 h-[1px] bg-neutral-400 pointer-events-none" />
                              {/* Bottom-Left Horizontal */}
                              <div className="absolute bottom-0 -left-2.5 w-2 h-[1px] bg-neutral-400 pointer-events-none" />
                              {/* Bottom-Right Horizontal */}
                              <div className="absolute bottom-0 -right-2.5 w-2 h-[1px] bg-neutral-400 pointer-events-none" />

                              {/* Vertical lines outside the badge */}
                              {/* Top-Left Vertical */}
                              <div className="absolute -top-2.5 left-0 w-[1px] h-2 bg-neutral-400 pointer-events-none" />
                              {/* Top-Right Vertical */}
                              <div className="absolute -top-2.5 right-0 w-[1px] h-2 bg-neutral-400 pointer-events-none" />
                              {/* Bottom-Left Vertical */}
                              <div className="absolute -bottom-2.5 left-0 w-[1px] h-2 bg-neutral-400 pointer-events-none" />
                              {/* Bottom-Right Vertical */}
                              <div className="absolute -bottom-2.5 right-0 w-[1px] h-2 bg-neutral-400 pointer-events-none" />
                            </>
                          )}
                        </div>
                      ) : (
                        // Faint outline of empty positions
                        <div className="w-full h-full border border-dashed border-neutral-200 flex items-center justify-center opacity-40">
                          <span className="text-[9px] text-neutral-400 font-mono">Disponível</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Virtual Page Watermark on screen, hidden in print */}
              <div className="absolute bottom-1 right-2 text-[9px] text-neutral-300 font-mono select-none print:hidden">
                Pág. {pageIdx + 1}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};
