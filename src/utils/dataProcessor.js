import Papa from 'papaparse';
import { parseDateDDMMYYYY, MONTH_NAMES_SHORT, MONTH_NAMES } from './formatters';

/**
 * Normaliza y valida una fila del archivo CSV de DATASTORE S.A.C.
 */
export const normalizeRow = (row, index) => {
  // Fecha
  const rawDate = row['Fecha'] || row['fecha'] || row['FECHA'] || '';
  const parsedDate = parseDateDDMMYYYY(rawDate);
  
  // Producto
  const producto = (row['Producto'] || row['producto'] || row['PRODUCTO'] || 'Sin Especificar').trim();
  
  // Categoría
  const categoria = (row['Categoría'] || row['Categoria'] || row['categoria'] || row['CATEGORIA'] || 'Otros').trim();
  
  // Cantidad
  const rawCantidad = row['Cantidad'] || row['cantidad'] || row['CANTIDAD'] || '0';
  const cantidad = parseInt(String(rawCantidad).replace(/[^\d-]/g, ''), 10) || 0;
  
  // Precio
  const rawPrecio = row['Precio'] || row['precio'] || row['PRECIO'] || '0';
  const cleanPrecioStr = String(rawPrecio).replace(/S\/\.?\s?/g, '').replace(/,/g, '.').trim();
  const precio = parseFloat(cleanPrecioStr) || 0;
  
  // Ciudad
  const ciudad = (row['Ciudad'] || row['ciudad'] || row['CIUDAD'] || 'Otras').trim();
  
  // Campo calculado: Total Venta = Cantidad * Precio
  const totalVenta = cantidad * precio;

  // Metadata de tiempo
  const year = parsedDate ? parsedDate.getFullYear() : 2026;
  const monthIndex = parsedDate ? parsedDate.getMonth() : 0;
  const monthKey = parsedDate ? `${year}-${String(monthIndex + 1).padStart(2, '0')}` : '2026-01';
  const day = parsedDate ? parsedDate.getDate() : 1;
  const quarter = `Q${Math.floor(monthIndex / 3) + 1}`;

  return {
    id: index + 1,
    fechaRaw: rawDate,
    fechaObj: parsedDate,
    fechaTimestamp: parsedDate ? parsedDate.getTime() : 0,
    year,
    monthIndex,
    monthName: MONTH_NAMES[monthIndex],
    monthShort: MONTH_NAMES_SHORT[monthIndex],
    monthKey,
    day,
    quarter,
    producto,
    categoria,
    cantidad: Math.max(0, cantidad),
    precio: Math.max(0, precio),
    ciudad,
    totalVenta: Math.max(0, totalVenta)
  };
};

/**
 * Parsea un string o File CSV utilizando PapaParse
 */
export const parseCSVData = (csvContent) => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            return reject(new Error('El archivo CSV está vacío o no contiene registros válidos.'));
          }

          const processed = [];
          let invalidCount = 0;

          results.data.forEach((row, idx) => {
            // Verificar si la fila tiene datos mínimos
            if (!row['Fecha'] && !row['Producto'] && !row['Ciudad']) {
              invalidCount++;
              return;
            }
            const normalized = normalizeRow(row, idx);
            if (normalized.fechaObj || normalized.producto) {
              processed.push(normalized);
            } else {
              invalidCount++;
            }
          });

          // Obtener listas únicas para filtros
          const cities = Array.from(new Set(processed.map(r => r.ciudad))).filter(Boolean).sort();
          const categories = Array.from(new Set(processed.map(r => r.categoria))).filter(Boolean).sort();
          const products = Array.from(new Set(processed.map(r => r.producto))).filter(Boolean).sort();

          // Rango de fechas
          const validTimestamps = processed.map(r => r.fechaTimestamp).filter(t => t > 0);
          const minDate = validTimestamps.length > 0 ? new Date(Math.min(...validTimestamps)) : new Date(2026, 0, 1);
          const maxDate = validTimestamps.length > 0 ? new Date(Math.max(...validTimestamps)) : new Date(2026, 11, 31);

          resolve({
            data: processed,
            totalRows: results.data.length,
            validRows: processed.length,
            invalidCount,
            uniqueCities: cities,
            uniqueCategories: categories,
            uniqueProducts: products,
            dateRange: {
              min: minDate,
              max: maxDate
            }
          });
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

/**
 * Filtra el dataset basado en los filtros globales seleccionados
 */
export const filterDataset = (data, filters) => {
  if (!data || !Array.isArray(data)) return [];

  const {
    startDate,
    endDate,
    selectedCity,
    selectedCategory,
    searchTerm
  } = filters;

  const startTimestamp = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
  const endTimestamp = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
  const searchLower = searchTerm ? searchTerm.toLowerCase().trim() : '';

  return data.filter(row => {
    // Filtro por Fecha
    if (startTimestamp && row.fechaTimestamp < startTimestamp) return false;
    if (endTimestamp && row.fechaTimestamp > endTimestamp) return false;

    // Filtro por Ciudad
    if (selectedCity && selectedCity !== 'ALL' && row.ciudad !== selectedCity) return false;

    // Filtro por Categoría
    if (selectedCategory && selectedCategory !== 'ALL' && row.categoria !== selectedCategory) return false;

    // Filtro por Búsqueda (Producto o Ciudad)
    if (searchLower) {
      const matchProduct = row.producto.toLowerCase().includes(searchLower);
      const matchCity = row.ciudad.toLowerCase().includes(searchLower);
      const matchCat = row.categoria.toLowerCase().includes(searchLower);
      if (!matchProduct && !matchCity && !matchCat) return false;
    }

    return true;
  });
};

/**
 * Cálculo de los 6 KPIs Principales
 */
export const calculateKPIs = (data) => {
  if (!data || data.length === 0) {
    return {
      totalVentas: 0,
      totalTransacciones: 0,
      unidadesVendidas: 0,
      ticketPromedio: 0,
      productoTop: { nombre: 'N/A', totalVentas: 0, unidades: 0, share: 0 },
      sedeLider: { ciudad: 'N/A', totalVentas: 0, transacciones: 0, share: 0 }
    };
  }

  let totalVentas = 0;
  let unidadesVendidas = 0;
  const productStats = {};
  const cityStats = {};

  data.forEach(row => {
    totalVentas += row.totalVenta;
    unidadesVendidas += row.cantidad;

    // Estadísticas por Producto
    if (!productStats[row.producto]) {
      productStats[row.producto] = { totalVentas: 0, unidades: 0, count: 0 };
    }
    productStats[row.producto].totalVentas += row.totalVenta;
    productStats[row.producto].unidades += row.cantidad;
    productStats[row.producto].count += 1;

    // Estadísticas por Ciudad
    if (!cityStats[row.ciudad]) {
      cityStats[row.ciudad] = { totalVentas: 0, unidades: 0, transacciones: 0 };
    }
    cityStats[row.ciudad].totalVentas += row.totalVenta;
    cityStats[row.ciudad].unidades += row.cantidad;
    cityStats[row.ciudad].transacciones += 1;
  });

  const totalTransacciones = data.length;
  const ticketPromedio = totalTransacciones > 0 ? totalVentas / totalTransacciones : 0;

  // Producto Top por recaudación
  let topProdName = 'N/A';
  let topProdStats = { totalVentas: 0, unidades: 0, count: 0 };
  Object.entries(productStats).forEach(([prod, stats]) => {
    if (stats.totalVentas > topProdStats.totalVentas) {
      topProdName = prod;
      topProdStats = stats;
    }
  });

  // Sede Líder por recaudación
  let topCityName = 'N/A';
  let topCityStats = { totalVentas: 0, unidades: 0, transacciones: 0 };
  Object.entries(cityStats).forEach(([city, stats]) => {
    if (stats.totalVentas > topCityStats.totalVentas) {
      topCityName = city;
      topCityStats = stats;
    }
  });

  return {
    totalVentas,
    totalTransacciones,
    unidadesVendidas,
    ticketPromedio,
    productoTop: {
      nombre: topProdName,
      totalVentas: topProdStats.totalVentas,
      unidades: topProdStats.unidades,
      share: totalVentas > 0 ? (topProdStats.totalVentas / totalVentas) * 100 : 0
    },
    sedeLider: {
      ciudad: topCityName,
      totalVentas: topCityStats.totalVentas,
      transacciones: topCityStats.transacciones,
      share: totalVentas > 0 ? (topCityStats.totalVentas / totalVentas) * 100 : 0
    }
  };
};

/**
 * 1. Evolución Temporal de Ventas (Mensual cronológico)
 */
export const getSalesTrendData = (data) => {
  const monthMap = {};

  data.forEach(row => {
    if (!monthMap[row.monthKey]) {
      monthMap[row.monthKey] = {
        monthKey: row.monthKey,
        label: `${row.monthShort} ${row.year}`,
        monthIndex: row.monthIndex,
        year: row.year,
        totalVentas: 0,
        unidades: 0,
        transacciones: 0
      };
    }
    monthMap[row.monthKey].totalVentas += row.totalVenta;
    monthMap[row.monthKey].unidades += row.cantidad;
    monthMap[row.monthKey].transacciones += 1;
  });

  const sortedMonths = Object.values(monthMap).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  return {
    labels: sortedMonths.map(m => m.label),
    ventas: sortedMonths.map(m => m.totalVentas),
    unidades: sortedMonths.map(m => m.unidades),
    transacciones: sortedMonths.map(m => m.transacciones),
    ticketPromedio: sortedMonths.map(m => m.transacciones > 0 ? m.totalVentas / m.transacciones : 0),
    raw: sortedMonths
  };
};

/**
 * 2. Distribución de Ingresos por Categoría (Donut)
 */
export const getCategoryDistributionData = (data) => {
  const catMap = {};
  let grandTotal = 0;

  data.forEach(row => {
    if (!catMap[row.categoria]) {
      catMap[row.categoria] = { totalVentas: 0, unidades: 0, count: 0 };
    }
    catMap[row.categoria].totalVentas += row.totalVenta;
    catMap[row.categoria].unidades += row.cantidad;
    catMap[row.categoria].count += 1;
    grandTotal += row.totalVenta;
  });

  const sorted = Object.entries(catMap)
    .map(([categoria, stats]) => ({
      categoria,
      totalVentas: stats.totalVentas,
      unidades: stats.unidades,
      count: stats.count,
      percentage: grandTotal > 0 ? (stats.totalVentas / grandTotal) * 100 : 0
    }))
    .sort((a, b) => b.totalVentas - a.totalVentas);

  return {
    labels: sorted.map(c => c.categoria),
    ventas: sorted.map(c => c.totalVentas),
    percentages: sorted.map(c => c.percentage),
    unidades: sorted.map(c => c.unidades),
    raw: sorted
  };
};

/**
 * 3. Top 5 Productos Más Vendidos (Ingresos)
 */
export const getTopProductsData = (data, limit = 5) => {
  const prodMap = {};

  data.forEach(row => {
    if (!prodMap[row.producto]) {
      prodMap[row.producto] = {
        producto: row.producto,
        categoria: row.categoria,
        totalVentas: 0,
        unidades: 0,
        transacciones: 0
      };
    }
    prodMap[row.producto].totalVentas += row.totalVenta;
    prodMap[row.producto].unidades += row.cantidad;
    prodMap[row.producto].transacciones += 1;
  });

  const sorted = Object.values(prodMap)
    .sort((a, b) => b.totalVentas - a.totalVentas)
    .slice(0, limit);

  return {
    labels: sorted.map(p => p.producto),
    ventas: sorted.map(p => p.totalVentas),
    unidades: sorted.map(p => p.unidades),
    categories: sorted.map(p => p.categoria),
    raw: sorted
  };
};

/**
 * 4. Bottom 5 Productos Menos Vendidos (Demanda / Unidades o Ingresos)
 */
export const getBottomProductsData = (data, limit = 5) => {
  const prodMap = {};

  data.forEach(row => {
    if (!prodMap[row.producto]) {
      prodMap[row.producto] = {
        producto: row.producto,
        categoria: row.categoria,
        totalVentas: 0,
        unidades: 0,
        transacciones: 0
      };
    }
    prodMap[row.producto].totalVentas += row.totalVenta;
    prodMap[row.producto].unidades += row.cantidad;
    prodMap[row.producto].transacciones += 1;
  });

  // Ordenar de menor a mayor por unidades o ingresos
  const sorted = Object.values(prodMap)
    .sort((a, b) => a.unidades - b.unidades || a.totalVentas - b.totalVentas)
    .slice(0, limit);

  return {
    labels: sorted.map(p => p.producto),
    unidades: sorted.map(p => p.unidades),
    ventas: sorted.map(p => p.totalVentas),
    categories: sorted.map(p => p.categoria),
    raw: sorted
  };
};

/**
 * 5. Rendimiento por Sede / Ciudad (Barras)
 */
export const getCityPerformanceData = (data) => {
  const cityMap = {};

  data.forEach(row => {
    if (!cityMap[row.ciudad]) {
      cityMap[row.ciudad] = {
        ciudad: row.ciudad,
        totalVentas: 0,
        unidades: 0,
        transacciones: 0
      };
    }
    cityMap[row.ciudad].totalVentas += row.totalVenta;
    cityMap[row.ciudad].unidades += row.cantidad;
    cityMap[row.ciudad].transacciones += 1;
  });

  const sorted = Object.values(cityMap)
    .map(c => ({
      ...c,
      ticketPromedio: c.transacciones > 0 ? c.totalVentas / c.transacciones : 0
    }))
    .sort((a, b) => b.totalVentas - a.totalVentas);

  return {
    labels: sorted.map(c => c.ciudad),
    ventas: sorted.map(c => c.totalVentas),
    unidades: sorted.map(c => c.unidades),
    transacciones: sorted.map(c => c.transacciones),
    ticketPromedio: sorted.map(c => c.ticketPromedio),
    raw: sorted
  };
};

/**
 * 6. Volumen de Unidades Vendidas por Categoría (Donut / Polar)
 */
export const getCategoryVolumeData = (data) => {
  const catMap = {};
  let totalUnits = 0;

  data.forEach(row => {
    if (!catMap[row.categoria]) {
      catMap[row.categoria] = { unidades: 0, totalVentas: 0 };
    }
    catMap[row.categoria].unidades += row.cantidad;
    catMap[row.categoria].totalVentas += row.totalVenta;
    totalUnits += row.cantidad;
  });

  const sorted = Object.entries(catMap)
    .map(([categoria, stats]) => ({
      categoria,
      unidades: stats.unidades,
      totalVentas: stats.totalVentas,
      percentage: totalUnits > 0 ? (stats.unidades / totalUnits) * 100 : 0
    }))
    .sort((a, b) => b.unidades - a.unidades);

  return {
    labels: sorted.map(c => c.categoria),
    unidades: sorted.map(c => c.unidades),
    percentages: sorted.map(c => c.percentage),
    ventas: sorted.map(c => c.totalVentas),
    raw: sorted
  };
};

/**
 * 7. Matriz Ciudad vs Categoría (Barras agrupadas)
 */
export const getCityCategoryMatrixData = (data) => {
  const cities = Array.from(new Set(data.map(r => r.ciudad))).filter(Boolean).sort();
  const categories = Array.from(new Set(data.map(r => r.categoria))).filter(Boolean).sort();

  // Matriz de sumas [city][category] -> totalVenta
  const matrix = {};
  cities.forEach(city => {
    matrix[city] = {};
    categories.forEach(cat => {
      matrix[city][cat] = 0;
    });
  });

  data.forEach(row => {
    if (matrix[row.ciudad] && matrix[row.ciudad][row.categoria] !== undefined) {
      matrix[row.ciudad][row.categoria] += row.totalVenta;
    }
  });

  return {
    cities,
    categories,
    matrix
  };
};

/**
 * 8. Ticket Promedio por Sede (Radar / Polar Chart)
 */
export const getCityTicketRadarData = (data) => {
  const cityMap = {};

  data.forEach(row => {
    if (!cityMap[row.ciudad]) {
      cityMap[row.ciudad] = {
        ciudad: row.ciudad,
        totalVentas: 0,
        transacciones: 0,
        unidades: 0
      };
    }
    cityMap[row.ciudad].totalVentas += row.totalVenta;
    cityMap[row.ciudad].transacciones += 1;
    cityMap[row.ciudad].unidades += row.cantidad;
  });

  const sorted = Object.values(cityMap).map(c => ({
    ciudad: c.ciudad,
    ticketPromedio: c.transacciones > 0 ? c.totalVentas / c.transacciones : 0,
    unidadesPorTransaccion: c.transacciones > 0 ? c.unidades / c.transacciones : 0,
    precioPromedioUnitario: c.unidades > 0 ? c.totalVentas / c.unidades : 0,
    totalVentas: c.totalVentas
  })).sort((a, b) => a.ciudad.localeCompare(b.ciudad));

  return {
    labels: sorted.map(c => c.ciudad),
    ticketPromedio: sorted.map(c => c.ticketPromedio),
    unidadesPorTransaccion: sorted.map(c => c.unidadesPorTransaccion),
    precioPromedioUnitario: sorted.map(c => c.precioPromedioUnitario),
    raw: sorted
  };
};
