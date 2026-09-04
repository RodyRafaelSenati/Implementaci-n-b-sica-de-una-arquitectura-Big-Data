import React, { useState, useRef } from 'react';
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
  Eye,
  Check,
  RotateCcw,
  Play
} from 'lucide-react';
import PapaParse from 'papaparse';
import { cleanAndValidateDataset } from '../../utils/bigDataEngines';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const ModuleIngestionClean = ({ 
  currentDataset, 
  onProcessDataset, 
  onDatasetCleaned,
  onResetDefaultDataset,
  isProcessing 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawParsedRows, setRawParsedRows] = useState([]);
  const [rawPreview, setRawPreview] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [cleanPreviewRows, setCleanPreviewRows] = useState([]);
  const fileInputRef = useRef(null);

  const [stats, setStats] = useState({
    original: currentDataset ? currentDataset.length + 79 : 20000,
    removed: 79,
    cleaned: currentDataset ? currentDataset.length : 19921,
    status: 'Dataset Activo'
  });

  const notifyDatasetUpdated = (cleanRows, fileName) => {
    if (typeof onProcessDataset === 'function') {
      onProcessDataset(cleanRows, fileName);
    }
    if (typeof onDatasetCleaned === 'function') {
      onDatasetCleaned(cleanRows, fileName);
    }
  };

  // Leer archivo cuando el usuario lo selecciona
  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    setUploadedFileName(file.name);

    PapaParse.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      dynamicTyping: false,
      delimitersToGuess: [',', ';', '\t', '|'],
      complete: (results) => {
        const rawData = results.data || [];
        setRawParsedRows(rawData);
        setRawPreview(rawData.slice(0, 5));
        
        // Precalcular limpieza preliminar
        const cleanResult = cleanAndValidateDataset(rawData);
        setCleanPreviewRows(cleanResult.cleanRows.slice(0, 5));
        setStats({
          original: cleanResult.initialCount,
          removed: cleanResult.removedCount,
          cleaned: cleanResult.cleanCount,
          status: `Listo para procesar: ${file.name}`
        });

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        console.error('Error al parsear CSV:', error);
      }
    });
  };

  // Botón EXPLÍCITO de Procesar el Archivo CSV
  const handleExecuteProcess = () => {
    if (!rawParsedRows || rawParsedRows.length === 0) {
      // Si no hay nuevo archivo seleccionado en memoria, re-procesar el dataset actual
      if (currentDataset && currentDataset.length > 0) {
        notifyDatasetUpdated(currentDataset, uploadedFileName || 'ventas.csv');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 4000);
      }
      return;
    }

    const cleanResult = cleanAndValidateDataset(rawParsedRows);
    setStats({
      original: cleanResult.initialCount,
      removed: cleanResult.removedCount,
      cleaned: cleanResult.cleanCount,
      status: `Procesado: ${uploadedFileName}`
    });

    if (cleanResult.cleanRows.length > 0) {
      notifyDatasetUpdated(cleanResult.cleanRows, uploadedFileName);
    }

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
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
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  // Descarga del CSV limpio
  const handleDownloadCleanCSV = () => {
    const datasetToDownload = currentDataset || [];
    if (datasetToDownload.length === 0) return;

    const headers = ['Fecha', 'Producto', 'Categoría', 'Cantidad', 'Precio', 'Ciudad', 'Total_Venta'];
    const rows = datasetToDownload.map(r => [
      r.Fecha || r.fecha,
      `"${r.Producto || r.producto}"`,
      `"${r.Categoría || r.categoria}"`,
      r.Cantidad || r.cantidad,
      (Number(r.Precio || r.precio) || 0).toFixed(2),
      `"${r.Ciudad || r.ciudad}"`,
      (Number(r.Total_Venta || r.totalVenta) || 0).toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ventas_clean_${uploadedFileName || 'dataset'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast de éxito al procesar nuevo archivo */}
      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-xs flex items-center justify-between shadow-2xl animate-fade-in">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <span className="font-extrabold text-sm block">¡Archivo "{uploadedFileName || 'ventas.csv'}" procesado con éxito!</span>
              <p className="text-[11px] text-emerald-300 mt-0.5">
                Los 3 motores (Hadoop MapReduce, Apache Spark y Apache Flink) y la Matriz de Benchmark se han actualizado con los {formatNumber(stats.cleaned)} registros de este archivo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Encabezado del Módulo con Botón de Descarga */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Módulo A: Ingesta, Limpieza y Procesamiento</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Sube tu archivo <code>.csv</code> y presiona el botón <strong>"Procesar Archivo CSV"</strong> para alimentar a los motores distribuidos.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {onResetDefaultDataset && (
            <button
              onClick={onResetDefaultDataset}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-xs flex items-center space-x-1.5 border border-slate-700 transition-all"
              title="Restablecer al dataset original de 19,921 registros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer Dataset</span>
            </button>
          )}

          <button
            onClick={handleDownloadCleanCSV}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Descargar ventas_clean.csv</span>
          </button>
        </div>
      </div>

      {/* Grid de Dropzone, Botón de Procesar y Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dropzone + Botón Procesar */}
        <div className="lg:col-span-2 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-7 text-center transition-all flex flex-col items-center justify-center relative overflow-hidden bg-slate-900/60 ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/40 scale-[1.01]'
                : rawParsedRows.length > 0 
                ? 'border-emerald-500/80 bg-emerald-950/20' 
                : 'border-slate-700/80 hover:border-cyan-500/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel"
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              title="Arrastra o selecciona un archivo CSV"
            />

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 transition-transform ${
              rawParsedRows.length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
            }`}>
              {rawParsedRows.length > 0 ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <UploadCloud className="w-6 h-6" />}
            </div>

            <h4 className="text-sm font-bold text-white mb-1">
              {uploadedFileName ? `Archivo Seleccionado: "${uploadedFileName}"` : 'Arrastra y suelta tu archivo CSV aquí'}
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              {rawParsedRows.length > 0 
                ? `✓ ${formatNumber(rawParsedRows.length)} filas cargadas en memoria. Presiona el botón de procesar abajo.` 
                : 'o haz clic para buscar en tu computadora (autodetecta delimitador , o ;)'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dataset en Motores: <strong className="text-emerald-400">{formatNumber(currentDataset.length)} registros</strong></span>
            </div>
          </div>

          {/* BOTÓN PROMINENTE DE PROCESAR */}
          <button
            onClick={handleExecuteProcess}
            disabled={isProcessing}
            className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2.5 transition-all shadow-xl ${
              rawParsedRows.length > 0 
                ? 'bg-gradient-to-r from-emerald-600 via-cyan-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-emerald-500/30 scale-[1.01] animate-pulse ring-2 ring-emerald-400/50' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            } disabled:opacity-50`}
          >
            <Play className={`w-5 h-5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>
              {isProcessing 
                ? 'Procesando y Ejecutando Motores...' 
                : rawParsedRows.length > 0
                ? `⚡ PROCESAR "${uploadedFileName}" Y RECALCULAR EN LOS 3 MOTORES`
                : '⚡ PROCESAR DATASET ACTUAL EN LOS 3 MOTORES (HADOOP, SPARK, FLINK)'}
            </span>
          </button>
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
            <p className="text-[10px] text-slate-400 mt-1">Dataset cargado para procesar</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Filas Eliminadas (Duplicados / Nulos)</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-extrabold text-amber-400 font-mono">
              {formatNumber(stats.removed)}
            </div>
            <p className="text-[10px] text-amber-300/80 mt-1">Filas inconsistentes removidas</p>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
            <div className="flex items-center justify-between text-xs text-emerald-300 mb-1">
              <span>Filas Limpias Procesadas</span>
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
            <span>Previsualización de Muestra (Primeras 5 filas procesadas)</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">Total Venta = Cantidad * Precio</span>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Producto</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3 text-right">Cantidad</th>
                <th className="py-2.5 px-3 text-right">Precio (S/)</th>
                <th className="py-2.5 px-3">Ciudad</th>
                <th className="py-2.5 px-3 text-right">Total Venta (S/)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {(cleanPreviewRows.length > 0 ? cleanPreviewRows : (currentDataset.slice(0, 5) || [])).map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-3 text-cyan-300">{row.Fecha || row.fecha}</td>
                  <td className="py-2 px-3 text-white font-sans font-semibold">{row.Producto || row.producto}</td>
                  <td className="py-2 px-3 text-slate-300 font-sans">{row.Categoría || row.categoria}</td>
                  <td className="py-2 px-3 text-right text-slate-200">{formatNumber(row.Cantidad || row.cantidad)}</td>
                  <td className="py-2 px-3 text-right text-slate-200">{(Number(row.Precio || row.precio) || 0).toFixed(2)}</td>
                  <td className="py-2 px-3 text-indigo-300 font-sans">{row.Ciudad || row.ciudad}</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-400">
                    {formatCurrency(Number(row.Total_Venta || row.totalVenta) || (Number(row.Cantidad || row.cantidad) * Number(row.Precio || row.precio)))}
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
