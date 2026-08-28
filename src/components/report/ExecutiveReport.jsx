import React from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Building2, 
  CheckCircle2, 
  TrendingUp, 
  MapPin, 
  Package, 
  Calendar,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatNumber, formatPercent, formatDateDisplay } from '../../utils/formatters';

export const ExecutiveReport = () => {
  const { kpis, filteredDataset, chartsData, insights, filters, uploadStats } = useData();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!filteredDataset || filteredDataset.length === 0) return;

    const headers = ['Fecha', 'Producto', 'Categoría', 'Cantidad', 'Precio_Unitario_PEN', 'Ciudad', 'Total_Venta_PEN'];
    const rows = filteredDataset.map(r => [
      r.fechaRaw,
      `"${r.producto}"`,
      `"${r.categoria}"`,
      r.cantidad,
      r.precio.toFixed(2),
      `"${r.ciudad}"`,
      r.totalVenta.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ejecutivo_datastore_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 mb-12">
      {/* Barra de Acciones del Reporte */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 no-print">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Reporte Ejecutivo de Gestión Comercial
            </h2>
            <p className="text-xs text-slate-400">
              Documento consolidado de Business Intelligence para Dirección General y Gerencia de Operaciones
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Exportar Datos (CSV)</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* Contenedor del Documento Ejecutivo (Estilo Hoja Corporativa) */}
      <div className="glass-panel rounded-2xl p-6 sm:p-10 border border-slate-700/60 dark:border-slate-800/80 bg-slate-900/90 text-slate-100 shadow-2xl print:p-0 print:border-none print:shadow-none">
        
        {/* Cabecera Membretada */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-indigo-500/40 pb-6 mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-cyan-400 font-bold shadow-inner">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">
                DATASTORE S.A.C.
              </h1>
              <p className="text-xs text-indigo-300 font-medium">
                R.U.C. 20601234567 • Informe Oficial de Rendimiento Comercial y BI
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-1 text-slate-400 font-mono">
            <div><strong className="text-slate-300">Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div><strong className="text-slate-300">Registros Auditados:</strong> {formatNumber(filteredDataset.length)} transacciones</div>
            <div><strong className="text-slate-300">Sede Focal:</strong> {filters.selectedCity === 'ALL' ? 'Nivel Nacional (Todas las Sedes)' : filters.selectedCity}</div>
          </div>
        </div>

        {/* Sección A: Resumen General */}
        <section className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">A</span>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Resumen General y Balance Económico
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            El presente informe consolida el rendimiento de ventas generado por <strong>DATASTORE S.A.C.</strong> durante el período filtrado. Con un total acumulado de <strong className="text-white">{formatNumber(kpis.totalTransacciones)} órdenes</strong> procesadas, se ha alcanzado una facturación bruta de <strong className="text-emerald-400">{formatCurrency(kpis.totalVentas)}</strong>, correspondiente a la distribución de <strong className="text-white">{formatNumber(kpis.unidadesVendidas)} unidades</strong> en todo el territorio nacional.
          </p>

          {/* Grid de Métricas A */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Facturación Bruta</span>
              <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono">{formatCurrency(kpis.totalVentas)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Tickets Emitidos</span>
              <span className="text-base sm:text-lg font-bold text-cyan-400 font-mono">{formatNumber(kpis.totalTransacciones)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Unidades Despachadas</span>
              <span className="text-base sm:text-lg font-bold text-indigo-400 font-mono">{formatNumber(kpis.unidadesVendidas)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ticket Promedio Global</span>
              <span className="text-base sm:text-lg font-bold text-amber-400 font-mono">{formatCurrency(kpis.ticketPromedio)}</span>
            </div>
          </div>
        </section>

        {/* Sección B: Principales Resultados */}
        <section className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">B</span>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Principales Resultados por Líneas de Negocio y Territorio
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
            {/* Tabla Resumen Categorías */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <h4 className="font-bold text-slate-200 mb-2 flex items-center space-x-2">
                <Package className="w-4 h-4 text-indigo-400" />
                <span>Desempeño por Categoría de Producto</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th className="py-1">Categoría</th>
                      <th className="py-1 text-right">Venta (S/)</th>
                      <th className="py-1 text-right">Cuota %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {chartsData.categoryDistribution.raw.map((cat) => (
                      <tr key={cat.categoria}>
                        <td className="py-1 font-sans text-slate-300">{cat.categoria}</td>
                        <td className="py-1 text-right text-slate-200">{formatCurrency(cat.totalVentas, true)}</td>
                        <td className="py-1 text-right text-indigo-300">{formatPercent(cat.percentage)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabla Resumen Sedes */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
              <h4 className="font-bold text-slate-200 mb-2 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Desempeño por Sede Regional</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <th className="py-1">Sede</th>
                      <th className="py-1 text-right">Venta (S/)</th>
                      <th className="py-1 text-right">Ticket Prom.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {chartsData.cityPerformance.raw.slice(0, 6).map((city) => (
                      <tr key={city.ciudad}>
                        <td className="py-1 font-sans text-slate-300">{city.ciudad}</td>
                        <td className="py-1 text-right text-slate-200">{formatCurrency(city.totalVentas, true)}</td>
                        <td className="py-1 text-right text-cyan-300">{formatCurrency(city.ticketPromedio)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Sección C: Hallazgos Clave y Decisiones */}
        <section>
          <div className="flex items-center space-x-2 mb-4">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">C</span>
            <h3 className="text-base font-bold text-white uppercase tracking-wide">
              Hallazgos Clave y Decisiones Estratégicas Sugeridas
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {insights.map((ins) => (
              <div key={ins.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/90 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300">{ins.title}</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {ins.category}
                  </span>
                </div>
                <p className="text-slate-300">
                  <strong className="text-emerald-400">Hallazgo:</strong> {ins.resultado.headline}
                </p>
                <p className="text-indigo-200 font-medium">
                  <strong className="text-amber-400">Decisión Propuesta:</strong> {ins.decision}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Firmas de Autorización */}
        <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 gap-8 text-center text-xs text-slate-400">
          <div>
            <div className="w-44 h-0.5 bg-slate-700 mx-auto mb-2"></div>
            <p className="font-bold text-slate-200">Gerencia Comercial y BI</p>
            <p className="text-[10px]">DATASTORE S.A.C.</p>
          </div>
          <div>
            <div className="w-44 h-0.5 bg-slate-700 mx-auto mb-2"></div>
            <p className="font-bold text-slate-200">Dirección General de Operaciones</p>
            <p className="text-[10px]">DATASTORE S.A.C.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
