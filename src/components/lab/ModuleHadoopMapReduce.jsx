import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Terminal, 
  HardDrive, 
  Layers, 
  Play, 
  CheckCircle2, 
  Clock, 
  Database, 
  ArrowRight,
  Code,
  FileCode,
  FileText
} from 'lucide-react';
import { runHadoopMapReduce } from '../../utils/bigDataEngines';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const ModuleHadoopMapReduce = ({ dataset }) => {
  const [filterConfig, setFilterConfig] = useState({ type: 'ALL', value: '', label: 'Sin Filtro' });
  const [executionResult, setExecutionResult] = useState(() => runHadoopMapReduce(dataset, { type: 'ALL', label: 'Sin Filtro' }));
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState('map'); // 'map', 'shuffle', 'reduce', 'hdfs'

  // Opciones dinámicas para los selectores de filtro
  const cities = React.useMemo(() => {
    if (!Array.isArray(dataset)) return [];
    return Array.from(new Set(dataset.map(r => r.Ciudad || r.ciudad).filter(Boolean))).sort();
  }, [dataset]);

  const categories = React.useMemo(() => {
    if (!Array.isArray(dataset)) return [];
    return Array.from(new Set(dataset.map(r => r.Categoría || r.categoria).filter(Boolean))).sort();
  }, [dataset]);

  // Sincronizar automáticamente cuando se sube un nuevo dataset o cambia el filtro
  useEffect(() => {
    if (dataset && Array.isArray(dataset) && dataset.length > 0) {
      setExecutionResult(runHadoopMapReduce(dataset, filterConfig));
    }
  }, [dataset, filterConfig]);

  const handleFilterTypeChange = (type) => {
    if (type === 'ALL') {
      setFilterConfig({ type: 'ALL', value: '', label: 'Sin Filtro (100% registros)' });
    } else if (type === 'CITY') {
      const defaultCity = cities[0] || 'Lima';
      setFilterConfig({ type: 'CITY', value: defaultCity, label: `Ciudad == "${defaultCity}"` });
    } else if (type === 'CATEGORY') {
      const defaultCat = categories[0] || 'Laptops';
      setFilterConfig({ type: 'CATEGORY', value: defaultCat, label: `Categoría == "${defaultCat}"` });
    } else if (type === 'MIN_AMOUNT') {
      setFilterConfig({ type: 'MIN_AMOUNT', value: 1000, label: 'Total_Venta >= S/ 1,000' });
    } else if (type === 'MIN_UNITS') {
      setFilterConfig({ type: 'MIN_UNITS', value: 3, label: 'Cantidad >= 3 unidades' });
    }
  };

  const handleRunMapReduce = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runHadoopMapReduce(dataset, filterConfig);
      setExecutionResult(res);
      setIsRunning(false);
    }, 500);
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>Módulo B: Hadoop MapReduce (Procesamiento por Lotes Tradicional)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Procesamiento desacoplado en dos fases (Map ➔ Reduce) con persistencia intermedia en disco HDFS y Shuffle distribuido.
          </p>
        </div>

        <button
          onClick={handleRunMapReduce}
          disabled={isRunning}
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-amber-600/30 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Ejecutando Job MapReduce...' : 'Re-ejecutar Job Hadoop'}</span>
        </button>
      </div>

      {/* BARRA DE FILTRADO PERSONALIZADO EN MAPPER */}
      <div className="glass-panel p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2">
          <div className="flex items-center space-x-2">
            <Code className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
              Filtro Personalizado en Mapper (FileInputFilter / RecordReader)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Registros Filtrados: <strong className="text-amber-400">{formatNumber(executionResult.filteredRecords || 0)}</strong> de {formatNumber(executionResult.totalInputRecords || 0)} ({formatNumber(executionResult.prunedRecords || 0)} descartados en Map)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
          
          {/* Selector de Método de Filtrado */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Método de Filtro en Mapper
            </label>
            <select
              value={filterConfig.type}
              onChange={(e) => handleFilterTypeChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
            >
              <option value="ALL">Sin Filtro (Dataset Completo)</option>
              <option value="CITY">Por Ciudad / Sede</option>
              <option value="CATEGORY">Por Categoría de Producto</option>
              <option value="MIN_AMOUNT">Por Importe Mínimo (Total Venta)</option>
              <option value="MIN_UNITS">Por Cantidad Mínima de Unidades</option>
            </select>
          </div>

          {/* Selector Dinámico de Valor según el tipo */}
          {filterConfig.type === 'CITY' && (
            <div>
              <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Seleccionar Ciudad
              </label>
              <select
                value={filterConfig.value}
                onChange={(e) => setFilterConfig({
                  ...filterConfig,
                  value: e.target.value,
                  label: `Ciudad == "${e.target.value}"`
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {filterConfig.type === 'CATEGORY' && (
            <div>
              <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Seleccionar Categoría
              </label>
              <select
                value={filterConfig.value}
                onChange={(e) => setFilterConfig({
                  ...filterConfig,
                  value: e.target.value,
                  label: `Categoría == "${e.target.value}"`
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {filterConfig.type === 'MIN_AMOUNT' && (
            <div>
              <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Importe Mínimo: S/ {formatNumber(filterConfig.value)}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={filterConfig.value}
                  onChange={(e) => setFilterConfig({
                    ...filterConfig,
                    value: Number(e.target.value),
                    label: `Total_Venta >= S/ ${e.target.value}`
                  })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {filterConfig.type === 'MIN_UNITS' && (
            <div>
              <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Unidades Mínimas: {filterConfig.value} u.
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={filterConfig.value}
                  onChange={(e) => setFilterConfig({
                    ...filterConfig,
                    value: Number(e.target.value),
                    label: `Cantidad >= ${e.target.value} u.`
                  })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Tag de Estado del Filtro Activo */}
          <div className="flex items-center space-x-2 pb-1">
            <span className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold block truncate w-full">
              Filtro Activo: <strong>{filterConfig.label}</strong>
            </span>
          </div>

        </div>
      </div>

      {/* Tarjetas de Métricas de Ejecución Hadoop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 block mb-1">Tiempo de Ejecución</span>
          <span className="text-lg font-bold text-amber-400 font-mono flex items-center space-x-1.5">
            <Clock className="w-4 h-4" />
            <span>{executionResult.latencyFormatted}</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Latencia alta (Spill a disco)</span>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 block mb-1">Modelo de Persistencia</span>
          <span className="text-lg font-bold text-white font-mono flex items-center space-x-1.5">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>HDFS Disk I/O</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Escritura en bloques HDFS</span>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 block mb-1">Spill en Disco (Shuffle)</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">
            {executionResult.diskSpillMB} MB
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Particiones temporales</span>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 block mb-1">Claves Agregadas</span>
          <span className="text-lg font-bold text-purple-400 font-mono">
            {Object.keys(executionResult.reduceOutput).length} SKUs
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Productos únicos reducidos</span>
        </div>
      </div>

      {/* Desglose Visual del Paradigma MapReduce (4 Fases) */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Flujo Arquitectónico MapReduce Paso a Paso</span>
          </span>

          {/* Selector de Fases */}
          <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveStep('map')}
              className={`px-3 py-1 rounded-lg transition-colors ${activeStep === 'map' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              1. MAP
            </button>
            <button
              onClick={() => setActiveStep('shuffle')}
              className={`px-3 py-1 rounded-lg transition-colors ${activeStep === 'shuffle' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              2. SHUFFLE & SORT
            </button>
            <button
              onClick={() => setActiveStep('reduce')}
              className={`px-3 py-1 rounded-lg transition-colors ${activeStep === 'reduce' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              3. REDUCE
            </button>
            <button
              onClick={() => setActiveStep('hdfs')}
              className={`px-3 py-1 rounded-lg transition-colors ${activeStep === 'hdfs' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              4. HDFS OUTPUT
            </button>
          </div>
        </div>

        {/* Contenido de la Fase Seleccionada */}
        {activeStep === 'map' && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl text-xs text-amber-200">
              <strong>Fase 1 (MAPPER):</strong> Cada registro del dataset se transforma en una tupla clave-valor independiente con formato <code>(Producto, &#123; ventas: Total_Venta, unidades: Cantidad &#125;)</code>.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
              {executionResult.mapSamples.map((sample, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300">
                  <span className="text-amber-400 font-bold block mb-1">Key (Clave): "{sample.key}"</span>
                  <span className="text-slate-400 text-[11px]">Value (Valor): &#123; ventas: S/ {sample.value.ventas.toFixed(2)}, unidades: {sample.value.unidades} &#125;</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 'shuffle' && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-3 bg-indigo-950/20 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
              <strong>Fase 2 (SHUFFLE & SORT):</strong> Hadoop agrupa por red y ordena en disco todas las tuplas con la misma clave para enviarlas al Reducer correspondiente: <code>(Producto, [Venta_1, Venta_2, ...])</code>.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
              {executionResult.shuffleSamples.slice(0, 4).map((group, idx) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-indigo-300 font-bold mb-1">
                    <span>Partición: "{group.key}"</span>
                    <span className="text-[10px] text-slate-400">{group.count} tuplas agrupadas</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    Listado agrupado: [{group.sampleValues.map(v => `${v.unidades}u ($${v.ventas})`).join(', ')} ... ]
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 'reduce' && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
              <strong>Fase 3 (REDUCER):</strong> La función reductora aplica la agregación acumulativa <code>Sum(Ventas)</code> y <code>Sum(Unidades)</code> para cada producto único.
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Producto (Clave Reducida)</th>
                    <th className="py-2.5 px-3 text-right">Transacciones Mapeadas</th>
                    <th className="py-2.5 px-3 text-right">Total Unidades (Sum)</th>
                    <th className="py-2.5 px-3 text-right">Total Facturación (Sum S/)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {Object.values(executionResult.reduceOutput).map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 text-white font-sans font-semibold">{r.producto}</td>
                      <td className="py-2 px-3 text-right text-slate-400">{formatNumber(r.transacciones)}</td>
                      <td className="py-2 px-3 text-right text-cyan-400">{formatNumber(r.totalUnidades)} u.</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-400">{formatCurrency(r.totalVentas)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeStep === 'hdfs' && (
          <div className="space-y-3 animate-fade-in">
            <div className="p-3 bg-cyan-950/20 border border-cyan-500/30 rounded-xl text-xs text-cyan-200">
              <strong>Fase 4 (HDFS OUTPUT):</strong> El Reducer emite el resultado final al sistema de archivos distribuido en formato estándar <code>part-r-00000</code>.
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-56">
              {executionResult.hdfsText}
            </pre>
          </div>
        )}
      </div>

      {/* Terminal de Logs de Hadoop */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 bg-slate-950 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="flex items-center space-x-1.5 font-bold text-slate-300">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Consola de Ejecución Hadoop JobTracker (Logs)</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Status: SUCCEEDED</span>
        </div>

        <div className="font-mono text-[11px] text-slate-300 space-y-1 max-h-44 overflow-y-auto pr-2">
          {executionResult.logs.map((log, idx) => (
            <div key={idx} className="leading-tight">
              <span className="text-slate-500">[{new Date().toISOString().slice(11, 19)}]</span> {log}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
