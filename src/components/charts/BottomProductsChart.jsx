import React from 'react';
import { Bar } from 'react-chartjs-2';
import { AlertTriangle } from 'lucide-react';
import { ChartContainer } from './ChartContainer';
import { useData } from '../../context/DataContext';
import { CHART_COLORS, getBaseTooltipOptions } from './chartConfig';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const BottomProductsChart = () => {
  const { chartsData, theme } = useData();
  const { labels, unidades, ventas, categories } = chartsData.bottomProducts;
  const isDark = theme === 'dark';

  const data = {
    labels: labels || [],
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: unidades || [],
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 400, 0);
          gradient.addColorStop(0, '#f59e0b');
          gradient.addColorStop(1, '#f43f5e');
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
            const units = context.raw;
            const val = ventas[index];
            const cat = categories[index];
            return [
              ` Unidades Vendidas: ${formatNumber(units)} u.`,
              ` Facturación: ${formatCurrency(val)}`,
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
          font: { family: 'Inter', size: 11 }
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
      title="4. Bottom 5 Productos Menos Vendidos"
      subtitle="Ítems con menor rotación y demanda física de unidades"
      icon={AlertTriangle}
      badge="Atención / Stock"
      infoText="Productos con baja rotación de stock que requieren planes promocionales o liquidación para no inmovilizar capital."
      height="300px"
    >
      <Bar data={data} options={options} />
    </ChartContainer>
  );
};
