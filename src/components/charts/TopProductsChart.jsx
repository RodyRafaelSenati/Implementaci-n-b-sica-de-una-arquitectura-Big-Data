import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Award } from 'lucide-react';
import { ChartContainer } from './ChartContainer';
import { useData } from '../../context/DataContext';
import { CHART_COLORS, getBaseTooltipOptions } from './chartConfig';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const TopProductsChart = () => {
  const { chartsData, theme } = useData();
  const { labels, ventas, unidades, categories } = chartsData.topProducts;
  const isDark = theme === 'dark';

  const data = {
    labels: labels || [],
    datasets: [
      {
        label: 'Ingresos Totales (S/)',
        data: ventas || [],
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 400, 0);
          gradient.addColorStop(0, '#6366f1');
          gradient.addColorStop(1, '#06b6d4');
          return gradient;
        },
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 20
      }
    ]
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...getBaseTooltipOptions(isDark),
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const val = context.raw;
            const units = unidades[index];
            const cat = categories[index];
            return [
              ` Facturación: ${formatCurrency(val)}`,
              ` Unidades Vendidas: ${formatNumber(units)} u.`,
              ` Categoría: ${cat}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.8)',
          drawBorder: false
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: 'Inter', size: 11 },
          callback: (val) => formatCurrency(val, true)
        }
      },
      y: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#e2e8f0' : '#1e293b',
          font: { family: 'Inter', size: 11, weight: '600' }
        }
      }
    }
  };

  return (
    <ChartContainer
      title="3. Top 5 Productos Más Vendidos"
      subtitle="Ranking por mayor generación de ingresos (S/)"
      icon={Award}
      badge="Líderes de Ventas"
      infoText="Productos estrella que concentran el mayor flujo de caja y facturación acumulada."
      height="300px"
    >
      <Bar data={data} options={options} />
    </ChartContainer>
  );
};
