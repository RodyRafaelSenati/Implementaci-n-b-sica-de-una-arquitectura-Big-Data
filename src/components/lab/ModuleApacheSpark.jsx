import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Cpu, 
  Layers, 
  Clock, 
  HardDrive, 
  Play, 
  Terminal, 
  ArrowRight, 
  CheckCircle2, 
  Code2, 
  Flame 
} from 'lucide-react';
import { runApacheSpark } from '../../utils/bigDataEngines';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const ModuleApacheSpark = ({ dataset }) => {
  const [filterConfig, setFilterConfig] = useState({ type: 'ALL', value: '', label: 'Sin Filtro' });
  const [executionResult, setExecutionResult] = useState(() => runApacheSpark(dataset, { type: 'ALL', label: 'Sin Filtro' }));
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
      setExecutionResult(runApacheSpark(dataset, filterConfig));
    }
  }, [dataset, filterConfig]);

  const handleFilterTypeChange = (type) => {
    if (type === 'ALL') {
      setFilterConfig({ type: 'ALL', value: '', label: 'Sin Filtro (DataFrame completo)' });
    } else if (type === 'CITY') {
      const defaultCity = cities[0] || 'Lima';
      setFilterConfig({ type: 'CITY', value: defaultCity, label: `col("Ciudad") == "${defaultCity}"` });
    } else if (type === 'CATEGORY') {
      const defaultCat = categories[0] || 'Laptops';
      setFilterConfig({ type: 'CATEGORY', value: defaultCat, label: `col("Categoría") == "${defaultCat}"` });
    } else if (type === 'MIN_AMOUNT') {
      setFilterConfig({ type: 'MIN_AMOUNT', value: 800, label: 'col("Total_Venta") >= 800' });
    } else if (type === 'MIN_UNITS') {
      setFilterConfig({ type: 'MIN_UNITS', value: 3, label: 'col("Cantidad") >= 3' });
    }
  };

  const handleRunSpark = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runApacheSpark(dataset, filterConfig);
      setExecutionResult(res);
      setIsRunning(false);
    }, 400);
  };

  const filterSnippet = filterConfig.type !== 'ALL'
    ? `\n# 2. Predicate Pushdown / Catalyst Optimizer Filter\ndf_filtered = ${executionResult.filterPyCode || `df.filter(...)`}\n\n# 3. Transformación In-Memory y Agregación DAG\nresult_df = df_filtered.groupBy("Producto") \\`
    : `\n# 2. Transformación In-Memory y Agregación DAG (Sin filtro)\nresult_df = df.groupBy("Producto") \\`;

  const dynamicPySparkCode = `# DATASTORE S.A.C. - Agregación de Ventas en PySpark
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, sum as _sum

spark = SparkSession.builder \\
    .appName("DatastoreProductAggregationApp") \\
    .master("local[4]") \\
    .getOrCreate()

# 1. Carga de dataset en DataFrame (${executionResult.totalInputRecords || dataset?.length || 0} registros)
df = spark.read.csv("hdfs:///datastore/processed/ventas_clean.csv", header=True, inferSchema=True)
${filterSnippet}
    .agg(
        _sum("Cantidad").alias("Total_Unidades"),
        _sum("Total_Venta").alias("Total_Facturacion_PEN")
    ) \\
    .orderBy(col("Total_Facturacion_PEN").desc())

# Acción collect() a memoria RAM del Driver (${executionResult.filteredRecords || 0} filas procesadas)
result_df.show()`;

  return (
    <div className="space-y-6">
      
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Módulo C: Apache Spark (Procesamiento en Memoria / RDD & DataFrames)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ejecución mediante grafos dirigidos acíclicos (DAG) calculados 100% en memoria RAM sin persistencia intermedia en disco.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center space-x-1.5 border border-slate-700 transition-all"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showCode ? 'Ocultar PySpark' : 'Ver Código PySpark'}</span>
          </button>

          <button
            onClick={handleRunSpark}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Ejecutando DAG Spark...' : 'Re-ejecutar Job Spark'}</span>
          </button>
        </div>
      </div>

      {/* BARRA DE FILTRADO PERSONALIZADO SPARK SQL / DATAFRAME API */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-slate-900 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-black text-cyan-300 uppercase tracking-wider">
              Filtro Declarativo Spark SQL / DataFrame API (Predicate Pushdown)
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Filas Evaluadas en RAM: <strong className="text-cyan-400">{formatNumber(executionResult.filteredRecords || 0)}</strong> de {formatNumber(executionResult.totalInputRecords || 0)} ({formatNumber(executionResult.prunedRecords || 0)} filtradas)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 items-end">
          
          {/* Selector de Método de Filtro Spark */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Método de Filtro DataFrame
            </label>
            <select
              value={filterConfig.type}
              onChange={(e) => handleFilterTypeChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="ALL">Sin Filtro (df.groupBy directo)</option>
              <option value="CITY">df.filter(col("Ciudad") == val)</option>
              <option value="CATEGORY">df.filter(col("Categoría") == val)</option>
              <option value="MIN_AMOUNT">df.filter(col("Total_Venta") &gt;= val)</option>
              <option value="MIN_UNITS">df.filter(col("Cantidad") &gt;= val)</option>
            </select>
          </div>

          {/* Selector Dinámico de Valor */}
          {filterConfig.type === 'CITY' && (
            <div>
              <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                Parámetro col("Ciudad")
              </label>
              <select
                value={filterConfig.value}
                onChange={(e) => setFilterConfig({
                  ...filterConfig,
                  value: e.target.value,
                  label: `col("Ciudad") == "${e.target.value}"`
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/50 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
              >
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {filterConfig.type === 'CATEGORY' && (
            <div>
              <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                Parámetro col("Categoría")
              </label>
              <select
                value={filterConfig.value}
                onChange={(e) => setFilterConfig({
                  ...filterConfig,
                  value: e.target.value,
                  label: `col("Categoría") == "${e.target.value}"`
                })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/50 text-xs font-bold text-cyan-300 focus:outline-none focus:border-cyan-400"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {filterConfig.type === 'MIN_AMOUNT' && (
            <div>
              <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                col("Total_Venta") &gt;= S/ {formatNumber(filterConfig.value)}
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
                    label: `col("Total_Venta") >= ${e.target.value}`
                  })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {filterConfig.type === 'MIN_UNITS' && (
            <div>
              <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                col("Cantidad") &gt;= {filterConfig.value} u.
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
                    label: `col("Cantidad") >= ${e.target.value}`
                  })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Tag de Estado del Filtro Activo */}
          <div className="flex items-center space-x-2 pb-1">
            <span className="px-3 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold block truncate w-full">
              Expresión Activa: <strong>{filterConfig.label}</strong>
            </span>
          </div>

        </div>
      </div>

      {/* Tarjetas de Rendimiento Spark */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 block mb-1">Tiempo de Ejecución</span>
          <span className="text-lg font-bold text-cyan-400 font-mono flex items-center space-x-1.5">
            <Clock className="w-4 h-4" />
            <span>{executionResult.latencyFormatted}</span>
          </span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">⚡ 15.6x más rápido que MapReduce</span>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 block mb-1">Memoria RAM Utilizada</span>
          <span className="text-lg font-bold text-white font-mono flex items-center space-x-1.5">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>{executionResult.memoryUsedMB} MB RAM</span>
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Almacenamiento en caché RDD</span>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 block mb-1">Particiones RDD</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">
            {executionResult.partitions} particiones
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">Procesamiento paralelo</span>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/80">
          <span className="text-[11px] text-slate-400 block mb-1">Spill a Disco HDFS</span>
          <span className="text-lg font-bold text-emerald-400 font-mono">
            0.0 MB (Zero Spill)
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5 block">100% In-Memory Pipeline</span>
        </div>
      </div>

      {/* Código PySpark si está activo */}
      {showCode && (
        <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 bg-slate-950 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-cyan-300 font-bold mb-2">
            <span>Pipeline PySpark Declarativo (DataFrame API)</span>
            <span className="text-[10px] text-slate-500 font-mono">Spark 3.4.1</span>
          </div>
          <pre className="text-xs font-mono text-cyan-400 p-3 bg-slate-900 rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
            {dynamicPySparkCode}
          </pre>
        </div>
      )}

      {/* Diagrama del Grafo Dirigido Acíclico (DAG) */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/80 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Flame className="w-4 h-4 text-cyan-400" />
            <span>Topología DAG (Direct Acyclic Graph) de Apache Spark</span>
          </span>
          <span className="text-[11px] text-slate-400">Pipeline Lazy Evaluation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {executionResult.dagStages.map((stage, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 relative group hover:border-cyan-500/50 transition-all">
              <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 mb-1">
                <span>{stage.id}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <h5 className="text-xs font-bold text-white mb-1 truncate">{stage.name}</h5>
              <p className="text-[10px] text-slate-400 font-mono truncate">{stage.transformation}</p>
            </div>
          ))}
        </div>

        {/* Tabla de Resultados Generados por Spark */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950 mt-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
              <tr>
                <th className="py-2.5 px-3">Producto (RDD Key)</th>
                <th className="py-2.5 px-3 text-right">Transacciones Procesadas</th>
                <th className="py-2.5 px-3 text-right">Total Unidades (RAM)</th>
                <th className="py-2.5 px-3 text-right">Total Facturación (S/)</th>
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

      {/* Terminal de Logs de Spark DAGScheduler */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 bg-slate-950 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2">
          <span className="flex items-center space-x-1.5 font-bold text-slate-300">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Consola de Ejecución Spark DAGScheduler / Driver</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">Status: COMPLETED (4 Partitions)</span>
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
