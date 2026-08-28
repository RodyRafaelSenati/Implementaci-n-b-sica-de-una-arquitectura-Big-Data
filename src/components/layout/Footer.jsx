import React from 'react';
import { Building2, ShieldCheck, Database, Server } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { formatNumber } from '../../utils/formatters';

export const Footer = () => {
  const { rawDataset } = useData();

  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 text-slate-400 text-xs py-6 mt-12 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Info Corporativa */}
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-200">DATASTORE S.A.C.</span> • Enterprise BI & Big Data Analytics
            <p className="text-[11px] text-slate-500">
              Sistema de monitoreo comercial y analítica de datos en tiempo real © 2026. Todos los derechos reservados.
            </p>
          </div>
        </div>

        {/* Badges de Estado del Sistema */}
        <div className="flex items-center space-x-4 text-[11px]">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>HDFS Distributed Cluster + MongoDB NoSQL</span>
          </div>

          <div className="flex items-center space-x-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Pipeline Auditado ({formatNumber(rawDataset.length)} documentos)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
