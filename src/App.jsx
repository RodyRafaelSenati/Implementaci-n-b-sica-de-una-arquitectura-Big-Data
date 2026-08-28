import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { GlobalFiltersBar } from './components/filters/GlobalFiltersBar';
import { KPIGrid } from './components/kpi/KPIGrid';
import { ChartsGrid } from './components/charts/ChartsGrid';
import { BusinessInsights } from './components/insights/BusinessInsights';
import { ExecutiveReport } from './components/report/ExecutiveReport';
import { DataTableModal } from './components/report/DataTableModal';
import { AdHocQueryBuilder } from './components/adhoc/AdHocQueryBuilder';
import { 
  Sparkles, 
  BarChart3, 
  Lightbulb, 
  FileText, 
  LayoutDashboard, 
  AlertCircle,
  Database,
  RefreshCw,
  Server,
  Sliders
} from 'lucide-react';

const DashboardContent = () => {
  const { 
    rawDataset, 
    loading, 
    error, 
    activeTab, 
    loadBigDataPipelineDataset 
  } = useData();

  const [isDataTableOpen, setIsDataTableOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Barra de Navegación Superior */}
      <Navbar 
        onOpenDataTable={() => setIsDataTableOpen(true)}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Banner de Sincronización Big Data */}
        {loading && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-semibold">Sincronizando con el clúster de almacenamiento HDFS y MongoDB NoSQL...</span>
            </div>
            <span className="font-mono text-[11px] text-indigo-400">DATASTORE S.A.C. Big Data Lake</span>
          </div>
        )}

        {/* Error Global */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadBigDataPipelineDataset}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold transition-colors flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar Conexión</span>
            </button>
          </div>
        )}

        {/* Si no hay datos cargados */}
        {!loading && rawDataset.length === 0 && (
          <div className="my-16 text-center glass-panel rounded-3xl p-12 max-w-xl mx-auto border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mx-auto flex items-center justify-center mb-4">
              <Server className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Conectando al Data Lake HDFS & MongoDB</h3>
            <p className="text-xs text-slate-400 mb-6">
              El dashboard consulta directamente el clúster HDFS (<code>/datastore/processed/</code>) y la base de datos NoSQL <code>datastore_db.ventas</code>.
            </p>
            <button
              onClick={loadBigDataPipelineDataset}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sincronizar Datos del Clúster</span>
            </button>
          </div>
        )}

        {/* Dashboard Principal con Datos Sincronizados de HDFS / MongoDB */}
        {rawDataset.length > 0 && (
          <>
            {/* Barra de Filtros Globales Reactivos */}
            <GlobalFiltersBar />

            {/* Grid Superior de 6 KPIs */}
            <KPIGrid />

            {/* Vista según la pestaña activa */}
            {activeTab === 'dashboard' && (
              <div className="space-y-10 animate-fade-in">
                {/* 1. Módulo de Consultas Libres & Ad-Hoc Analytics */}
                <AdHocQueryBuilder />

                {/* 2. Grid de 8 Gráficos Estadísticos */}
                <ChartsGrid />

                {/* 3. Módulo de Insights Estratégicos */}
                <BusinessInsights />

                {/* 4. Reporte Ejecutivo Resumen */}
                <ExecutiveReport />
              </div>
            )}

            {activeTab === 'adhoc' && (
              <div className="animate-fade-in">
                <AdHocQueryBuilder />
              </div>
            )}

            {activeTab === 'charts' && (
              <div className="animate-fade-in">
                <ChartsGrid />
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="animate-fade-in">
                <BusinessInsights />
              </div>
            )}

            {activeTab === 'report' && (
              <div className="animate-fade-in">
                <ExecutiveReport />
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Modal de Tabla de Datos */}
      {isDataTableOpen && (
        <DataTableModal 
          onClose={() => setIsDataTableOpen(false)} 
        />
      )}

    </div>
  );
};

export function App() {
  return (
    <DataProvider>
      <DashboardContent />
    </DataProvider>
  );
}

export default App;
