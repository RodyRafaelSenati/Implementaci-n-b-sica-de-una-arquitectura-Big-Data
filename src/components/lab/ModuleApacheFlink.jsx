import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  Layers, 
  Clock, 
  ShieldCheck, 
  Play, 
  Terminal, 
  Code2, 
  Sparkles, 
  Radio, 
  CheckCircle2 
} from 'lucide-react';
import { runApacheFlink } from '../../utils/bigDataEngines';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const ModuleApacheFlink = ({ dataset }) => {
  const [filterConfig, setFilterConfig] = useState({ type: 'ALL', value: '', label: 'Sin Filtro' });
  const [executionResult, setExecutionResult] = useState(() => runApacheFlink(dataset, { type: 'ALL', label: 'Sin Filtro' }));
  const [isRunning, setIsRunning] = useState(false);
  const [showCode, setShowCode] = useState(true);

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
      setExecutionResult(runApacheFlink(dataset, filterConfig));
    }
  }, [dataset, filterConfig]);

  const handleFilterTypeChange = (type) => {
    if (type === 'ALL') {
      setFilterConfig({ type: 'ALL', value: '', label: 'Sin Filtro (Flujo continuo completo)' });
    } else if (type === 'CITY') {
      const defaultCity = cities[0] || 'Lima';
      setFilterConfig({ type: 'CITY', value: defaultCity, label: `lambda r: r.Ciudad == "${defaultCity}"` });
    } else if (type === 'CATEGORY') {
      const defaultCat = categories[0] || 'Laptops';
      setFilterConfig({ type: 'CATEGORY', value: defaultCat, label: `lambda r: r.Categoría == "${defaultCat}"` });
    } else if (type === 'MIN_AMOUNT') {
      setFilterConfig({ type: 'MIN_AMOUNT', value: 600, label: 'lambda r: r.Total_Venta >= 600' });
    } else if (type === 'MIN_UNITS') {
      setFilterConfig({ type: 'MIN_UNITS', value: 3, label: 'lambda r: r.Cantidad >= 3' });
    }
  };

  const handleRunFlink = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runApacheFlink(dataset, filterConfig);
      setExecutionResult(res);
      setIsRunning(false);
    }, 300);
  };

  const filterSnippet = filterConfig.type !== 'ALL'
    ? `\n# 2. FilterFunction en DataStream Continuo (Event-by-Event)\n${executionResult.filterFlinkCode || `filtered_stream = stream.filter(...)`}\n\n# 3. Stateful KeyedStream Agrupado por Producto\naggregated_stream = filtered_stream.key_by(lambda row: row.Producto) \\`
    : `\n# 2. Stateful KeyedStream Agrupado por Producto (Sin FilterFunction)\naggregated_stream = stream.key_by(lambda row: row.Producto) \\`;

  const dynamicPyFlinkCode = `# DATASTORE S.A.C. - Stream Processing con Apache Flink (DataStream API)
from pyflink.datastream import StreamExecutionEnvironment
from pyflink.common import Types, WatermarkStrategy
from pyflink.datastream.window import TumblingEventTimeWindows
from pyflink.common.time import Time

env = StreamExecutionEnvironment.get_execution_environment()
env.set_parallelism(4)
env.enable_checkpointing(5000)  # Checkpoint cada 5000 ms (${executionResult.checkpointsCompleted || 0} Checkpoints, Exactly-Once)

# 1. Ingesta por flujo continuo (${executionResult.totalInputRecords || dataset?.length || 0} eventos)
stream = env.from_collection(collection=ventas_stream, type_info=Types.ROW(...)) \\
    .assign_timestamps_and_watermarks(WatermarkStrategy.for_monotonous_timestamps())
${filterSnippet}
    .window(TumblingEventTimeWindows.of(Time.days(1))) \\
    .reduce(lambda acc, curr: (acc.Producto, acc.Cantidad + curr.Cantidad, acc.Total_Venta + curr.Total_Venta))

# Emisión continua a Sink (${executionResult.filteredRecords || 0} eventos emitidos)
aggregated_stream.print()
env.execute("DatastoreStreamJob")`;

  return (
    <div className="space-y-6">
      
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Módulo D: Apache Flink (Stream Processing / Event-Driven)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Procesamiento orientado a flujos en tiempo real registro a registro (True Streaming) con estado gestionado (*Managed State*) y checkpointing.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1.5 border border-slate-700 transition-all"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{showCode ? 'Ocultar PyFlink' : 'Ver Código PyFlink'}</span>
          </button>

          <button
            onClick={handleRunFlink}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Procesando Flujo Flink...' : 'Re-ejecutar Stream Flink'}</span>
          </button>
        </div>
      </div>

      {/* BARRA DE FILTRADO PERSONALIZADO APACHE FLINK DATASTREAM */}
      <div className="glass-panel p-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/30 via-slate-900 to-slate-900 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
              Filtro Personalizado en Flujo Continuo (FilterFunction / Event Filter)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Eventos en Estado: <strong className="text-emerald-400">{formatNumber(executionResult.filteredRecords || 0)}</strong> de {formatNumber(executionResult.totalInputRecords || 0)} ({formatNumber(executionResult.prunedRecords || 0)} descartados en Stream)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
          
          {/* Selector de Método de Filtro Flink */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Operador FilterFunction
            </label>
            <select
              value={filterConfig.type}
              onChange={(e) => handleFilterTypeChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="ALL">Sin Filtro (DataStream Completo)</option>
              <option value="CITY">stream.filter(lambda r: r.Ciudad == val)</option>
              <option value="CATEGORY">stream.filter(lambda r: r.Categoría == val)</option>
              <option value="MIN_AMOUNT">stream.filter(lambda r: r.Total_Venta &gt;= val)</option>
              <option value="MIN_UNITS">stream.filter(lambda r: r.Cantidad &gt;= val)</option>
            </select>
          </div>

          {/* Selector Dinámico de Valor */}
          {filterConfig.type === 'CITY' && (
            <div>
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Filtro Ciudad
              </label>
              <select
                value={filterConfig.value}
                onChange={(e) => setFilterConfig({
                  ...filterConfig,
                  value: e.target.value,
                  label: `lambda r: r.Ciudad == "${e.target.value}"`
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/50 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {filterConfig.type === 'CATEGORY' && (
            <div>
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Filtro Categoría
              </label>
              <select
                value={filterConfig.value}
                onChange={(e) => setFilterConfig({
                  ...filterConfig,
                  value: e.target.value,
                  label: `lambda r: r.Categoría == "${e.target.value}"`
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-emerald-500/50 text-xs font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {filterConfig.type === 'MIN_AMOUNT' && (
            <div>
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Total_Venta &gt;= S/ {formatNumber(filterConfig.value)}
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
                    label: `lambda r: r.Total_Venta >= ${e.target.value}`
                  })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {filterConfig.type === 'MIN_UNITS' && (
            <div>
              <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                Cantidad &gt;= {filterConfig.value} u.
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
                    label: `lambda r: r.Cantidad >= ${e.target.value}`
                  })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Tag de Estado del Filtro Activo */}
          <div className="flex items-center space-x-2 pb-1">
            <span className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold block truncate w-full">
              Función Activa: <strong>{filterConfig.label}</strong>
            </span>
          </div>

        </div>
      </div>

      {/* Tarjetas de Rendimiento Flink */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 block mb-1">Latencia de Procesamiento</span>
          <span className="text-lg font-bold text-emerald-400 font-mono flex items-center space-x-1.5">
            <Clock className="w-4 h-4" />
            <span>{executionResult.latencyFormatted}</span>
          </span>
          <span className="text-[10px] text-cyan-400 mt-0.5 block">⚡ Latencia mínima (Micro-pipelining)</span>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 block mb-1">Modelo de Procesamiento</span>
          <span className="text-lg font-bold text-white font-mono flex items-center space-x-1.5">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Event-Driven</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Registro a registro continuo</span>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 block mb-1">Checkpoints Completados</span>
          <span className="text-lg font-bold text-cyan-400 font-mono flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>{executionResult.checkpointsCompleted} Checkpoints</span>
          </span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">Semántica Exactly-Once</span>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 block mb-1">Huella de Memoria</span>
          <span className="text-lg font-bold text-purple-400 font-mono">
            {executionResult.memoryUsedMB} MB
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Managed State optimizado</span>
        </div>
      </div>

      {/* Código PyFlink si está activo */}
      {showCode && (
        <div className="glass-panel rounded-2xl p-4 border border-emerald-500/30 bg-slate-950 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-bold mb-2">
            <span>Pipeline PyFlink DataStream (Event-Driven Streaming)</span>
            <span className="text-[10px] text-slate-500 font-mono">Flink 1.17.1</span>
          </div>
          <pre className="text-xs font-mono text-emerald-400 p-3 bg-slate-900 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
            {dynamicPyFlinkCode}
          </pre>
        </div>
      )}

      {/* Flujo del Stream Pipeline Flink */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Topología DataStream de Apache Flink (Estado Gestionado)</span>
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold">Tumbling Event Time Window</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {executionResult.streamPipeline.map((step, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all">
              <span className="text-[11px] font-bold text-emerald-400 block mb-1">{step.step}</span>
              <p className="text-[10px] text-slate-300 font-mono leading-tight">{step.detail}</p>
            </div>
          ))}
        </div>

        {/* Tabla de Resultados Generados por Flink */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950 mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
              <tr>
                <th className="py-2.5 px-3">Producto (KeyedStream Key)</th>
                <th className="py-2.5 px-3 text-right">Eventos Ingeridos</th>
                <th className="py-2.5 px-3 text-right">Total Unidades (Stream)</th>
                <th className="py-2.5 px-3 text-right">Total Facturación (S/)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {Object.values(executionResult.reduceOutput).map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-white font-sans font-semibold">{r.producto}</td>
                  <td className="py-2 px-3 text-right text-slate-400">{formatNumber(r.transacciones)}</td>
                  <td className="py-2 px-3 text-right text-emerald-400">{formatNumber(r.totalUnidades)} u.</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">{formatCurrency(r.totalVentas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Terminal de Logs de Flink MiniCluster */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 bg-slate-950 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="flex items-center space-x-1.5 font-bold text-slate-300">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Consola de Ejecución Flink TaskManager / MiniCluster</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">JobStatus: FINISHED (Zero Data Loss)</span>
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
