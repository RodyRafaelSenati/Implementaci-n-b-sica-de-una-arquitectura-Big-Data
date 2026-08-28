import React from 'react';
import { Bar } from 'react-chartjs-2';
import { MapPin } from 'lucide-react';
import { ChartContainer } from './ChartContainer';
import { useData } from '../../context/DataContext';
import { CHART_COLORS, getBaseTooltipOptions } from './chartConfig';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const CityPerformanceChart = () => {
  const { chartsData, theme } = useData();
  const { labels, ventas, transacciones, ticketPromedio } = chartsData.cityPerformance;
  const isDark = theme === 'dark';

  const data = {
    labels: labels || [],
    datasets: [
      {
        label: 'Ventas Totales (S/)',
        data: ventas || [],
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 300, 0, 0);
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
          gradient.addColorStop(1, '#06b6d4');
          return gradient;
        },
        borderColor: '#06b6d4',
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false
      }
    ]
  };

  const options = {
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
            const txs = transacciones[index];
            const avgTicket = ticketPromedio[index];
            return [
              ` Facturación: ${formatCurrency(val)}`,
              ` Transacciones: ${formatNumber(txs)} ops`,
              ` Ticket Promedio: ${formatCurrency(avgTicket)}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? '#e2e8f0' : '#1e293b',
          font: { family: 'Inter', size: 11, weight: '600' }
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.8)',
          drawBorder: false
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: 'Inter', size: 11 },
          callback: (val) => formatCurrency(val, true)
        }
      }
    }
  };

  return (
    <ChartContainer
      title="5. Rendimiento por Sede / Ciudad"
      subtitle="Facturación global comparada entre ciudades"
      icon={MapPin}
      badge="Geográfico / Sede"
      infoText="Comparación de la recaudación comercial entre sedes (Lima, Moquegua, Arequipa, Cusco, etc.) para priorizar logística y marketing."
      height="300px"
    >
      <Bar data={data} options={options} />
    </ChartContainer>
  );
};
