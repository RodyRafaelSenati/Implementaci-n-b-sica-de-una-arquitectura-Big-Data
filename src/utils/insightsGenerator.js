import { formatCurrency, formatNumber, formatPercent } from './formatters';

/**
 * Generador de Insights de Negocio para DATASTORE S.A.C.
 * Sigue el marco estratégico: [RESULTADO] -> [INTERPRETACIÓN] -> [DECISIÓN PROPUESTA]
 */
export const generateBusinessInsights = (data, kpis) => {
  if (!data || data.length === 0) {
    return [];
  }

  // Agrupaciones necesarias para cálculos profundos
  const productStats = {};
  const categoryStats = {};
  const cityStats = {};
  const monthlyStats = {};

  let totalRevenue = 0;
  let totalUnits = 0;

  data.forEach(r => {
    totalRevenue += r.totalVenta;
    totalUnits += r.cantidad;

    // Producto
    if (!productStats[r.producto]) {
      productStats[r.producto] = {
        name: r.producto,
        categoria: r.categoria,
        revenue: 0,
        units: 0,
        orders: 0,
        prices: []
      };
    }
    productStats[r.producto].revenue += r.totalVenta;
    productStats[r.producto].units += r.cantidad;
    productStats[r.producto].orders += 1;
    productStats[r.producto].prices.push(r.precio);

    // Categoria
    if (!categoryStats[r.categoria]) {
      categoryStats[r.categoria] = { name: r.categoria, revenue: 0, units: 0, count: 0 };
    }
    categoryStats[r.categoria].revenue += r.totalVenta;
    categoryStats[r.categoria].units += r.cantidad;
    categoryStats[r.categoria].count += 1;

    // Ciudad
    if (!cityStats[r.ciudad]) {
      cityStats[r.ciudad] = { name: r.ciudad, revenue: 0, units: 0, orders: 0 };
    }
    cityStats[r.ciudad].revenue += r.totalVenta;
    cityStats[r.ciudad].units += r.cantidad;
    cityStats[r.ciudad].orders += 1;

    // Mes
    if (!monthlyStats[r.monthKey]) {
      monthlyStats[r.monthKey] = {
        monthKey: r.monthKey,
        label: `${r.monthShort} ${r.year}`,
        revenue: 0,
        units: 0,
        orders: 0
      };
    }
    monthlyStats[r.monthKey].revenue += r.totalVenta;
    monthlyStats[r.monthKey].units += r.cantidad;
    monthlyStats[r.monthKey].orders += 1;
  });

  const productsList = Object.values(productStats);
  const citiesList = Object.values(cityStats).map(c => ({
    ...c,
    ticketPromedio: c.orders > 0 ? c.revenue / c.orders : 0
  }));
  const monthsList = Object.values(monthlyStats).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  const categoriesList = Object.values(categoryStats);

  // 1. Gestión de Stock: Producto con mayor volumen / demanda física
  const topDemandProduct = [...productsList].sort((a, b) => b.units - a.units)[0] || { name: 'N/A', units: 0, revenue: 0, orders: 0 };
  const topDemandShare = totalUnits > 0 ? (topDemandProduct.units / totalUnits) * 100 : 0;

  // 2. Enfoque de Marketing: Producto con menor rotación / demanda
  const bottomDemandProduct = [...productsList].sort((a, b) => a.units - b.units || a.revenue - b.revenue)[0] || { name: 'N/A', units: 0, revenue: 0, orders: 0 };
  const bottomDemandShare = totalUnits > 0 ? (bottomDemandProduct.units / totalUnits) * 100 : 0;

  // 3. Inversión Regional: Ciudad con mayor facturación y ciudad con mayor ticket promedio
  const topRevenueCity = [...citiesList].sort((a, b) => b.revenue - a.revenue)[0] || { name: 'N/A', revenue: 0, ticketPromedio: 0 };
  const topTicketCity = [...citiesList].sort((a, b) => b.ticketPromedio - a.ticketPromedio)[0] || { name: 'N/A', revenue: 0, ticketPromedio: 0 };
  const cityRevenueShare = totalRevenue > 0 ? (topRevenueCity.revenue / totalRevenue) * 100 : 0;

  // 4. Estacionalidad y Picos: Mes con mayor y menor facturación
  const sortedMonthsByRevenue = [...monthsList].sort((a, b) => b.revenue - a.revenue);
  const peakMonth = sortedMonthsByRevenue[0] || { label: 'N/A', revenue: 0 };
  const valleyMonth = sortedMonthsByRevenue[sortedMonthsByRevenue.length - 1] || { label: 'N/A', revenue: 0 };
  const seasonalGap = valleyMonth.revenue > 0 ? ((peakMonth.revenue - valleyMonth.revenue) / valleyMonth.revenue) * 100 : 0;

  // 5. Análisis de Concentración de Categorías (Pareto)
  const topCategory = [...categoriesList].sort((a, b) => b.revenue - a.revenue)[0] || { name: 'N/A', revenue: 0, units: 0 };
  const topCatShare = totalRevenue > 0 ? (topCategory.revenue / totalRevenue) * 100 : 0;

  return [
    {
      id: 'stock-management',
      category: 'Gestión de Stock y Abastecimiento',
      iconName: 'Boxes',
      badgeColor: 'emerald',
      title: 'Priorización de Inventario y Stock de Seguridad',
      question: '¿Qué producto debe priorizar stock y reabastecimiento crítico?',
      resultado: {
        headline: `${topDemandProduct.name} lidera la demanda física con ${formatNumber(topDemandProduct.units)} unidades despachadas (${formatPercent(topDemandShare)} del total).`,
        metric: `${formatNumber(topDemandProduct.units)} u.`,
        submetric: `Facturación: ${formatCurrency(topDemandProduct.revenue)} en ${formatNumber(topDemandProduct.orders)} pedidos`
      },
      interpretacion: `Alta velocidad de rotación en la categoría ${topDemandProduct.categoria}. El producto mantiene una cadencia de salida constante en todas las sedes comerciales, lo que expone a DATASTORE S.A.C. a riesgos de rotura de stock (out-of-stock) en temporadas de alta afluencia.`,
      decision: `Establecer un buffer de inventario de seguridad equivalente a 21 días de demanda proyectada (+25% sobre el stock mínimo). Negociar contratos de suministro marco con proveedores clave para entregas Just-in-Time y evitar quiebres de inventario.`
    },
    {
      id: 'marketing-focus',
      category: 'Marketing y Estrategia Comercial',
      iconName: 'TrendingUp',
      badgeColor: 'amber',
      title: 'Plan de Impulso y Activación de Baja Rotación',
      question: '¿Qué producto requiere un plan de impulso y tracción comercial?',
      resultado: {
        headline: `${bottomDemandProduct.name} presenta la menor tracción con solo ${formatNumber(bottomDemandProduct.units)} unidades vendidas (${formatPercent(bottomDemandShare)} del volumen).`,
        metric: `${formatNumber(bottomDemandProduct.units)} u.`,
        submetric: `Facturación acumulada: ${formatCurrency(bottomDemandProduct.revenue)}`
      },
      interpretacion: `El producto enfrenta un estancamiento en el ciclo de conversión o baja visibilidad en el catálogo frente a alternativas directas. Mantener inventario inmovilizado genera costos de almacenamiento y costo de oportunidad de capital.`,
      decision: `Implementar una estrategia de 'Cross-selling & Bundling' emparejando ${bottomDemandProduct.name} con productos de alta rotación (ej. ${topDemandProduct.name}) con un descuento promocional del 10%-15%. Lanzar campaña de email marketing dirigida a clientes corporativos.`
    },
    {
      id: 'regional-investment',
      category: 'Expansión e Inversión Territorial',
      iconName: 'MapPin',
      badgeColor: 'indigo',
      title: 'Focalización de Infraestructura y Expansión Regional',
      question: '¿En qué sede se debe expandir operaciones, logística o recursos?',
      resultado: {
        headline: `${topRevenueCity.name} domina la facturación con ${formatCurrency(topRevenueCity.revenue)} (${formatPercent(cityRevenueShare)}), mientras que ${topTicketCity.name} ostenta el Ticket Promedio más alto con ${formatCurrency(topTicketCity.ticketPromedio)}.`,
        metric: topRevenueCity.name,
        submetric: `Ticket Líder: ${topTicketCity.name} (${formatCurrency(topTicketCity.ticketPromedio)})`
      },
      interpretacion: `Existe una bifurcación estratégica: ${topRevenueCity.name} concentra el mayor flujo de transacciones masivas, mientras que ${topTicketCity.name} exhibe compras corporativas de mayor valor agregado y margen por operación.`,
      decision: `Destinar el 60% del presupuesto de expansión a fortalecer el centro de distribución en ${topRevenueCity.name} para optimizar entregas de última milla, y aperturar un canal B2B especializado para clientes corporativos de alto ticket en ${topTicketCity.name}.`
    },
    {
      id: 'seasonality-peaks',
      category: 'Estacionalidad y Dinámica Temporal',
      iconName: 'CalendarCheck',
      badgeColor: 'purple',
      title: 'Planificación Comercial de Temporadas Pico y Valles',
      question: '¿Qué períodos presentaron mayor y menor rendimiento comercial?',
      resultado: {
        headline: `Pico comercial registrado en ${peakMonth.label} (${formatCurrency(peakMonth.revenue)}), contrastando con el valle de ${valleyMonth.label} (${formatCurrency(valleyMonth.revenue)}). Brecha del ${formatPercent(seasonalGap)}.`,
        metric: peakMonth.label,
        submetric: `Valle: ${valleyMonth.label} (${formatCurrency(valleyMonth.revenue)})`
      },
      interpretacion: `La concentración estacional responde a ciclos de renovación tecnológica y compras de cierre presupuestario institucional. Los meses valle generan capacidad ociosa en logística y desaceleración de flujo de caja.`,
      decision: `Adelantar compras de stock 45 días antes de ${peakMonth.label} para congelar precios con mayoristas. Para los meses valle (como ${valleyMonth.label}), lanzar preventas corporativas con facilidades de pago a 30/60 días para estabilizar el cash-flow.`
    }
  ];
};
