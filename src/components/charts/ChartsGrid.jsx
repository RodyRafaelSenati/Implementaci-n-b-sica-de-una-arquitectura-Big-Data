import React from 'react';
import { SalesTrendChart } from './SalesTrendChart';
import { CategoryDonutChart } from './CategoryDonutChart';
import { TopProductsChart } from './TopProductsChart';
import { BottomProductsChart } from './BottomProductsChart';
import { CityPerformanceChart } from './CityPerformanceChart';
import { CategoryVolumeChart } from './CategoryVolumeChart';
import { CityCategoryMatrixChart } from './CityCategoryMatrixChart';
import { CityTicketRadarChart } from './CityTicketRadarChart';
import { BarChart3 } from 'lucide-react';

export const ChartsGrid = () => {
  return (
    <div className="space-y-6 mb-8">
      {/* Encabezado de Sección */}
      <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-800/80">
        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            Grid de 8 Gráficos Estadísticos & Visualización BI
          </h2>
          <p className="text-xs text-slate-400">
            Análisis multidimensional de series temporales, categorías, productos y sedes comerciales
          </p>
        </div>
      </div>

      {/* Grid de 8 Gráficos (2 columnas en desktop para máximo detalle) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Fila 1: Temporal y Categorías */}
        <SalesTrendChart />
        <CategoryDonutChart />

        {/* Fila 2: Top y Bottom Productos */}
        <TopProductsChart />
        <BottomProductsChart />

        {/* Fila 3: Rendimiento por Ciudad y Volumen Físico */}
        <CityPerformanceChart />
        <CategoryVolumeChart />

        {/* Fila 4: Matriz Ciudad vs Categoría y Radar de Ticket Promedio */}
        <CityCategoryMatrixChart />
        <CityTicketRadarChart />

      </div>
    </div>
  );
};
