import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  parseCSVData,
  filterDataset,
  calculateKPIs,
  getSalesTrendData,
  getCategoryDistributionData,
  getTopProductsData,
  getBottomProductsData,
  getCityPerformanceData,
  getCategoryVolumeData,
  getCityCategoryMatrixData,
  getCityTicketRadarData
} from '../utils/dataProcessor';
import { generateBusinessInsights } from '../utils/insightsGenerator';
import { formatDateInput } from '../utils/formatters';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser utilizado dentro de un DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('datastore_theme') || 'dark';
  });

  const [rawDataset, setRawDataset] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [dateBounds, setDateBounds] = useState({ min: null, max: null });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSourceInfo, setDataSourceInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'charts', 'insights', 'report'

  // Filtros reactivos globales
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    selectedCity: 'ALL',
    selectedCategory: 'ALL',
    searchTerm: ''
  });

  // Manejo del tema Dark/Light
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('datastore_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Función para procesar y cargar datos limpios provenientes del Pipeline Big Data (HDFS / MongoDB)
  const applyLoadedData = useCallback((result, sourceLabel = 'HDFS Cluster (/datastore/processed) & MongoDB NoSQL (datastore_db.ventas)', loadTimeMs = 0) => {
    setRawDataset(result.data);
    setAvailableCities(result.uniqueCities);
    setAvailableCategories(result.uniqueCategories);
    setAvailableProducts(result.uniqueProducts);
    setDateBounds(result.dateRange);

    // Inicializar con todo el rango disponible
    const minStr = result.dateRange.min ? formatDateInput(result.dateRange.min) : '2026-01-01';
    const maxStr = result.dateRange.max ? formatDateInput(result.dateRange.max) : '2026-12-31';

    setFilters({
      startDate: minStr,
      endDate: maxStr,
      selectedCity: 'ALL',
      selectedCategory: 'ALL',
      searchTerm: ''
    });

    setDataSourceInfo({
      source: sourceLabel,
      totalRows: result.totalRows,
      validRows: result.validRows,
      invalidRows: result.invalidCount,
      loadTimeMs,
      timestamp: new Date()
    });

    setError(null);
  }, []);

  // Carga automática del dataset limpio del pipeline HDFS / MongoDB
  const loadBigDataPipelineDataset = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();
    try {
      let response = await fetch('/ventas_clean.json');
      if (response.ok) {
        const jsonData = await response.json();
        const endTime = performance.now();
        
        const cities = Array.from(new Set(jsonData.map(r => r.Ciudad))).filter(Boolean).sort();
        const categories = Array.from(new Set(jsonData.map(r => r.Categoría))).filter(Boolean).sort();
        const products = Array.from(new Set(jsonData.map(r => r.Producto))).filter(Boolean).sort();
        
        const processed = jsonData.map((r, idx) => {
          // Parseo seguro de fecha YYYY-MM-DD
          const parts = r.Fecha.split('-');
          const year = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          const parsedDate = new Date(year, month, day);

          return {
            id: idx + 1,
            fechaRaw: r.Fecha,
            fechaObj: parsedDate,
            fechaTimestamp: parsedDate.getTime(),
            year: r.Año || year,
            monthIndex: month,
            monthName: r.Mes_Nombre || 'Mes',
            monthShort: r.Mes_Nombre ? r.Mes_Nombre.slice(0, 3) : 'Mes',
            monthKey: `${year}-${String(month + 1).padStart(2, '0')}`,
            day: r.Dia || day,
            quarter: r.Trimestre || `Q${Math.floor(month / 3) + 1}`,
            producto: r.Producto,
            categoria: r.Categoría,
            cantidad: r.Cantidad,
            precio: r.Precio,
            ciudad: r.Ciudad,
            totalVenta: r.Total_Venta || (r.Cantidad * r.Precio)
          };
        });

        const validTimestamps = processed.map(r => r.fechaTimestamp).filter(t => t > 0);
        const minDate = validTimestamps.length > 0 ? new Date(Math.min(...validTimestamps)) : new Date(2026, 0, 1);
        const maxDate = validTimestamps.length > 0 ? new Date(Math.max(...validTimestamps)) : new Date(2026, 11, 31);

        applyLoadedData({
          data: processed,
          totalRows: jsonData.length,
          validRows: processed.length,
          invalidCount: 0,
          uniqueCities: cities,
          uniqueCategories: categories,
          uniqueProducts: products,
          dateRange: { min: minDate, max: maxDate }
        }, 'HDFS Cluster & MongoDB NoSQL Pipeline (100% Sincronizado)', Math.round(endTime - startTime));
        return;
      }

      // Fallback a ventas_clean.csv
      response = await fetch('/ventas_clean.csv');
      if (!response.ok) {
        response = await fetch('/ventas.csv');
      }
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const csvText = await response.text();
      const parsed = await parseCSVData(csvText);
      const endTime = performance.now();
      applyLoadedData(parsed, 'HDFS Cluster & MongoDB NoSQL Data Lake', Math.round(endTime - startTime));
    } catch (err) {
      console.error('Error al sincronizar con el cluster HDFS/MongoDB:', err);
      setError(`Error al sincronizar con la fuente de datos Big Data: ${err.message}.`);
    } finally {
      setLoading(false);
    }
  }, [applyLoadedData]);

  // Carga inicial
  useEffect(() => {
    loadBigDataPipelineDataset();
  }, [loadBigDataPipelineDataset]);

  // Actualizar un filtro individual
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Resetear todos los filtros a sus valores predeterminados
  const resetFilters = () => {
    const minStr = dateBounds.min ? formatDateInput(dateBounds.min) : '2026-01-01';
    const maxStr = dateBounds.max ? formatDateInput(dateBounds.max) : '2026-12-31';
    setFilters({
      startDate: minStr,
      endDate: maxStr,
      selectedCity: 'ALL',
      selectedCategory: 'ALL',
      searchTerm: ''
    });
  };

  // Aplicación reactiva de filtros
  const filteredDataset = useMemo(() => {
    return filterDataset(rawDataset, filters);
  }, [rawDataset, filters]);

  // Cálculos reactivos de KPIs
  const kpis = useMemo(() => {
    return calculateKPIs(filteredDataset);
  }, [filteredDataset]);

  // Cálculos de datos para los 8 gráficos
  const chartsData = useMemo(() => {
    return {
      salesTrend: getSalesTrendData(filteredDataset),
      categoryDistribution: getCategoryDistributionData(filteredDataset),
      topProducts: getTopProductsData(filteredDataset, 5),
      bottomProducts: getBottomProductsData(filteredDataset, 5),
      cityPerformance: getCityPerformanceData(filteredDataset),
      categoryVolume: getCategoryVolumeData(filteredDataset),
      cityCategoryMatrix: getCityCategoryMatrixData(filteredDataset),
      cityTicketRadar: getCityTicketRadarData(filteredDataset)
    };
  }, [filteredDataset]);

  // Insights Estratégicos de Negocio
  const insights = useMemo(() => {
    return generateBusinessInsights(filteredDataset, kpis);
  }, [filteredDataset, kpis]);

  const value = {
    theme,
    toggleTheme,
    rawDataset,
    filteredDataset,
    availableCities,
    availableCategories,
    availableProducts,
    dateBounds,
    filters,
    updateFilter,
    resetFilters,
    kpis,
    chartsData,
    insights,
    loading,
    error,
    dataSourceInfo,
    loadBigDataPipelineDataset,
    activeTab,
    setActiveTab
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
