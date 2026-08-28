import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Play, 
  RotateCcw, 
  Download, 
  Code2, 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Table as TableIcon, 
  Sparkles, 
  ArrowUpDown, 
  Check, 
  Copy, 
  Layers, 
  DollarSign, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Building2, 
  Tag 
} from 'lucide-react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { useData } from '../../context/DataContext';
import { CHART_COLORS, PALETTE, getBaseTooltipOptions } from '../charts/chartConfig';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

export const AdHocQueryBuilder = () => {
  const { filteredDataset, theme } = useData();
  const isDark = theme === 'dark';

  // Estados del Query Builder
  const [primaryDimension, setPrimaryDimension] = useState('Ciudad'); // 'Ciudad', 'Categoría', 'Producto', 'Mes_Nombre', 'Trimestre'
  const [secondaryDimension, setSecondaryDimension] = useState('NONE'); // 'NONE', 'Categoría', 'Producto', 'Ciudad', 'Trimestre'
  const [selectedMetric, setSelectedMetric] = useState('totalVenta'); // 'totalVenta', 'unidades', 'transacciones', 'ticketPromedio', 'precioPromedio'
  const [minImporte, setMinImporte] = useState('');
  const [minCantidad, setMinCantidad] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [selectedCityFilter, setSelectedCityFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc', 'asc'
  const [topLimit, setTopLimit] = useState(10); // 5, 10, 20, 0 (Todos)
  const [viewType, setViewType] = useState('chart'); // 'chart', 'table', 'mql'
  const [chartType, setChartType] = useState('bar'); // 'bar', 'line', 'doughnut'
  const [copiedMQL, setCopiedMQL] = useState(false);

  // Opciones de Dimensiones y Métricas
  const dimensionOptions = [
    { value: 'Ciudad', label: 'Sede / Ciudad', icon: Building2 },
    { value: 'Categoría', label: 'Categoría de Producto', icon: Tag },
    { value: 'Producto', label: 'Producto (SKU)', icon: Package },
    { value: 'Mes_Nombre', label: 'Mes Calendario', icon: Layers },
    { value: 'Trimestre', label: 'Trimestre (Quarter)', icon: TrendingUp },
  ];

  const metricOptions = [
    { value: 'totalVenta', label: 'Facturación Total (S/)', unit: 'currency', icon: DollarSign },
    { value: 'unidades', label: 'Unidades Vendidas', unit: 'number', icon: Package },
    { value: 'transacciones', label: 'Cantidad de Transacciones', unit: 'number', icon: ShoppingBag },
    { value: 'ticketPromedio', label: 'Ticket Promedio (S/)', unit: 'currency', icon: TrendingUp },
    { value: 'precioPromedio', label: 'Precio Promedio Unitario (S/)', unit: 'currency', icon: DollarSign },
  ];

  // Presets Rápidos de Consultas de Negocio
  const applyPreset = (presetKey) => {
    switch (presetKey) {
      case 'high-end':
        setPrimaryDimension('Producto');
        setSecondaryDimension('Ciudad');
        setSelectedMetric('totalVenta');
        setMinImporte('5000');
        setSelectedCategoryFilter('Computadoras');
        setSelectedCityFilter('ALL');
        setMinCantidad('');
        setTopLimit(10);
        setChartType('bar');
        break;
      case 'seasonality':
        setPrimaryDimension('Mes_Nombre');
        setSecondaryDimension('NONE');
        setSelectedMetric('totalVenta');
        setMinImporte('');
        setMinCantidad('');
        setSelectedCategoryFilter('ALL');
        setSelectedCityFilter('ALL');
        setTopLimit(0);
        setChartType('line');
        break;
      case 'city-ticket':
        setPrimaryDimension('Ciudad');
        setSecondaryDimension('NONE');
        setSelectedMetric('ticketPromedio');
        setMinImporte('');
        setMinCantidad('');
        setSelectedCategoryFilter('ALL');
        setSelectedCityFilter('ALL');
        setTopLimit(10);
        setChartType('bar');
        break;
      case 'product-rotation':
        setPrimaryDimension('Producto');
        setSecondaryDimension('Categoría');
        setSelectedMetric('unidades');
        setMinImporte('');
        setMinCantidad('');
        setSelectedCategoryFilter('ALL');
        setSelectedCityFilter('ALL');
        setTopLimit(10);
        setChartType('bar');
        break;
      case 'category-share':
        setPrimaryDimension('Categoría');
        setSecondaryDimension('NONE');
        setSelectedMetric('totalVenta');
        setMinImporte('');
        setMinCantidad('');
        setSelectedCategoryFilter('ALL');
        setSelectedCityFilter('ALL');
        setTopLimit(0);
        setChartType('doughnut');
        break;
      default:
        break;
    }
  };

  const resetQueryBuilder = () => {
    setPrimaryDimension('Ciudad');
    setSecondaryDimension('NONE');
    setSelectedMetric('totalVenta');
    setMinImporte('');
    setMinCantidad('');
    setSelectedCategoryFilter('ALL');
    setSelectedCityFilter('ALL');
    setSortOrder('desc');
    setTopLimit(10);
    setChartType('bar');
  };

  // Categorías y Sedes disponibles
  const availableCategories = useMemo(() => {
    return Array.from(new Set(filteredDataset.map(r => r.categoria))).filter(Boolean).sort();
  }, [filteredDataset]);

  const availableCities = useMemo(() => {
    return Array.from(new Set(filteredDataset.map(r => r.ciudad))).filter(Boolean).sort();
  }, [filteredDataset]);

  // Procesamiento y Agregación Dinámica de la Consulta Ad-Hoc
  const aggregatedResults = useMemo(() => {
    if (!filteredDataset || filteredDataset.length === 0) return [];

    const minImp = parseFloat(minImporte) || 0;
    const minCant = parseInt(minCantidad, 10) || 0;

    // 1. Filtrado de filas según condiciones del Query Builder
    const subset = filteredDataset.filter(r => {
      if (selectedCategoryFilter !== 'ALL' && r.categoria !== selectedCategoryFilter) return false;
      if (selectedCityFilter !== 'ALL' && r.ciudad !== selectedCityFilter) return false;
      if (minImp > 0 && r.totalVenta < minImp) return false;
      if (minCant > 0 && r.cantidad < minCant) return false;
      return true;
    });

    // 2. Agrupación por Primary Dimension (+ Secondary Dimension si aplica)
    const map = {};
    let grandTotalRevenue = 0;
    let grandTotalUnits = 0;
    let grandTotalTxs = 0;

    subset.forEach(row => {
      let key1 = row[primaryDimension === 'Mes_Nombre' ? 'monthName' : primaryDimension === 'Trimestre' ? 'quarter' : primaryDimension.toLowerCase()] || row[primaryDimension] || 'Otros';
      let key2 = secondaryDimension !== 'NONE' ? (row[secondaryDimension === 'Mes_Nombre' ? 'monthName' : secondaryDimension === 'Trimestre' ? 'quarter' : secondaryDimension.toLowerCase()] || row[secondaryDimension] || 'Otros') : null;
      
      let fullKey = key2 ? `${key1} :: ${key2}` : key1;

      if (!map[fullKey]) {
        map[fullKey] = {
          key: fullKey,
          primary: key1,
          secondary: key2,
          totalVenta: 0,
          unidades: 0,
          transacciones: 0,
        };
      }

      map[fullKey].totalVenta += row.totalVenta;
      map[fullKey].unidades += row.cantidad;
      map[fullKey].transacciones += 1;

      grandTotalRevenue += row.totalVenta;
      grandTotalUnits += row.cantidad;
      grandTotalTxs += 1;
    });

    // 3. Cálculos de promedios y porcentajes
    let list = Object.values(map).map(item => {
      const ticketProm = item.transacciones > 0 ? item.totalVenta / item.transacciones : 0;
      const precioProm = item.unidades > 0 ? item.totalVenta / item.unidades : 0;
      const sharePct = grandTotalRevenue > 0 ? (item.totalVenta / grandTotalRevenue) * 100 : 0;

      return {
        ...item,
        ticketPromedio: ticketProm,
        precioPromedio: precioProm,
        sharePct,
      };
    });

    // 4. Ordenamiento
    list.sort((a, b) => {
      let valA = a[selectedMetric];
      let valB = b[selectedMetric];
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    // 5. Límite Top N
    if (topLimit > 0) {
      list = list.slice(0, topLimit);
    }

    return {
      items: list,
      matchedRows: subset.length,
      grandTotalRevenue,
      grandTotalUnits,
      grandTotalTxs,
    };
  }, [
    filteredDataset, 
    primaryDimension, 
    secondaryDimension, 
    selectedMetric, 
    minImporte, 
    minCantidad, 
    selectedCategoryFilter, 
    selectedCityFilter, 
    sortOrder, 
    topLimit
  ]);

  // Datos para gráficos de Chart.js
  const chartConfigData = useMemo(() => {
    const items = aggregatedResults.items || [];
    const labels = items.map(it => it.key);
    const dataValues = items.map(it => it[selectedMetric]);

    if (chartType === 'doughnut') {
      return {
        labels,
        datasets: [{
          data: dataValues,
          backgroundColor: PALETTE.slice(0, labels.length),
          borderColor: isDark ? '#0f172a' : '#ffffff',
          borderWidth: 2,
        }]
      };
    }

    if (chartType === 'line') {
      return {
        labels,
        datasets: [{
          label: metricOptions.find(m => m.value === selectedMetric)?.label || 'Valor',
          data: dataValues,
          borderColor: CHART_COLORS.cyan,
          backgroundColor: 'rgba(6, 182, 212, 0.25)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: CHART_COLORS.cyan,
          pointBorderColor: '#fff',
          pointRadius: 5,
        }]
      };
    }

    // Default: Bar Chart con gradiente
    return {
      labels,
      datasets: [{
        label: metricOptions.find(m => m.value === selectedMetric)?.label || 'Valor',
        data: dataValues,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 400, 0);
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(1, '#06b6d4');
          return gradient;
        },
        borderRadius: 6,
        barThickness: items.length > 8 ? 16 : 28,
      }]
    };
  }, [aggregatedResults, selectedMetric, chartType, isDark]);

  // Generador de Consulta MQL equivalente (MongoDB)
  const generatedMQL = useMemo(() => {
    const matchObj = {};
    if (selectedCategoryFilter !== 'ALL') matchObj['Categoría'] = selectedCategoryFilter;
    if (selectedCityFilter !== 'ALL') matchObj['Ciudad'] = selectedCityFilter;
    if (minImporte) matchObj['Total_Venta'] = { '$gte': parseFloat(minImporte) };
    if (minCantidad) matchObj['Cantidad'] = { '$gte': parseInt(minCantidad, 10) };

    const groupField = secondaryDimension !== 'NONE'
      ? { primary: `$${primaryDimension}`, secondary: `$${secondaryDimension}` }
      : `$${primaryDimension}`;

    const pipeline = [];
    if (Object.keys(matchObj).length > 0) {
      pipeline.push({ '$match': matchObj });
    }

    pipeline.push({
      '$group': {
        '_id': groupField,
        'totalVenta': { '$sum': '$Total_Venta' },
        'unidades': { '$sum': '$Cantidad' },
        'transacciones': { '$sum': 1 },
        'ticketPromedio': { '$avg': '$Total_Venta' }
      }
    });

    pipeline.push({
      '$sort': { [selectedMetric]: sortOrder === 'desc' ? -1 : 1 }
    });

    if (topLimit > 0) {
      pipeline.push({ '$limit': topLimit });
    }

    return `db.ventas.aggregate(${JSON.stringify(pipeline, null, 2)})`;
  }, [primaryDimension, secondaryDimension, selectedMetric, minImporte, minCantidad, selectedCategoryFilter, selectedCityFilter, sortOrder, topLimit]);

  const handleCopyMQL = () => {
    navigator.clipboard.writeText(generatedMQL);
    setCopiedMQL(true);
    setTimeout(() => setCopiedMQL(false), 2000);
  };

  const handleExportAdHocCSV = () => {
    if (!aggregatedResults.items || aggregatedResults.items.length === 0) return;

    const headers = ['Dimension_Principal', 'Dimension_Secundaria', 'Facturacion_PEN', 'Unidades', 'Transacciones', 'Ticket_Promedio_PEN', 'Participacion_Pct'];
    const rows = aggregatedResults.items.map(it => [
      `"${it.primary}"`,
      `"${it.secondary || 'N/A'}"`,
      it.totalVenta.toFixed(2),
      it.unidades,
      it.transacciones,
      it.ticketPromedio.toFixed(2),
      it.sharePct.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `datastore_consulta_adhoc_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 mb-12 animate-fade-in">
      
      {/* Encabezado del Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-md">
            <Sliders className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Panel de Consultas Libres & Ad-Hoc Analytics</span>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                Slice & Dice Total
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Cruza cualquier dimensión, aplica filtros numéricos por rango y visualiza agregaciones en tiempo real
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={resetQueryBuilder}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
          <button
            onClick={handleExportAdHocCSV}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Resultado (CSV)</span>
          </button>
        </div>
      </div>

      {/* Barra de Presets Rápidos de Negocio con 1 Clic */}
      <div className="p-3.5 rounded-2xl glass-panel border border-slate-800/80 bg-slate-900/60 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-semibold text-[11px] flex items-center space-x-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Consultas Rápidas:</span>
        </span>

        <button
          onClick={() => applyPreset('high-end')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-slate-700/80 hover:border-indigo-500/40 transition-all"
        >
          ⚡ Ventas High-End (S/ &gt; 5,000)
        </button>
        <button
          onClick={() => applyPreset('seasonality')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-600/30 text-cyan-300 hover:text-white border border-slate-700/80 hover:border-cyan-500/40 transition-all"
        >
          ⚡ Estacionalidad Mes a Mes
        </button>
        <button
          onClick={() => applyPreset('city-ticket')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600/30 text-emerald-300 hover:text-white border border-slate-700/80 hover:border-emerald-500/40 transition-all"
        >
          ⚡ Ranking de Ticket por Sede
        </button>
        <button
          onClick={() => applyPreset('product-rotation')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-600/30 text-amber-300 hover:text-white border border-slate-700/80 hover:border-amber-500/40 transition-all"
        >
          ⚡ Rotación de Stock (Unidades)
        </button>
        <button
          onClick={() => applyPreset('category-share')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-600/30 text-purple-300 hover:text-white border border-slate-700/80 hover:border-purple-500/40 transition-all"
        >
          ⚡ Cuota % por Categoría
        </button>
      </div>

      {/* Constructor de Consultas (Controles Ad-Hoc) */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-700/60 bg-slate-900/80 shadow-xl space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Eje / Dimensión Principal (Filas) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
              <span>1. Dimensión Principal (Eje X / Filas)</span>
            </label>
            <select
              value={primaryDimension}
              onChange={(e) => setPrimaryDimension(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {dimensionOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Desglose Secundario (Opcional) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              2. Desglose Secundario (Sub-agrupación)
            </label>
            <select
              value={secondaryDimension}
              onChange={(e) => setSecondaryDimension(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="NONE">(Ninguno - Agrupación Simple)</option>
              {dimensionOptions.filter(opt => opt.value !== primaryDimension).map(opt => (
                <option key={opt.value} value={opt.value}>Desglosar por: {opt.label}</option>
              ))}
            </select>
          </div>

          {/* Métrica Calculada a Evaluar */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              3. Métrica Analítica a Calcular
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {metricOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Límite Top N & Orden */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              4. Orden & Límite de Resultados
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
              >
                <option value="desc">Mayor a Menor (Desc)</option>
                <option value="asc">Menor a Mayor (Asc)</option>
              </select>
              <select
                value={topLimit}
                onChange={(e) => setTopLimit(Number(e.target.value))}
                className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
                <option value={0}>Todos</option>
              </select>
            </div>
          </div>

        </div>

        {/* Filtros de Rango Ad-Hoc (Condiciones WHERE / $match) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-3 border-t border-slate-800/80">
          
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
              Importe Mínimo (S/ &gt;=)
            </label>
            <input
              type="number"
              placeholder="Ej: 5000"
              value={minImporte}
              onChange={(e) => setMinImporte(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
              Cantidad Mínima (Unidades &gt;=)
            </label>
            <input
              type="number"
              placeholder="Ej: 10"
              value={minCantidad}
              onChange={(e) => setMinCantidad(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
              Filtrar por Categoría Específica
            </label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">Todas las Categorías</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
              Filtrar por Sede Específica
            </label>
            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none"
            >
              <option value="ALL">Todas las Sedes</option>
              {availableCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Resultados de la Consulta Ad-Hoc */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-700/60 bg-slate-900/80 shadow-2xl space-y-4">
        
        {/* Cabecera del Visor de Resultados */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {formatNumber(aggregatedResults.matchedRows)} transacciones analizadas
            </span>
            <span className="text-xs text-slate-400">
              Facturación en consulta: <strong className="text-emerald-400 font-mono">{formatCurrency(aggregatedResults.grandTotalRevenue)}</strong>
            </span>
          </div>

          {/* Toggle de Tipo de Vista */}
          <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewType('chart')}
              className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition-colors ${
                viewType === 'chart' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Gráfico Dinámico</span>
            </button>
            <button
              onClick={() => setViewType('table')}
              className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition-colors ${
                viewType === 'table' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabla Matricial</span>
            </button>
            <button
              onClick={() => setViewType('mql')}
              className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition-colors ${
                viewType === 'mql' ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Código MQL (Mongo)</span>
            </button>
          </div>
        </div>

        {/* 1. Vista de Gráfico Dinámico */}
        {viewType === 'chart' && (
          <div>
            {/* Selector de tipo de gráfico */}
            <div className="flex items-center justify-end space-x-2 mb-3 text-xs">
              <span className="text-slate-400 text-[11px]">Visual:</span>
              <button
                onClick={() => setChartType('bar')}
                className={`px-2.5 py-1 rounded-md border ${chartType === 'bar' ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
              >
                Barras
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-2.5 py-1 rounded-md border ${chartType === 'line' ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
              >
                Líneas
              </button>
              <button
                onClick={() => setChartType('doughnut')}
                className={`px-2.5 py-1 rounded-md border ${chartType === 'doughnut' ? 'bg-purple-600/30 text-purple-300 border-purple-500' : 'bg-slate-950 text-slate-400 border-slate-800'}`}
              >
                Donut
              </button>
            </div>

            <div className="h-[360px] w-full relative flex items-center justify-center">
              {chartType === 'doughnut' ? (
                <Doughnut 
                  data={chartConfigData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'right', labels: { color: isDark ? '#cbd5e1' : '#334155', font: { family: 'Inter', size: 11 } } },
                      tooltip: getBaseTooltipOptions(isDark)
                    }
                  }} 
                />
              ) : chartType === 'line' ? (
                <Line 
                  data={chartConfigData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { display: false }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } },
                      y: { grid: { color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.8)' }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } }
                    },
                    plugins: { tooltip: getBaseTooltipOptions(isDark) }
                  }} 
                />
              ) : (
                <Bar 
                  data={chartConfigData} 
                  options={{
                    indexAxis: primaryDimension === 'Producto' ? 'y' : 'x',
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: { grid: { color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.8)' }, ticks: { color: isDark ? '#94a3b8' : '#64748b' } },
                      y: { grid: { display: false }, ticks: { color: isDark ? '#e2e8f0' : '#1e293b' } }
                    },
                    plugins: { tooltip: getBaseTooltipOptions(isDark) }
                  }} 
                />
              )}
            </div>
          </div>
        )}

        {/* 2. Vista de Tabla Matricial con Formato Condicional */}
        {viewType === 'table' && (
          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">{primaryDimension}</th>
                  {secondaryDimension !== 'NONE' && (
                    <th className="py-2.5 px-3">{secondaryDimension}</th>
                  )}
                  <th className="py-2.5 px-3 text-right">Facturación (S/)</th>
                  <th className="py-2.5 px-3 text-right">Unidades</th>
                  <th className="py-2.5 px-3 text-right">Tickets</th>
                  <th className="py-2.5 px-3 text-right">Ticket Promedio</th>
                  <th className="py-2.5 px-3 text-right">Cuota %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {aggregatedResults.items.map((it, idx) => (
                  <tr key={it.key} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 text-slate-500 text-[11px]">{idx + 1}</td>
                    <td className="py-2 px-3 text-white font-sans font-semibold">{it.primary}</td>
                    {secondaryDimension !== 'NONE' && (
                      <td className="py-2 px-3 text-indigo-300 font-sans">{it.secondary}</td>
                    )}
                    <td className="py-2 px-3 text-right font-bold text-emerald-400">
                      {formatCurrency(it.totalVenta)}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-200">{formatNumber(it.unidades)} u.</td>
                    <td className="py-2 px-3 text-right text-slate-300">{formatNumber(it.transacciones)}</td>
                    <td className="py-2 px-3 text-right text-amber-300">{formatCurrency(it.ticketPromedio)}</td>
                    <td className="py-2 px-3 text-right text-cyan-300 font-bold">{formatPercent(it.sharePct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. Vista de Código MQL / Pipeline MongoDB */}
        {viewType === 'mql' && (
          <div className="relative">
            <button
              onClick={handleCopyMQL}
              className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all z-10"
            >
              {copiedMQL ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMQL ? 'Copiado!' : 'Copiar MQL'}</span>
            </button>
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs overflow-x-auto leading-relaxed">
              {generatedMQL}
            </pre>
          </div>
        )}

      </div>

    </div>
  );
};
