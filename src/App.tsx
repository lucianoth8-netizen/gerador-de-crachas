/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BadgeData, SheetSettings, DEFAULT_BADGE_VALUES } from './types';
import { BadgePreview } from './components/BadgePreview';
import { BadgeForm } from './components/BadgeForm';
import { A4Sheet } from './components/A4Sheet';
import { generateA4Pdf } from './utils/pdfGenerator';
import { drawBadge } from './utils/drawBadge';
import { 
  Sparkles, 
  HelpCircle, 
  Tag, 
  Printer, 
  Download, 
  Plus, 
  FolderSync, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

// Help helper canvas to draw badges in print view
const PrintBadgeCanvas: React.FC<{ badge: BadgeData }> = ({ badge }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const draw = () => {
      ctx.clearRect(0, 0, 827, 295);
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
      width={827}
      height={295}
      className="w-full h-full object-cover"
    />
  );
};

import { useRef } from 'react';

const STORAGE_KEY_BADGES = 'swift_badge_generator_list';
const STORAGE_KEY_SETTINGS = 'swift_badge_generator_settings';

// Starter default sample badges
const INITIAL_SAMPLES: BadgeData[] = [
  {
    id: 'sample-1',
    name: 'Elielma Santos',
    role: 'Líder de vendas',
    ...DEFAULT_BADGE_VALUES,
  },
  {
    id: 'sample-2',
    name: 'Carlos Oliveira',
    role: 'Gerente Operacional',
    ...DEFAULT_BADGE_VALUES,
  },
  {
    id: 'sample-3',
    name: 'Mariana Costa',
    role: 'Coordenadora Geral',
    ...DEFAULT_BADGE_VALUES,
  },
];

const INITIAL_SETTINGS: SheetSettings = {
  showCutLines: true,
  showBorders: false,
  marginsMm: 30,
  gapMm: 10,
};

export default function App() {
  // Current badge being edited
  const [editingBadge, setEditingBadge] = useState<BadgeData>({
    id: 'current',
    name: '',
    role: '',
    ...DEFAULT_BADGE_VALUES,
  });

  // Badge list (sheet collection)
  const [badges, setBadges] = useState<BadgeData[]>([]);

  // Page layout settings
  const [sheetSettings, setSheetSettings] = useState<SheetSettings>(INITIAL_SETTINGS);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedBadges = localStorage.getItem(STORAGE_KEY_BADGES);
      if (storedBadges) {
        setBadges(JSON.parse(storedBadges));
      } else {
        // First-time user, load default sample badges
        setBadges(INITIAL_SAMPLES);
        localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(INITIAL_SAMPLES));
      }

      const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (storedSettings) {
        setSheetSettings(JSON.parse(storedSettings));
      }
    } catch (e) {
      console.error('Error loading data from local storage', e);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  const saveBadges = (updated: BadgeData[]) => {
    setBadges(updated);
    try {
      localStorage.setItem(STORAGE_KEY_BADGES, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving badges to local storage', e);
    }
  };

  const saveSettings = (updated: SheetSettings) => {
    setSheetSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving settings to local storage', e);
    }
  };

  // Add the current badge to sheet
  const handleAddToSheet = () => {
    if (!editingBadge.name.trim() && !editingBadge.role.trim()) {
      alert('Por favor, preencha o Nome ou Cargo antes de adicionar à folha.');
      return;
    }

    const newBadge: BadgeData = {
      ...editingBadge,
      id: `badge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const updated = [...badges, newBadge];
    saveBadges(updated);

    // Toast/Alert equivalent visual feedback
    // Clear name & role for next input
    setEditingBadge(prev => ({
      ...prev,
      name: '',
      role: '',
    }));
  };

  // Quick download individual PNG
  const handleDownloadSinglePng = () => {
    const canvas = document.getElementById('badge-preview-canvas') as HTMLCanvasElement | null;
    if (!canvas) {
      alert('Erro ao processar imagem para download.');
      return;
    }
    
    try {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const filename = `${editingBadge.name || 'cracha'}_swift.png`.toLowerCase().replace(/\s+/g, '_');
      link.download = filename;
      link.href = url;
      link.click();
    } catch (e) {
      console.error('Error exporting PNG', e);
      alert('Erro ao exportar o arquivo PNG. Se estiver usando imagem customizada, garanta que seja segura.');
    }
  };

  // Remove badge from collection
  const handleRemoveBadge = (id: string) => {
    const updated = badges.filter(b => b.id !== id);
    saveBadges(updated);
  };

  // Duplicate a badge
  const handleDuplicateBadge = (badgeToDuplicate: BadgeData) => {
    const duplicated: BadgeData = {
      ...badgeToDuplicate,
      id: `badge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    saveBadges([...badges, duplicated]);
  };

  // Edit a badge (load back into active form editor)
  const handleEditBadge = (badgeToEdit: BadgeData) => {
    setEditingBadge({
      ...badgeToEdit,
      id: 'current', // keep active editing status ID
    });
    // Scroll to form on mobile devices smoothly
    const element = document.getElementById('badge-editor-workspace');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Copy style settings from the previous badge on the sheet
  const handleApplyPreviousSettings = () => {
    if (badges.length === 0) return;
    const lastBadge = badges[badges.length - 1];
    setEditingBadge(prev => ({
      ...prev,
      nameFontSize: lastBadge.nameFontSize,
      roleFontSize: lastBadge.roleFontSize,
      textSpacing: lastBadge.textSpacing,
      textYOffset: lastBadge.textYOffset,
      nameColor: lastBadge.nameColor,
      roleColor: lastBadge.roleColor,
      logoType: lastBadge.logoType,
      logoSrc: lastBadge.logoSrc,
      logoScale: lastBadge.logoScale,
      logoXOffset: lastBadge.logoXOffset,
      logoYOffset: lastBadge.logoYOffset,
      logoStrokeWidth: lastBadge.logoStrokeWidth,
    }));
  };

  // Clear entire sheet
  const handleClearSheet = () => {
    saveBadges([]);
  };

  // PDF Generation Trigger
  const handleDownloadPdf = async () => {
    await generateA4Pdf(badges, {
      showCutLines: sheetSettings.showCutLines,
      showBorders: sheetSettings.showBorders,
    });
  };

  // Native Browser Print Trigger
  const handlePrint = () => {
    window.print();
  };

  // Generate chunks for print-only grid (pages of 20)
  const maxBadgesPerPage = 20;
  const printPages: BadgeData[][] = [];
  for (let i = 0; i < badges.length; i += maxBadgesPerPage) {
    printPages.push(badges.slice(i, i + maxBadgesPerPage));
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased">
      
      {/* 1. Main Dashboard UI (Hidden during Printing) */}
      <header className="no-print border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-40 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              {/* Swift logo inline SVG as icon */}
              <svg viewBox="0 0 100 100" className="w-6 h-6 text-black fill-none stroke-current" strokeWidth="12">
                <path d="M 50 15 L 85 15 L 85 50 A 35 35 0 1 1 50 15 Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold font-display tracking-tight text-white flex items-center gap-1.5">
                Gerador de Crachás Swift
              </h1>
              <p className="text-[11px] text-neutral-400 font-medium">
                Padrão Corporativo • 7,0 cm × 2,5 cm • Alta Resolução 300 DPI
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href="#how-it-works"
              className="px-3.5 py-1.5 rounded-lg bg-neutral-850 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors"
            >
              Como usar?
            </a>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-8">
        
        {/* Workspace split columns */}
        <div id="badge-editor-workspace" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Live Preview on top, edit forms below (LHS) */}
          <div className="lg:col-span-5 flex flex-col gap-6 sticky top-[120px] sm:top-[80px] lg:top-24 z-20">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col gap-5 shadow-lg">
              <BadgePreview badge={editingBadge} />
              
              <div className="flex justify-center gap-2">
                <button
                  id="btn-export-png-direct"
                  type="button"
                  onClick={handleDownloadSinglePng}
                  className="w-full py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-200 hover:text-white font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  Baixar Este Crachá (PNG)
                </button>
              </div>
            </div>


          </div>

          {/* Right Panel: Settings and Fine Tuning Form (RHS) */}
          <div className="lg:col-span-7">
            <BadgeForm
              badge={editingBadge}
              onChange={setEditingBadge}
              onAddToSheet={handleAddToSheet}
              hasPreviousBadge={badges.length > 0}
              onApplyPreviousSettings={handleApplyPreviousSettings}
            />
          </div>

        </div>

        {/* Row 3: A4 Grid Preview and Page Settings */}
        <div className="border-t border-neutral-800/80 pt-8 mt-4">
          <A4Sheet
            badges={badges}
            settings={sheetSettings}
            onUpdateSettings={saveSettings}
            onRemoveBadge={handleRemoveBadge}
            onDuplicateBadge={handleDuplicateBadge}
            onEditBadge={handleEditBadge}
            onClearSheet={handleClearSheet}
            onPrint={handlePrint}
            onDownloadPdf={handleDownloadPdf}
          />
        </div>

        {/* Row 4: Detailed Instructions/Help FAQ Section */}
        <section id="how-it-works" className="border-t border-neutral-800 pt-10 pb-6">
          <div className="max-w-3xl flex flex-col gap-6">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              Como usar o Gerador de Crachás e obter melhores resultados?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-400 leading-relaxed">
              <div className="flex flex-col gap-2 bg-neutral-900/30 p-4 rounded-xl border border-neutral-850">
                <h4 className="font-semibold text-neutral-200 text-sm">1. Editando e Ajustando</h4>
                <p>
                  Digite o Nome e Cargo no editor. Use os controles deslizantes para ajustar o tamanho da fonte, o espaçamento entre textos e a posição global para deixá-lo no ponto desejado. Você também pode deslocar ou redimensionar a logo para um encaixe impecável.
                </p>
              </div>

              <div className="flex flex-col gap-2 bg-neutral-900/30 p-4 rounded-xl border border-neutral-850">
                <h4 className="font-semibold text-neutral-200 text-sm">2. Adicionando à Grade</h4>
                <p>
                  Clique em <strong>Adicionar à Folha A4</strong> para fixar o crachá na folha de impressão. Você pode repetir esse processo alterando os nomes para preencher a folha inteira. Cada página A4 comporta até 20 crachás de 7,0 cm × 2,5 cm.
                </p>
              </div>

              <div className="flex flex-col gap-2 bg-neutral-900/30 p-4 rounded-xl border border-neutral-850">
                <h4 className="font-semibold text-neutral-200 text-sm">3. Impressão Perfeita</h4>
                <p>
                  Ao clicar em <strong>Imprimir A4</strong>, as configurações de impressão do seu navegador serão acionadas. Garanta que a escala esteja em <strong>100% (Tamanho Real)</strong>, as margens estejam em <strong>Nenhuma</strong> e ative <strong>Gráficos de Fundo</strong>.
                </p>
              </div>

              <div className="flex flex-col gap-2 bg-neutral-900/30 p-4 rounded-xl border border-neutral-850">
                <h4 className="font-semibold text-neutral-200 text-sm">4. Cortando e Acabamento</h4>
                <p>
                  Ative as <strong>Linhas de Corte (Crop Marks)</strong>. Elas criam pequenas guias nos cantos para você alinhar sua régua, estilete ou guilhotina perfeitamente, sem desenhar bordas na área interna preta do crachá.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-neutral-900 bg-neutral-950/80 py-6 text-center text-[11px] text-neutral-600">
        <p>Gerador de Crachás Swift © {new Date().getFullYear()} • Construído em conformidade com as diretrizes A4 de 300 DPI</p>
      </footer>

      {/* 2. PRINT-ONLY SECTION (Only visible and formatted during browser print, completely styled in index.css) */}
      <div className="hidden print-only bg-white">
        {printPages.length === 0 ? (
          // blank fallback page in case window.print is called empty
          <div className="print-page bg-white">
            <div className="w-full h-full border border-dashed border-neutral-300 flex items-center justify-center">
              <span className="text-sm font-mono text-neutral-400">Nenhum crachá adicionado à folha.</span>
            </div>
          </div>
        ) : (
          printPages.map((pageBadges, pageIdx) => (
            <div key={pageIdx} className="print-page bg-white">
              <div className="print-grid bg-white">
                {Array.from({ length: 20 }).map((_, idx) => {
                  const badge = pageBadges[idx];
                  return (
                    <div 
                      key={idx} 
                      className="relative w-full h-full bg-white overflow-visible"
                    >
                      {badge ? (
                        <div 
                          className="print-badge-box w-full h-full relative"
                          style={{
                            outline: sheetSettings.showBorders ? '1px solid rgb(200, 200, 200)' : 'none',
                          }}
                        >
                          <PrintBadgeCanvas badge={badge} />
                          
                          {/* Print Cut marks */}
                          {sheetSettings.showCutLines && (
                            <>
                              {/* Horizontal lines outside the badge */}
                              <div className="absolute top-0 -left-[3mm] w-[2.5mm] h-[0.1mm] bg-[#888888] pointer-events-none" />
                              <div className="absolute top-0 -right-[3mm] w-[2.5mm] h-[0.1mm] bg-[#888888] pointer-events-none" />
                              <div className="absolute bottom-0 -left-[3mm] w-[2.5mm] h-[0.1mm] bg-[#888888] pointer-events-none" />
                              <div className="absolute bottom-0 -right-[3mm] w-[2.5mm] h-[0.1mm] bg-[#888888] pointer-events-none" />

                              {/* Vertical lines outside the badge */}
                              <div className="absolute -top-[3mm] left-0 w-[0.1mm] h-[2.5mm] bg-[#888888] pointer-events-none" />
                              <div className="absolute -top-[3mm] right-0 w-[0.1mm] h-[2.5mm] bg-[#888888] pointer-events-none" />
                              <div className="absolute -bottom-[3mm] left-0 w-[0.1mm] h-[2.5mm] bg-[#888888] pointer-events-none" />
                              <div className="absolute -bottom-[3mm] right-0 w-[0.1mm] h-[2.5mm] bg-[#888888] pointer-events-none" />
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full bg-transparent opacity-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

