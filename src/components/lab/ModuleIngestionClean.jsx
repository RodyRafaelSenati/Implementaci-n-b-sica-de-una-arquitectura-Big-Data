import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Sparkles, 
  Layers, 
  FileText, 
  ArrowRight,
  RefreshCw,
  Eye
} from 'lucide-react';
import PapaParse from 'papaparse';
import { cleanAndValidateDataset } from '../../utils/bigDataEngines';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const ModuleIngestionClean = ({ currentDataset, onDatasetCleaned }) => {
  const [rawPreview, setRawPreview] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({
    original: 20000,
    removed: 79,
    cleaned: 19921,
    status: 'Cleaned'
  });

  // Procesar archivo cargado por el usuario
  const handleFileProcess = (file) => {
    if (!file) return;
    setIsProcessing(true);

    PapaParse.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data;
        setRawPreview(rawData.slice(0, 5));

        const cleanResult = cleanAndValidateDataset(rawData);
        setStats({
          original: cleanResult.initialCount,
          removed: cleanResult.removedCount,
          cleaned: cleanResult.cleanCount,
          status: 'Processed'
        });

        if (onDatasetCleaned) {
          onDatasetCleaned(cleanResult.cleanRows);
        }
        setIsProcessing(false);
      },
      error: (error) => {
        console.error('Error al parsear CSV:', error);
        setIsProcessing(false);
      }
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  // Descarga del CSV limpio
  const handleDownloadCleanCSV = () => {
    if (!currentDataset || currentDataset.length === 0) return;

    const headers = ['Fecha', 'Producto', 'Categoría', 'Cantidad', 'Precio', 'Ciudad', 'Total_Venta'];
    const rows = currentDataset.map(r => [
      r.Fecha,
      `"${r.Producto}"`,
      `"${r.Categoría}"`,
      r.Cantidad,
      r.Precio.toFixed(2),
      `"${r.Ciudad}"`,
      r.Total_Venta.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ventas_clean.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Módulo A: Ingesta, Limpieza Automática y Descarga</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sube el archivo <code>ventas.csv</code> crudo para ejecutar la limpieza, normalización y cálculo de <code>Total_Venta</code>.
          </p>
        </div>

        <button
          onClick={handleDownloadCleanCSV}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Descargar ventas_clean.csv</span>
        </button>
      </div>

      {/* Grid de Dropzone y Tarjetas de Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dropzone para Subir CSV */}
        <div className="lg:col-span-2">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition-all flex flex-col items-center justify-center relative overflow-hidden bg-slate-900/60 ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
                : 'border-slate-700/80 hover:border-slate-600'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              title="Arrastra o selecciona ventas.csv"
            />

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-3">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h4 className="text-sm font-bold text-white mb-1">
              Arrastra y suelta tu archivo <code>ventas.csv</code> aquí
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              o haz clic para explorar desde tu equipo (soporta delimitador por coma o punto y coma)
            </p>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dataset Activo: <strong>{formatNumber(currentDataset.length)} registros limpios</strong></span>
            </div>
          </div>
        </div>

        {/* Métricas de Calidad de Datos */}
        <div className="space-y-3">
          
          <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Filas Originales (Crudo)</span>
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-extrabold text-white font-mono">
              {formatNumber(stats.original)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Dataset de ventas importado</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Filas Eliminadas (Duplicados / Corruptos)</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-extrabold text-amber-400 font-mono">
              {formatNumber(stats.removed)}
            </div>
            <p className="text-[10px] text-amber-300/80 mt-1">0.40% de registros inconsistentes</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
              <span>Filas Limpias Listas para Procesamiento</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono">
              {formatNumber(stats.cleaned)}
            </div>
            <p className="text-[10px] text-emerald-300/80 mt-1">100% validadas con fechas ISO</p>
          </div>

        </div>

      </div>

      {/* Previsualización de Muestra (Primeras 5 Filas) */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 bg-slate-900/80">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-slate-200 flex items-center space-x-1.5">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>Previsualización del Dataset Normalizado (Primeras 5 filas)</span>
          </span>
          <span className="text-[11px] text-slate-400">Total Venta = Cantidad * Precio</span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Fecha (ISO)</th>
                <th className="py-2.5 px-3">Producto</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3 text-right">Cantidad</th>
                <th className="py-2.5 px-3 text-right">Precio (S/)</th>
                <th className="py-2.5 px-3">Ciudad</th>
                <th className="py-2.5 px-3 text-right">Total Venta (S/)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {(currentDataset.slice(0, 5) || []).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-3 text-cyan-300">{row.Fecha}</td>
                  <td className="py-2 px-3 text-white font-sans font-semibold">{row.Producto}</td>
                  <td className="py-2 px-3 text-slate-300 font-sans">{row.Categoría}</td>
                  <td className="py-2 px-3 text-right text-slate-200">{formatNumber(row.Cantidad)}</td>
                  <td className="py-2 px-3 text-right text-slate-200">{row.Precio.toFixed(2)}</td>
                  <td className="py-2 px-3 text-indigo-300 font-sans">{row.Ciudad}</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">
                    {formatCurrency(row.Total_Venta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
