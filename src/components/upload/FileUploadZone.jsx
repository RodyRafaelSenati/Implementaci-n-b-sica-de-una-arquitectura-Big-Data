import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  RefreshCw, 
  Database,
  Sparkles,
  Layers
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatNumber } from '../../utils/formatters';

export const FileUploadModal = ({ onClose }) => {
  const { 
    handleFileUpload, 
    loadDefaultDataset, 
    uploadStats, 
    loading, 
    error 
  } = useData();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      handleFileUpload(file);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      handleFileUpload(file);
    }
  };

  const handleLoadDefault = () => {
    setSelectedFileName('ventas.csv (Dataset Corporativo Oficial)');
    loadDefaultDataset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in no-print">
      <div className="w-full max-w-xl glass-panel rounded-2xl p-6 sm:p-8 relative shadow-2xl border border-slate-700/60 bg-slate-900/95 text-slate-100">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabecera */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Carga y Validación de Datos (CSV)
            </h3>
            <p className="text-xs text-slate-400">
              DATASTORE S.A.C. Engine • Estructura requerida: Fecha, Producto, Categoría, Cantidad, Precio, Ciudad
            </p>
          </div>
        </div>

        {/* Dropzone interactivo */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-700/80 hover:border-indigo-500/60 bg-slate-950/50 hover:bg-slate-900/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />

          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-indigo-400 shadow-inner">
            <FileText className="w-8 h-8" />
          </div>

          <p className="text-sm font-semibold text-slate-200 mb-1">
            {selectedFileName || 'Arrastra y suelta tu archivo ventas.csv aquí'}
          </p>
          <p className="text-xs text-slate-400 mb-4">
            o haz clic para explorar en tu explorador de archivos
          </p>

          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
            Formatos soportados: .CSV (Codificación UTF-8 / ANSI)
          </span>
        </div>

        {/* Alerta de Error */}
        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold block">Error de Validación:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Resumen de carga exitosa */}
        {uploadStats && !error && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/60 border border-emerald-500/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Archivo procesado con éxito</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {uploadStats.loadTimeMs} ms
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Filas Totales</span>
                <span className="text-sm font-bold text-white font-mono">{formatNumber(uploadStats.totalRows)}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Válidas</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">{formatNumber(uploadStats.validRows)}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Omitidas / Error</span>
                <span className="text-sm font-bold text-slate-400 font-mono">{formatNumber(uploadStats.invalidRows)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/80">
          <button
            onClick={handleLoadDefault}
            disabled={loading}
            className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors py-2 px-3 rounded-lg hover:bg-cyan-500/10"
          >
            <Database className="w-4 h-4" />
            <span>Cargar dataset ventas.csv inicial</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            Aceptar y Ver Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
