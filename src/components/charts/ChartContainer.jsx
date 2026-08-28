import React, { useRef, useState } from 'react';
import { Download, Maximize2, Minimize2, Info } from 'lucide-react';

export const ChartContainer = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  badge, 
  children,
  height = '320px',
  infoText
}) => {
  const containerRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleDownloadImage = () => {
    if (!containerRef.current) return;
    const canvas = containerRef.current.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_datastore.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <>
      <div 
        ref={containerRef}
        className={`glass-panel rounded-2xl p-5 border border-slate-700/50 dark:border-slate-800/80 bg-slate-900/80 dark:bg-slate-900/60 shadow-lg flex flex-col justify-between transition-all duration-300 ${
          isExpanded 
            ? 'fixed inset-4 z-50 bg-slate-950/95 dark:bg-slate-950/95 border-indigo-500/50 shadow-2xl overflow-y-auto' 
            : 'hover:border-slate-600/60'
        }`}
      >
        {/* Cabecera del Gráfico */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            {Icon && (
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {title}
                </h4>
                {badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-400 font-normal mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Botones de acción rápida */}
          <div className="flex items-center space-x-1.5 no-print">
            {infoText && (
              <button
                onClick={() => setShowInfo(!showInfo)}
                title="Información del gráfico"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDownloadImage}
              title="Descargar gráfico como imagen PNG"
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Contraer' : 'Expandir a pantalla completa'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Panel de Información auxiliar */}
        {showInfo && infoText && (
          <div className="mb-3 p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-xs text-slate-300 animate-fade-in">
            {infoText}
          </div>
        )}

        {/* Contenedor del Canvas de Chart.js */}
        <div 
          className="w-full relative flex-1 flex items-center justify-center min-h-0"
          style={{ height: isExpanded ? 'calc(100vh - 160px)' : height }}
        >
          {children}
        </div>
      </div>

      {/* Backdrop para cuando está expandido */}
      {isExpanded && (
        <div 
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        />
      )}
    </>
  );
};
