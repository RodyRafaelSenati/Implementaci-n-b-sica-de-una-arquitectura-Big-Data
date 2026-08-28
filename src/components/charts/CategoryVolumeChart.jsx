import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Layers } from 'lucide-react';
import { ChartContainer } from './ChartContainer';
import { useData } from '../../context/DataContext';
import { PALETTE, getBaseTooltipOptions } from './chartConfig';
import { formatNumber, formatCurrency, formatPercent } from '../../utils/formatters';

export const CategoryVolumeChart = () => {
  const { chartsData, theme } = useData();
  const { labels, unidades, percentages, ventas } = chartsData.categoryVolume;
  const isDark = theme === 'dark';

  const data = {
    labels: labels || [],
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: unidades || [],
        backgroundColor: PALETTE.slice(0, labels.length).map(c => `${c}cc`),
        borderColor: PALETTE.slice(0, labels.length),
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
            const units = context.raw;
            const pct = percentages[index];
            const rev = ventas[index];
            return [
              ` Volumen Físico: ${formatNumber(units)} u.`,
              ` Cuota de Unidades: ${formatPercent(pct)}`,
              ` Ingresos Totales: ${formatCurrency(rev)}`
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
          callback: (val) => `${formatNumber(val)} u.`
        }
      }
    }
  };

  return (
    <ChartContainer
      title="6. Volumen de Unidades Vendidas por Categoría"
      subtitle="Cantidad de ítems físicos despachados por línea"
      icon={Layers}
      badge="Volumen Físico"
      infoText="Mide la carga operativa y demanda de unidades por categoría para optimizar almacenamiento y packing."
      height="300px"
    >
      <Bar data={data} options={options} />
    </ChartContainer>
  );
};
