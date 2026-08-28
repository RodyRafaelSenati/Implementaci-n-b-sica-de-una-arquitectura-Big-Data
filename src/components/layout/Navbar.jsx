import React from 'react';
import { 
  Building2, 
  Sun, 
  Moon, 
  FileText, 
  BarChart3, 
  Lightbulb, 
  LayoutDashboard, 
  FileSpreadsheet, 
  Printer, 
  Database,
  CheckCircle2,
  Server,
  HardDrive
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatNumber } from '../../utils/formatters';

export const Navbar = ({ onOpenDataTable }) => {
  const { 
    theme, 
    toggleTheme, 
    filteredDataset, 
    rawDataset,
    activeTab, 
    setActiveTab,
    dataSourceInfo
  } = useData();

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-700/40 dark:border-slate-800/80 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo y Branding */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  DATASTORE S.A.C.
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  HDFS + MongoDB NoSQL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Dashboard Empresarial de Inteligencia de Negocios & Big Data Lake
              </p>
            </div>
          </div>

          {/* Navegación por Tabs */}
          <nav className="hidden lg:flex items-center p-1 bg-slate-900/60 dark:bg-slate-900/90 rounded-xl border border-slate-800/80 text-xs font-medium text-slate-300">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all duration-150 ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Integral</span>
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all duration-150 ${
                activeTab === 'charts'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Análisis Gráfico</span>
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all duration-150 ${
                activeTab === 'insights'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Insights & Decisiones</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all duration-150 ${
                activeTab === 'report'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Reporte Ejecutivo</span>
            </button>
          </nav>

          {/* Acciones de la Derecha (Sin botones de carga manual de CSV) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Status Badge de HDFS & MongoDB */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs shadow-inner">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                <Database className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Cluster MongoDB:</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">
                {formatNumber(filteredDataset.length)} docs
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {/* Ver Tabla de Datos */}
            <button
              onClick={onOpenDataTable}
              title="Explorar registros almacenados en MongoDB"
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold rounded-xl text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/70 transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Tabla de Datos</span>
            </button>

            {/* Imprimir / PDF */}
            <button
              onClick={handlePrint}
              title="Imprimir / Exportar Reporte a PDF"
              className="p-2 text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 rounded-xl border border-slate-700/70 transition-all"
            >
              <Printer className="w-4 h-4 text-slate-300" />
            </button>

            {/* Toggle Tema Dark / Light */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              className="p-2 text-slate-300 hover:text-amber-400 bg-slate-800/90 hover:bg-slate-700/90 rounded-xl border border-slate-700/70 transition-all"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
            </button>
          </div>
        </div>

        {/* Barra de pestañas móvil */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-slate-800/60 space-x-2 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 bg-slate-800/50'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'charts' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 bg-slate-800/50'
            }`}
          >
            8 Gráficos BI
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'insights' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 bg-slate-800/50'
            }`}
          >
            Insights & Decisiones
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'report' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 bg-slate-800/50'
            }`}
          >
            Reporte Ejecutivo
          </button>
        </div>

      </div>
    </header>
  );
};
