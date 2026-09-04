import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  UploadCloud, 
  HardDrive, 
  Zap, 
  Radio, 
  Scale, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  Database,
  FileCheck2
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { ModuleIngestionClean } from './ModuleIngestionClean';
import { ModuleHadoopMapReduce } from './ModuleHadoopMapReduce';
import { ModuleApacheSpark } from './ModuleApacheSpark';
import { ModuleApacheFlink } from './ModuleApacheFlink';
import { BenchmarkMatrix } from './BenchmarkMatrix';

export const BigDataLab = () => {
  const { filteredDataset, loadBigDataPipelineDataset, uploadCustomDataset, theme } = useData();
  const [labTab, setLabTab] = useState('all'); // 'all', 'ingestion', 'hadoop', 'spark', 'flink', 'benchmark'
  const [activeDataset, setActiveDataset] = useState(filteredDataset);
  const [activeSourceLabel, setActiveSourceLabel] = useState('ventas_clean.csv (Dataset Clúster)');
  const isDark = theme === 'dark';

  // Sincronizar dataset cuando filteredDataset cambia
  useEffect(() => {
    if (filteredDataset && filteredDataset.length > 0) {
      setActiveDataset(filteredDataset);
    }
  }, [filteredDataset]);

  const handleDatasetCleaned = (newCleanData, fileName) => {
    setActiveDataset(newCleanData);
    setActiveSourceLabel(fileName ? `Archivo Subido: ${fileName}` : 'Nuevo Dataset Personalizado');
    
    // Propagar también al contexto global para sincronía total
    if (uploadCustomDataset) {
      uploadCustomDataset(newCleanData, fileName);
    }
  };

  const handleResetDefaultDataset = () => {
    setActiveSourceLabel('ventas_clean.csv (Dataset Clúster)');
    if (loadBigDataPipelineDataset) {
      loadBigDataPipelineDataset();
    }
  };

  const tabs = [
    { id: 'all', label: 'Visión Integral del Lab', icon: Layers, badge: 'Completo' },
    { id: 'ingestion', label: 'Módulo A: Ingesta & Limpieza', icon: UploadCloud },
    { id: 'hadoop', label: 'Módulo B: Hadoop MapReduce', icon: HardDrive, color: 'text-amber-400' },
    { id: 'spark', label: 'Módulo C: Apache Spark', icon: Zap, color: 'text-cyan-400' },
    { id: 'flink', label: 'Módulo D: Apache Flink', icon: Radio, color: 'text-emerald-400' },
    { id: 'benchmark', label: 'Matriz Comparativa & Benchmark', icon: Scale, badge: 'Métricas' },
  ];

  return (
    <div className="space-y-8 animate-fade-in mb-12">
      
      {/* Banner Principal del Laboratorio */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/80 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold uppercase tracking-wider">
              <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
              <span>Laboratorio de Procesamiento Distribuido</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Benchmarking Comparativo: Hadoop vs. Spark vs. Flink
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Ejecuta la misma agregación analítica (<strong>Total de Ventas y Unidades por Producto</strong>) a través de los tres motores distribuidos. Sube cualquier archivo CSV para contrastar resultados y latencias en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Registros en Proceso</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {activeDataset ? activeDataset.length.toLocaleString() : 0}
              </span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block uppercase">Fuente de Datos</span>
              <span className="text-xs font-bold text-cyan-400 truncate max-w-[160px] block" title={activeSourceLabel}>
                {activeSourceLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selector de Sub-Pestañas del Laboratorio */}
      <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = labTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setLabTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.color || (isActive ? 'text-white' : 'text-slate-400')}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-300'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Renderizado de Vistas según la pestaña activa */}
      
      {/* 1. Vista Completa / All in One */}
      {labTab === 'all' && (
        <div className="space-y-12 animate-fade-in">
          <ModuleIngestionClean 
            currentDataset={activeDataset} 
            onProcessDataset={handleDatasetCleaned}
            onDatasetCleaned={handleDatasetCleaned} 
            onResetDefaultDataset={handleResetDefaultDataset}
          />
          <ModuleHadoopMapReduce dataset={activeDataset} />
          <ModuleApacheSpark dataset={activeDataset} />
          <ModuleApacheFlink dataset={activeDataset} />
          <BenchmarkMatrix dataset={activeDataset} isDark={isDark} />
        </div>
      )}

      {/* 2. Módulo A: Ingesta & Limpieza */}
      {labTab === 'ingestion' && (
        <div className="animate-fade-in">
          <ModuleIngestionClean 
            currentDataset={activeDataset} 
            onProcessDataset={handleDatasetCleaned}
            onDatasetCleaned={handleDatasetCleaned} 
            onResetDefaultDataset={handleResetDefaultDataset}
          />
        </div>
      )}

      {/* 3. Módulo B: Hadoop MapReduce */}
      {labTab === 'hadoop' && (
        <div className="animate-fade-in">
          <ModuleHadoopMapReduce dataset={activeDataset} />
        </div>
      )}

      {/* 4. Módulo C: Apache Spark */}
      {labTab === 'spark' && (
        <div className="animate-fade-in">
          <ModuleApacheSpark dataset={activeDataset} />
        </div>
      )}

      {/* 5. Módulo D: Apache Flink */}
      {labTab === 'flink' && (
        <div className="animate-fade-in">
          <ModuleApacheFlink dataset={activeDataset} />
        </div>
      )}

      {/* 6. Matriz Comparativa & Benchmark */}
      {labTab === 'benchmark' && (
        <div className="animate-fade-in">
          <BenchmarkMatrix dataset={activeDataset} isDark={isDark} />
        </div>
      )}

    </div>
  );
};
