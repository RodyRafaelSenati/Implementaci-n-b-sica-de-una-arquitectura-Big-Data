import React, { useState } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  FlaskConical,
  Sliders, 
  BarChart3, 
  Lightbulb, 
  FileText, 
  FileSpreadsheet, 
  Printer, 
  Sun, 
  Moon, 
  Database, 
  ChevronLeft, 
  ChevronRight,
  Server,
  HardDrive,
  Activity,
  Zap,
  Scale
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatNumber } from '../../utils/formatters';

export const Sidebar = ({ onOpenDataTable }) => {
  const { 
    theme, 
    toggleTheme, 
    filteredDataset, 
    rawDataset,
    activeTab, 
    setActiveTab 
  } = useData();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard Integral', icon: LayoutDashboard, badge: 'Principal' },
    { id: 'lab', label: 'Laboratorio Big Data', icon: FlaskConical, badge: 'Hadoop/Spark/Flink', isHighlight: true },
    { id: 'adhoc', label: 'Consultas Libres Ad-Hoc', icon: Sliders, badge: 'Explorador' },
    { id: 'charts', label: '8 Gráficos BI', icon: BarChart3 },
    { id: 'insights', label: 'Insights & Decisiones', icon: Lightbulb },
    { id: 'report', label: 'Reporte Ejecutivo', icon: FileText },
  ];

  return (
    <aside 
      className={`sticky top-0 h-screen glass-panel border-r border-slate-800/80 bg-slate-950/95 flex flex-col justify-between transition-all duration-300 z-40 shrink-0 no-print ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* 1. Header del Sidebar */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 shrink-0 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in truncate">
                <h1 className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent truncate">
                  DATASTORE S.A.C.
                </h1>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  Big Data Lake & BI Suite
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* 2. Navegación Principal */}
        <div className="p-3 space-y-1.5">
          <div className={`px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${isCollapsed ? 'hidden' : 'block'}`}>
            Módulos de Procesamiento
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-xl px-3 py-2.5 transition-all text-xs font-semibold group relative ${
                  isActive
                    ? item.isHighlight 
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
                      : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : item.isHighlight
                      ? 'text-cyan-300 bg-cyan-950/30 border border-cyan-500/30 hover:bg-cyan-900/40 hover:text-white'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                } ${isCollapsed ? 'justify-center' : 'justify-between'}`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : item.isHighlight ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                  }`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${
                    isActive ? 'bg-white/20 text-white' : item.isHighlight ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-indigo-300 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Tooltip flotante al estar colapsado */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Accesos Rápidos de Datos */}
        <div className="p-3 border-t border-slate-800/80 space-y-1.5">
          <div className={`px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider ${isCollapsed ? 'hidden' : 'block'}`}>
            Herramientas
          </div>

          <button
            onClick={onOpenDataTable}
            title={isCollapsed ? 'Explorador de Tabla MongoDB' : undefined}
            className={`w-full flex items-center rounded-xl px-3 py-2.5 transition-all text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/80 border border-slate-800/60 ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Tabla de Registros</span>}
          </button>

          <button
            onClick={handlePrint}
            title={isCollapsed ? 'Imprimir / Exportar Reporte a PDF' : undefined}
            className={`w-full flex items-center rounded-xl px-3 py-2.5 transition-all text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/80 border border-slate-800/60 ${
              isCollapsed ? 'justify-center' : 'space-x-3'
            }`}
          >
            <Printer className="w-4 h-4 text-cyan-400 shrink-0" />
            {!isCollapsed && <span className="truncate">Imprimir / PDF</span>}
          </button>
        </div>
      </div>

      {/* 4. Footer del Sidebar con Estado del Clúster */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>HDFS + MongoDB</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span>Docs indexados:</span>
              <span className="font-mono text-emerald-400 font-bold">{formatNumber(filteredDataset.length)}</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" title={`MongoDB: ${formatNumber(filteredDataset.length)} docs`}></div>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          className={`w-full flex items-center justify-center p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all ${
            isCollapsed ? '' : 'space-x-2'
          }`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              {!isCollapsed && <span className="text-xs font-semibold">Modo Claro</span>}
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-400" />
              {!isCollapsed && <span className="text-xs font-semibold">Modo Oscuro</span>}
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
