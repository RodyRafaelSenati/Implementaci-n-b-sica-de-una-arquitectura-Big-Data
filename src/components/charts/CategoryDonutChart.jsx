import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { PieChart } from 'lucide-react';
import { ChartContainer } from './ChartContainer';
import { useData } from '../../context/DataContext';
import { PALETTE, getBaseTooltipOptions } from './chartConfig';
import { formatCurrency, formatPercent, formatNumber } from '../../utils/formatters';

export const CategoryDonutChart = () => {
  const { chartsData, theme } = useData();
  const { labels, ventas, percentages, unidades } = chartsData.categoryDistribution;
  const isDark = theme === 'dark';

  const data = {
    labels: labels || [],
    datasets: [
      {
        data: ventas || [],
        backgroundColor: PALETTE.slice(0, labels.length),
        borderColor: isDark ? '#0f172a' : '#ffffff',
        borderWidth: 2.5,
        hoverOffset: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: isDark ? '#cbd5e1' : '#334155',
          font: { family: 'Inter', size: 11, weight: '500' },
          padding: 14,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        ...getBaseTooltipOptions(isDark),
        callbacks: {
          label: (context) => {
            const index = context.dataIndex;
            const val = context.raw;
            const pct = percentages[index];
            const units = unidades[index];
            return [
              ` Ingresos: ${formatCurrency(val)}`,
              ` Participación: ${formatPercent(pct)}`,
              ` Unidades: ${formatNumber(units)} u.`
            ];
          }
        }
      }
    }
  };

  return (
    <ChartContainer
      title="2. Distribución de Ingresos por Categoría"
      subtitle="Porcentaje de participación económica y facturación"
      icon={PieChart}
      badge="Donut / Cuota"
      infoText="Analiza la contribución porcentual al ingreso total según la línea de productos de DATASTORE S.A.C."
      height="300px"
    >
      <Doughnut data={data} options={options} />
    </ChartContainer>
  );
};
