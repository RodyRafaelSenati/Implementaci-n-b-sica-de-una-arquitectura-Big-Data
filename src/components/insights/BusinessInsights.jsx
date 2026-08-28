import React from 'react';
import { 
  Lightbulb, 
  Boxes, 
  TrendingUp, 
  MapPin, 
  CalendarCheck, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Sparkles
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export const BusinessInsights = () => {
  const { insights } = useData();

  const iconMap = {
    Boxes: Boxes,
    TrendingUp: TrendingUp,
    MapPin: MapPin,
    CalendarCheck: CalendarCheck
  };

  const badgeColorMap = {
    emerald: {
      border: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      tagBg: 'bg-emerald-500/15 text-emerald-300',
      accentGlow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10'
    },
    amber: {
      border: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      tagBg: 'bg-amber-500/15 text-amber-300',
      accentGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/10'
    },
    indigo: {
      border: 'border-indigo-500/30',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      tagBg: 'bg-indigo-500/15 text-indigo-300',
      accentGlow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10'
    },
    purple: {
      border: 'border-purple-500/30',
      badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      tagBg: 'bg-purple-500/15 text-purple-300',
      accentGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/10'
    }
  };

  return (
    <div className="space-y-6 mb-8">
      {/* Encabezado del Módulo de Insights */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 text-amber-400 border border-amber-500/30 shadow-md">
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse-subtle" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Módulo de Análisis e Insights Estratégicos</span>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase">
                Metodología R-I-D
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Marco de Inteligencia de Negocios: <strong className="text-emerald-400">[RESULTADO]</strong> → <strong className="text-cyan-400">[INTERPRETACIÓN]</strong> → <strong className="text-indigo-400">[DECISIÓN PROPUESTA]</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Tarjetas de Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((item) => {
          const IconComponent = iconMap[item.iconName] || Lightbulb;
          const colors = badgeColorMap[item.badgeColor] || badgeColorMap.indigo;

          return (
            <div
              key={item.id}
              className={`glass-panel rounded-2xl p-6 border ${colors.border} bg-slate-900/80 dark:bg-slate-900/70 shadow-xl transition-all duration-300 ${colors.accentGlow} flex flex-col justify-between`}
            >
              <div>
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2.5 rounded-xl border ${colors.badgeBg} mt-0.5`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-1 ${colors.tagBg}`}>
                        {item.category}
                      </span>
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Pregunta Estratégica */}
                <div className="mb-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center space-x-2">
                  <Target className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{item.question}</span>
                </div>

                {/* Paso 1: [RESULTADO] */}
                <div className="mb-3.5 space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      [RESULTADO]
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">Datos cuantitativos procesados</span>
                  </div>
                  <p className="text-xs text-slate-200 pl-2 border-l-2 border-emerald-500/50 leading-relaxed font-medium">
                    {item.resultado.headline}
                  </p>
                  {item.resultado.submetric && (
                    <div className="text-[11px] text-slate-400 pl-2 font-mono">
                      ↳ {item.resultado.submetric}
                    </div>
                  )}
                </div>

                {/* Paso 2: [INTERPRETACIÓN] */}
                <div className="mb-3.5 space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                      [INTERPRETACIÓN]
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">Análisis cualitativo y causa raíz</span>
                  </div>
                  <p className="text-xs text-slate-300 pl-2 border-l-2 border-cyan-500/50 leading-relaxed">
                    {item.interpretacion}
                  </p>
                </div>

                {/* Paso 3: [DECISIÓN PROPUESTA] */}
                <div className="space-y-1.5 mt-4 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-indigo-500 text-white shadow-sm">
                      [DECISIÓN PROPUESTA]
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-300 flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Acción Estratégica Recomendada</span>
                    </span>
                  </div>
                  <p className="text-xs text-indigo-100 font-medium leading-relaxed pt-1">
                    {item.decision}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
