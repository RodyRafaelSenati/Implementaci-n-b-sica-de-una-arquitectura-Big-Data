import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const DataTableModal = ({ onClose }) => {
  const { filteredDataset } = useData();

  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Filtrado interno en tabla
  const searchedData = useMemo(() => {
    if (!filteredDataset) return [];
    if (!tableSearch.trim()) return filteredDataset;
    const query = tableSearch.toLowerCase().trim();
    return filteredDataset.filter(r => 
      r.producto.toLowerCase().includes(query) ||
      r.ciudad.toLowerCase().includes(query) ||
      r.categoria.toLowerCase().includes(query) ||
      r.fechaRaw.includes(query)
    );
  }, [filteredDataset, tableSearch]);

  // Ordenamiento
  const sortedData = useMemo(() => {
    const list = [...searchedData];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'fechaRaw') {
        valA = a.fechaTimestamp;
        valB = b.fechaTimestamp;
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      }

      return sortDirection === 'asc' ? valA - valB : valB - valA;
    });
    return list;
  }, [searchedData, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Fecha', 'Producto', 'Categoría', 'Cantidad', 'Precio_PEN', 'Ciudad', 'Total_Venta_PEN'];
    const rows = sortedData.map(r => [
      r.id,
      r.fechaRaw,
      `"${r.producto}"`,
      `"${r.categoria}"`,
      r.cantidad,
      r.precio.toFixed(2),
      `"${r.ciudad}"`,
      r.totalVenta.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `datastore_ventas_filtradas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 opacity-60 group-hover:opacity-100" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-indigo-400 font-bold" />
      : <ArrowDown className="w-3.5 h-3.5 text-indigo-400 font-bold" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in no-print">
      <div className="w-full max-w-6xl max-h-[92vh] glass-panel rounded-2xl p-4 sm:p-6 relative shadow-2xl border border-slate-700/60 bg-slate-900/95 text-slate-100 flex flex-col justify-between">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center space-x-2">
                <span>Explorador de Registros y Transacciones</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800 text-emerald-400 border border-slate-700">
                  {formatNumber(sortedData.length)} registros
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Auditoría fila por fila con ordenamiento dinámico y exportación a CSV
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Filtros y Controles de la Tabla */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Buscar por producto, ciudad, categoría..."
              value={tableSearch}
              onChange={(e) => {
                setTableSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2 pointer-events-none" />
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400">Filas:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 text-xs focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Tabla con Scroll Vertical */}
        <div className="flex-1 overflow-auto border border-slate-800 rounded-xl bg-slate-950/50 min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-900 z-10 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th onClick={() => handleSort('id')} className="py-2.5 px-3 cursor-pointer hover:text-white group">
                  <div className="flex items-center space-x-1">
                    <span>#</span>
                    {renderSortIcon('id')}
                  </div>
                </th>
                <th onClick={() => handleSort('fechaRaw')} className="py-2.5 px-3 cursor-pointer hover:text-white group">
                  <div className="flex items-center space-x-1">
                    <span>Fecha</span>
                    {renderSortIcon('fechaRaw')}
                  </div>
                </th>
                <th onClick={() => handleSort('producto')} className="py-2.5 px-3 cursor-pointer hover:text-white group">
                  <div className="flex items-center space-x-1">
                    <span>Producto</span>
                    {renderSortIcon('producto')}
                  </div>
                </th>
                <th onClick={() => handleSort('categoria')} className="py-2.5 px-3 cursor-pointer hover:text-white group">
                  <div className="flex items-center space-x-1">
                    <span>Categoría</span>
                    {renderSortIcon('categoria')}
                  </div>
                </th>
                <th onClick={() => handleSort('cantidad')} className="py-2.5 px-3 text-right cursor-pointer hover:text-white group">
                  <div className="flex items-center justify-end space-x-1">
                    <span>Cantidad</span>
                    {renderSortIcon('cantidad')}
                  </div>
                </th>
                <th onClick={() => handleSort('precio')} className="py-2.5 px-3 text-right cursor-pointer hover:text-white group">
                  <div className="flex items-center justify-end space-x-1">
                    <span>Precio Unit.</span>
                    {renderSortIcon('precio')}
                  </div>
                </th>
                <th onClick={() => handleSort('ciudad')} className="py-2.5 px-3 cursor-pointer hover:text-white group">
                  <div className="flex items-center space-x-1">
                    <span>Ciudad</span>
                    {renderSortIcon('ciudad')}
                  </div>
                </th>
                <th onClick={() => handleSort('totalVenta')} className="py-2.5 px-3 text-right cursor-pointer hover:text-white group">
                  <div className="flex items-center justify-end space-x-1">
                    <span>Total Venta</span>
                    {renderSortIcon('totalVenta')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{row.id}</td>
                    <td className="py-2 px-3 text-slate-300 font-sans whitespace-nowrap">{row.fechaRaw}</td>
                    <td className="py-2 px-3 text-white font-sans font-medium">{row.producto}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-sans font-semibold bg-slate-800 text-indigo-300 border border-slate-700">
                        {row.categoria}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">{formatNumber(row.cantidad)}</td>
                    <td className="py-2 px-3 text-right text-slate-300">{formatCurrency(row.precio)}</td>
                    <td className="py-2 px-3 font-sans text-cyan-300">{row.ciudad}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-400">
                      {formatCurrency(row.totalVenta)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador Inferior */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 shrink-0 text-xs">
          <span className="text-slate-400">
            Página <strong className="text-white">{currentPage}</strong> de <strong className="text-white">{totalPages}</strong> ({formatNumber(sortedData.length)} resultados)
          </span>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-mono text-slate-300 bg-slate-950 rounded-md border border-slate-800">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
