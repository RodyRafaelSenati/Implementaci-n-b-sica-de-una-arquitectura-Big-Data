import React from 'react';
import { 
  Filter, 
  Calendar, 
  MapPin, 
  Tag, 
  Search, 
  RotateCcw, 
  CalendarRange,
  XCircle,
  SlidersHorizontal
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatDateInput } from '../../utils/formatters';

export const GlobalFiltersBar = () => {
  const { 
    filters, 
    updateFilter, 
    resetFilters, 
    availableCities, 
    availableCategories,
    dateBounds 
  } = useData();

  // Contar cuántos filtros activos no-default hay
  const activeFiltersCount = [
    filters.selectedCity !== 'ALL',
    filters.selectedCategory !== 'ALL',
    filters.searchTerm.trim() !== '',
    filters.startDate !== (dateBounds.min ? formatDateInput(dateBounds.min) : '') ||
    filters.endDate !== (dateBounds.max ? formatDateInput(dateBounds.max) : '')
  ].filter(Boolean).length;

  // Manejo de presets de fechas rápidas para el año 2026
  const setQuickPreset = (preset) => {
    const year = dateBounds.min ? dateBounds.min.getFullYear() : 2026;
    switch (preset) {
      case 'FULL':
        if (dateBounds.min && dateBounds.max) {
          updateFilter('startDate', formatDateInput(dateBounds.min));
          updateFilter('endDate', formatDateInput(dateBounds.max));
        }
        break;
      case 'Q1':
        updateFilter('startDate', `${year}-01-01`);
        updateFilter('endDate', `${year}-03-31`);
        break;
      case 'Q2':
        updateFilter('startDate', `${year}-04-01`);
        updateFilter('endDate', `${year}-06-30`);
        break;
      case 'Q3':
        updateFilter('startDate', `${year}-07-01`);
        updateFilter('endDate', `${year}-09-30`);
        break;
      case 'Q4':
        updateFilter('startDate', `${year}-10-01`);
        updateFilter('endDate', `${year}-12-31`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-5 mb-6 border border-slate-700/50 dark:border-slate-800/80 bg-slate-900/70 dark:bg-slate-900/60 shadow-lg no-print">
      
      {/* Barra superior de controles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        
        {/* Título de Filtros */}
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white tracking-wide">
                Filtros Globales Reactivos
              </span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500 text-white shadow-sm">
                  {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Segmenta KPIs, gráficos y análisis estratégico en tiempo real
            </p>
          </div>
        </div>

        {/* Presets Rápidos de Tiempo */}
        <div className="flex items-center flex-wrap gap-1.5 text-xs">
          <span className="text-slate-400 font-medium mr-1 text-[11px]">Periodo:</span>
          
          <button
            onClick={() => setQuickPreset('FULL')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Todo el Año
          </button>
          <button
            onClick={() => setQuickPreset('Q1')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Q1 (Ene-Mar)
          </button>
          <button
            onClick={() => setQuickPreset('Q2')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Q2 (Abr-Jun)
          </button>
          <button
            onClick={() => setQuickPreset('Q3')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Q3 (Jul-Set)
          </button>
          <button
            onClick={() => setQuickPreset('Q4')}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Q4 (Oct-Dic)
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="ml-2 flex items-center space-x-1 px-3 py-1 rounded-md text-[11px] font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Inputs y Selectores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 pt-4">
        
        {/* Rango de Fechas - Desde */}
        <div className="lg:col-span-3">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Fecha Desde
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <Calendar className="w-4 h-4 text-indigo-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Rango de Fechas - Hasta */}
        <div className="lg:col-span-3">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Fecha Hasta
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <Calendar className="w-4 h-4 text-indigo-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Sede / Ciudad */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Sede / Ciudad
          </label>
          <div className="relative">
            <select
              value={filters.selectedCity}
              onChange={(e) => updateFilter('selectedCity', e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-all cursor-pointer"
            >
              <option value="ALL">Todas las Sedes</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5 pointer-events-none" />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Categoría */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Categoría
          </label>
          <div className="relative">
            <select
              value={filters.selectedCategory}
              onChange={(e) => updateFilter('selectedCategory', e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none transition-all cursor-pointer"
            >
              <option value="ALL">Todas las Categorías</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Tag className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5 pointer-events-none" />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Buscador de Producto / Término */}
        <div className="lg:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Buscar Producto
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ej: Laptop, Router..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500"
            />
            <Search className="w-4 h-4 text-amber-400 absolute left-3 top-2.5 pointer-events-none" />
            {filters.searchTerm && (
              <button
                onClick={() => updateFilter('searchTerm', '')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
