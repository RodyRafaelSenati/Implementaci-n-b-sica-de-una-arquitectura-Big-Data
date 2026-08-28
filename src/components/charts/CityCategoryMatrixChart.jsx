import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Grid } from 'lucide-react';
import { ChartContainer } from './ChartContainer';
import { useData } from '../../context/DataContext';
import { PALETTE, getBaseTooltipOptions } from './chartConfig';
import { formatCurrency } from '../../utils/formatters';

export const CityCategoryMatrixChart = () => {
  const { chartsData, theme } = useData();
  const { cities, categories, matrix } = chartsData.cityCategoryMatrix;
  const isDark = theme === 'dark';

  // Construir datasets: un dataset por categoría con datos en cada ciudad
  const datasets = (categories || []).map((cat, idx) => {
    const color = PALETTE[idx % PALETTE.length];
    return {
      label: cat,
      data: (cities || []).map(city => (matrix && matrix[city] ? matrix[city][cat] || 0 : 0)),
      backgroundColor: color,
      borderColor: isDark ? '#0f172a' : '#ffffff',
      borderWidth: 1,
      borderRadius: 4
    };
  });

  const data = {
    labels: cities || [],
    datasets
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#cbd5e1' : '#334155',
          font: { family: 'Inter', size: 11, weight: '500' },
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        ...getBaseTooltipOptions(isDark),
        callbacks: {
          label: (context) => {
            const catName = context.dataset.label;
            const val = context.raw;
            return ` ${catName}: ${formatCurrency(val)}`;
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
      title="7. Matriz Ciudad vs Categoría"
      subtitle="Penetración y recaudación por categoría en cada sede"
      icon={Grid}
      badge="Barras Agrupadas"
      infoText="Evalúa qué categoría de producto lidera las ventas en cada sede geográfica para personalizar el catálogo regional."
      height="320px"
    >
      <Bar data={data} options={options} />
    </ChartContainer>
  );
};
