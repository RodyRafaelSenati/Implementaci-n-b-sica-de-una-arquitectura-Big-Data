import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Target } from 'lucide-react';
import { ChartContainer } from './ChartContainer';
import { useData } from '../../context/DataContext';
import { CHART_COLORS, getBaseTooltipOptions } from './chartConfig';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const CityTicketRadarChart = () => {
  const { chartsData, theme } = useData();
  const { labels, ticketPromedio, unidadesPorTransaccion, raw } = chartsData.cityTicketRadar;
  const isDark = theme === 'dark';

  const data = {
    labels: labels || [],
    datasets: [
      {
        label: 'Ticket Promedio (S/)',
        data: ticketPromedio || [],
        backgroundColor: 'rgba(99, 102, 241, 0.25)',
        borderColor: CHART_COLORS.indigo,
        pointBackgroundColor: CHART_COLORS.cyan,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: CHART_COLORS.cyan,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
            const rawItem = raw ? raw[index] : null;
            return [
              ` Ticket Promedio: ${formatCurrency(val)}`,
              rawItem ? ` Ventas Totales: ${formatCurrency(rawItem.totalVentas)}` : '',
              rawItem ? ` Unidades/Ticket: ${formatNumber(rawItem.unidadesPorTransaccion, 1)} u.` : ''
            ].filter(Boolean);
          }
        }
      }
    },
    scales: {
      r: {
        angleLines: {
          color: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(203, 213, 225, 0.8)'
        },
        grid: {
          color: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(203, 213, 225, 0.8)'
        },
        pointLabels: {
          color: isDark ? '#e2e8f0' : '#1e293b',
          font: { family: 'Inter', size: 11, weight: '600' }
        },
        ticks: {
          color: isDark ? '#94a3b8' : '#64748b',
          backdropColor: 'transparent',
          font: { family: 'Inter', size: 10 },
          callback: (val) => formatCurrency(val, true)
        }
      }
    }
  };

  return (
    <ChartContainer
      title="8. Ticket Promedio por Sede"
      subtitle="Rentabilidad y valor medio por transacción en cada región"
      icon={Target}
      badge="Radar / Rentabilidad"
      infoText="Compara la densidad económica por transacción en cada ciudad, detectando sedes con perfil corporativo B2B vs consumo masivo."
      height="320px"
    >
      <Radar data={data} options={options} />
    </ChartContainer>
  );
};
