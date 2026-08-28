import React from 'react';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import { ChartContainer } from './ChartContainer';
import { useData } from '../../context/DataContext';
import { CHART_COLORS, getBaseTooltipOptions } from './chartConfig';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const SalesTrendChart = () => {
  const { chartsData, theme } = useData();
  const { labels, ventas, unidades, ticketPromedio } = chartsData.salesTrend;
  const isDark = theme === 'dark';

  const data = {
    labels: labels || [],
    datasets: [
      {
        label: 'Ventas Totales (S/)',
        data: ventas || [],
        borderColor: CHART_COLORS.indigo,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');
          return gradient;
        },
        fill: true,
        tension: 0.38,
        pointBackgroundColor: CHART_COLORS.indigo,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        borderWidth: 2.5,
        yAxisID: 'y'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        ...getBaseTooltipOptions(isDark),
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const val = context.raw;
            const units = unidades[index];
            const avgTicket = ticketPromedio[index];
            return [
              ` Facturación: ${formatCurrency(val)}`,
              ` Unidades: ${formatNumber(units)} u.`,
              ` Ticket Promedio: ${formatCurrency(avgTicket)}`
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
          font: { family: 'Inter', size: 11 }
        }
      },
      y: {
        position: 'left',
        grid: {
          color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.8)',
          drawBorder: false
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          font: { family: 'Inter', size: 11 },
          callback: (value) => formatCurrency(value, true)
        }
      }
    }
  };

  return (
    <ChartContainer
      title="1. Evolución Temporal de Ventas"
      subtitle="Facturación mensual en Soles (S/) y comportamiento histórico"
      icon={TrendingUp}
      badge="Área / Tendencia"
      infoText="Muestra la evolución cronológica del volumen de ventas mes a mes para detectar estacionalidades y picos comerciales."
      height="300px"
    >
      <Line data={data} options={options} />
    </ChartContainer>
  );
};
