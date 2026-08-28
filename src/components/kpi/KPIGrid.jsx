import React from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Trophy, 
  Building2,
  TrendingUp
} from 'lucide-react';
import { KPICard } from './KPICard';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';

export const KPIGrid = () => {
  const { kpis, filteredDataset } = useData();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      
      {/* 1. Total de Ventas */}
      <KPICard
        title="Total de Ventas"
        value={formatCurrency(kpis.totalVentas)}
        subtitle="Ingreso Bruto Total S/"
        icon={DollarSign}
        accentColor="indigo"
        badge="100% Facturación"
        badgeType="highlight"
      />

      {/* 2. Total Transacciones */}
      <KPICard
        title="Transacciones"
        value={formatNumber(kpis.totalTransacciones)}
        subtitle="Tickets Emitidos"
        icon={ShoppingCart}
        accentColor="cyan"
        badge={`${formatNumber(kpis.totalTransacciones)} ops`}
        badgeType="positive"
      />

      {/* 3. Unidades Vendidas */}
      <KPICard
        title="Unidades Vendidas"
        value={formatNumber(kpis.unidadesVendidas)}
        subtitle="Volumen Físico Total"
        icon={Package}
        accentColor="emerald"
        badge="Despachos"
        badgeType="positive"
      />

      {/* 4. Ticket Promedio */}
      <KPICard
        title="Ticket Promedio"
        value={formatCurrency(kpis.ticketPromedio)}
        subtitle="Venta Promedio / Orden"
        icon={CreditCard}
        accentColor="amber"
        badge="Por Transacción"
        badgeType="neutral"
      />

      {/* 5. Producto Top */}
      <KPICard
        title="Producto Top"
        value={kpis.productoTop.nombre}
        subtitle={formatCurrency(kpis.productoTop.totalVentas)}
        icon={Trophy}
        accentColor="purple"
        badge={`${formatPercent(kpis.productoTop.share)} share`}
        badgeType="highlight"
      />

      {/* 6. Sede Líder */}
      <KPICard
        title="Sede Líder"
        value={kpis.sedeLider.ciudad}
        subtitle={formatCurrency(kpis.sedeLider.totalVentas)}
        icon={Building2}
        accentColor="rose"
        badge={`${formatPercent(kpis.sedeLider.share)} cuota`}
        badgeType="positive"
      />

    </div>
  );
};
