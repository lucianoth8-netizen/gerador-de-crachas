import React, { useState, useRef } from 'react';
import { BadgeData, DEFAULT_BADGE_VALUES, LogoType } from '../types';
import { Upload, RotateCcw, Type, Image as ImageIcon, Sparkles, Sliders, FolderSync } from 'lucide-react';

interface BadgeFormProps {
  badge: BadgeData;
  onChange: (updated: BadgeData) => void;
  onAddToSheet: () => void;
  hasPreviousBadge?: boolean;
  onApplyPreviousSettings?: () => void;
}

export const BadgeForm: React.FC<BadgeFormProps> = ({
  badge,
  onChange,
  onAddToSheet,
  hasPreviousBadge = false,
  onApplyPreviousSettings,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...badge,
      [name]: value,
    });
  };

  const handleSliderChange = (name: keyof BadgeData, value: number) => {
    onChange({
      ...badge,
      [name]: value,
    });
  };

  const handleLogoTypeChange = (type: LogoType) => {
    onChange({
      ...badge,
      logoType: type,
    });
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, envie apenas arquivos de imagem.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange({
          ...badge,
          logoType: 'custom',
          logoSrc: e.target.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleReset = () => {
    onChange({
      ...badge,
      ...DEFAULT_BADGE_VALUES,
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl p-5 text-neutral-100 shadow-xl">
      {/* Group 1: Content */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Type className="w-4 h-4 text-emerald-500" />
          Conteúdo do Crachá
        </h3>
        
        <div className="flex flex-col gap-1.5">
          <label htmlFor="badge-name" className="text-xs text-neutral-400 font-medium">Nome Completo</label>
          <input
            id="badge-name"
            type="text"
            name="name"
            value={badge.name}
            onChange={handleTextChange}
            placeholder="Ex: Elielma"
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder-neutral-600 outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="badge-role" className="text-xs text-neutral-400 font-medium">Cargo ou Função</label>
          <input
            id="badge-role"
            type="text"
            name="role"
            value={badge.role}
            onChange={handleTextChange}
            placeholder="Ex: Líder de vendas"
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder-neutral-600 outline-none transition-colors"
          />
        </div>

        {hasPreviousBadge && onApplyPreviousSettings && (
          <button
            id="btn-use-previous-config"
            type="button"
            onClick={onApplyPreviousSettings}
            className="flex items-center justify-center gap-2 mt-1 w-full text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-3 py-2.5 rounded-lg active:scale-[0.98]"
          >
            <FolderSync className="w-4 h-4 text-emerald-500" />
            Utilizar configuração do crachá anterior
          </button>
        )}
      </div>

      {/* Group 2: Text Fine-Tuning */}
      <div className="flex flex-col gap-4 border-t border-neutral-800 pt-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-500" />
          Ajustes de Texto & Fontes
        </h3>

        {/* Name Font Size */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-neutral-400">
            <label htmlFor="badge-nameFontSize">Tamanho do Nome</label>
            <span className="font-mono text-emerald-400">{badge.nameFontSize}px</span>
          </div>
          <input
            id="badge-nameFontSize"
            type="range"
            min="20"
            max="80"
            value={badge.nameFontSize}
            onChange={(e) => handleSliderChange('nameFontSize', parseInt(e.target.value))}
            className="w-full accent-emerald-500 h-1 bg-neutral-950 rounded-lg cursor-pointer"
          />
        </div>

        {/* Role Font Size */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-neutral-400">
            <label htmlFor="badge-roleFontSize">Tamanho do Cargo</label>
            <span className="font-mono text-emerald-400">{badge.roleFontSize}px</span>
          </div>
          <input
            id="badge-roleFontSize"
            type="range"
            min="12"
            max="50"
            value={badge.roleFontSize}
            onChange={(e) => handleSliderChange('roleFontSize', parseInt(e.target.value))}
            className="w-full accent-emerald-500 h-1 bg-neutral-950 rounded-lg cursor-pointer"
          />
        </div>

        {/* Spacing */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-neutral-400">
            <label htmlFor="badge-textSpacing">Espaçamento Entre Textos</label>
            <span className="font-mono text-emerald-400">{badge.textSpacing}px</span>
          </div>
          <input
            id="badge-textSpacing"
            type="range"
            min="-10"
            max="40"
            value={badge.textSpacing}
            onChange={(e) => handleSliderChange('textSpacing', parseInt(e.target.value))}
            className="w-full accent-emerald-500 h-1 bg-neutral-950 rounded-lg cursor-pointer"
          />
        </div>

        {/* Vertical Align */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-neutral-400">
            <label htmlFor="badge-textYOffset">Deslocamento Vertical Global</label>
            <span className="font-mono text-emerald-400">
              {badge.textYOffset > 0 ? `+${badge.textYOffset}` : badge.textYOffset}px
            </span>
          </div>
          <input
            id="badge-textYOffset"
            type="range"
            min="-50"
            max="50"
            value={badge.textYOffset}
            onChange={(e) => handleSliderChange('textYOffset', parseInt(e.target.value))}
            className="w-full accent-emerald-500 h-1 bg-neutral-950 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Group 3: Logo Styling */}
      <div className="flex flex-col gap-4 border-t border-neutral-800 pt-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-emerald-500" />
          Ajustes da Logo
        </h3>

        {/* Logo Selector Toggles */}
        <div className="grid grid-cols-3 gap-2">
          <button
            id="btn-logo-swift"
            type="button"
            onClick={() => handleLogoTypeChange('swift')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              badge.logoType === 'swift'
                ? 'bg-emerald-500 text-black'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Swift Logo
          </button>
          <button
            id="btn-logo-custom"
            type="button"
            onClick={() => {
              handleLogoTypeChange('custom');
              if (!badge.logoSrc) {
                fileInputRef.current?.click();
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              badge.logoType === 'custom'
                ? 'bg-emerald-500 text-black'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Custom Logo
          </button>
          <button
            id="btn-logo-none"
            type="button"
            onClick={() => handleLogoTypeChange('none')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              badge.logoType === 'none'
                ? 'bg-emerald-500 text-black'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            Sem Logo
          </button>
        </div>

        {/* Custom Logo File Upload Area (only if Custom is selected) */}
        {badge.logoType === 'custom' && (
          <div
            id="logo-upload-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center transition-colors ${
              isDragging
                ? 'border-emerald-500 bg-emerald-500/10'
                : badge.logoSrc
                ? 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700'
                : 'border-neutral-800 hover:border-neutral-700 bg-neutral-950/20'
            }`}
          >
            <input
              id="file-input-logo"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {badge.logoSrc ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={badge.logoSrc}
                  alt="Custom Logo Thumbnail"
                  className="w-10 h-10 object-contain rounded bg-neutral-950 p-1 border border-neutral-800"
                />
                <div className="text-left">
                  <p className="text-xs text-white font-medium">Logo carregada!</p>
                  <p className="text-[10px] text-neutral-500">Clique ou arraste outra para substituir</p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-5 h-5 text-neutral-500 group-hover:text-neutral-400" />
                <p className="text-xs text-neutral-300 font-medium">Enviar Imagem da Logo</p>
                <p className="text-[10px] text-neutral-500">Arraste e solte ou clique para selecionar</p>
              </>
            )}
          </div>
        )}

        {/* Sliders for Logo position and scale (visible if not 'none') */}
        {badge.logoType !== 'none' && (
          <div className="flex flex-col gap-3.5 bg-neutral-950/30 p-3 rounded-lg border border-neutral-800/40">
            {/* Scale */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-neutral-400">
                <label htmlFor="badge-logoScale">Escala da Logo</label>
                <span className="font-mono text-emerald-400">{Math.round(badge.logoScale * 100)}%</span>
              </div>
              <input
                id="badge-logoScale"
                type="range"
                min="0.4"
                max="1.8"
                step="0.05"
                value={badge.logoScale}
                onChange={(e) => handleSliderChange('logoScale', parseFloat(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-neutral-950 rounded-lg cursor-pointer"
              />
            </div>

            {/* Position X Offset */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-neutral-400">
                <label htmlFor="badge-logoXOffset">Posição X (Horizontal)</label>
                <span className="font-mono text-emerald-400">
                  {badge.logoXOffset > 0 ? `+${badge.logoXOffset}` : badge.logoXOffset}px
                </span>
              </div>
              <input
                id="badge-logoXOffset"
                type="range"
                min="-50"
                max="150"
                value={badge.logoXOffset}
                onChange={(e) => handleSliderChange('logoXOffset', parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-neutral-950 rounded-lg cursor-pointer"
              />
            </div>

            {/* Position Y Offset */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-neutral-400">
                <label htmlFor="badge-logoYOffset">Posição Y (Vertical)</label>
                <span className="font-mono text-emerald-400">
                  {badge.logoYOffset > 0 ? `+${badge.logoYOffset}` : badge.logoYOffset}px
                </span>
              </div>
              <input
                id="badge-logoYOffset"
                type="range"
                min="-100"
                max="100"
                value={badge.logoYOffset}
                onChange={(e) => handleSliderChange('logoYOffset', parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1 bg-neutral-950 rounded-lg cursor-pointer"
              />
            </div>

            {/* Stroke Width (Swift Logo only) */}
            {badge.logoType === 'swift' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs text-neutral-400">
                  <label htmlFor="badge-logoStrokeWidth">Espessura do Traço</label>
                  <span className="font-mono text-emerald-400">{badge.logoStrokeWidth}px</span>
                </div>
                <input
                  id="badge-logoStrokeWidth"
                  type="range"
                  min="2"
                  max="20"
                  value={badge.logoStrokeWidth}
                  onChange={(e) => handleSliderChange('logoStrokeWidth', parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-neutral-950 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-2 border-t border-neutral-800 pt-5 mt-2">
        <button
          id="btn-reset-badge"
          type="button"
          onClick={handleReset}
          title="Restaurar padrões"
          className="px-3.5 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="btn-add-to-sheet"
          type="button"
          onClick={onAddToSheet}
          className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98]"
        >
          <Sparkles className="w-4 h-4" />
          Adicionar à Folha A4
        </button>
      </div>
    </div>
  );
};
