import React from 'react';
import { 
  Building2, 
  Database, 
  FileSpreadsheet, 
  Printer, 
  Layers, 
  Calendar,
  Search,
  Activity,
  Sliders,
  FlaskConical
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatNumber } from '../../utils/formatters';

export const TopHeader = ({ onOpenDataTable }) => {
  const { 
    filteredDataset, 
    rawDataset,
    activeTab,
    filters 
  } = useData();

  const tabTitles = {
    dashboard: { title: 'Dashboard Integral de Inteligencia de Negocios', subtitle: 'Vista ejecutiva consolidada, KPIs, gráficos y análisis comercial' },
    lab: { title: 'Laboratorio Comparativo Big Data (Hadoop vs. Spark vs. Flink)', subtitle: 'Procesamiento distribuido, descomposición de paradigmas y matriz de rendimiento' },
    adhoc: { title: 'Panel de Consultas Libres & Ad-Hoc Analytics', subtitle: 'Exploración dimensional dinámica, matrices personalizadas y código MQL' },
    charts: { title: '8 Gráficos Estadísticos & Visualización BI', subtitle: 'Análisis profundo de series de tiempo, correlaciones y categorías' },
    insights: { title: 'Módulo de Insights y Recomendaciones Estratégicas', subtitle: 'Marco de negocio: [RESULTADO] → [INTERPRETACIÓN] → [DECISIÓN PROPUESTA]' },
    report: { title: 'Reporte Ejecutivo de Gestión Comercial', subtitle: 'Informe consolidado para Dirección General con formato de exportación PDF' },
  };

  const currentInfo = tabTitles[activeTab] || tabTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-colors duration-200 no-print py-3.5 px-6 2xl:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Título de la Sección Activa */}
        <div>
          <div className="flex items-center space-x-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${activeTab === 'lab' ? 'bg-cyan-400 animate-pulse' : 'bg-indigo-500'}`}></span>
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              {currentInfo.title}
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-0.5">
            {currentInfo.subtitle}
          </p>
        </div>

        {/* Badges de Estado y Acciones Rápidas */}
        <div className="flex items-center space-x-3 text-xs">
          
          {/* Badge de Sede / Filtro Activo */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
            <span className="text-[11px] text-slate-400">Sede:</span>
            <strong className="text-cyan-400 font-semibold">{filters.selectedCity === 'ALL' ? 'Nacional (Todas)' : filters.selectedCity}</strong>
          </div>

          {/* Badge de Documentos Activos en MongoDB */}
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold shadow-inner">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>{formatNumber(filteredDataset.length)}</span>
            <span className="text-[10px] text-emerald-400/80 font-normal">/ {formatNumber(rawDataset.length)} docs</span>
          </div>

          {/* Botón rápido para abrir la tabla */}
          <button
            onClick={onOpenDataTable}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-all font-semibold flex items-center space-x-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Explorar Registros</span>
          </button>
        </div>

      </div>
    </header>
  );
};
