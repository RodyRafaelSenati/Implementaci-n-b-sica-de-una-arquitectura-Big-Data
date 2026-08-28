import React from 'react';

export const KPICard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  accentColor = 'indigo', // 'indigo', 'emerald', 'cyan', 'amber', 'purple', 'rose'
  badge,
  badgeType = 'positive', // 'positive', 'neutral', 'highlight'
  onClick
}) => {
  const colorMap = {
    indigo: {
      bgIcon: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      borderGlow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
      gradient: 'from-indigo-500/10 via-transparent to-transparent'
    },
    emerald: {
      bgIcon: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      borderGlow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      gradient: 'from-emerald-500/10 via-transparent to-transparent'
    },
    cyan: {
      bgIcon: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      borderGlow: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
      gradient: 'from-cyan-500/10 via-transparent to-transparent'
    },
    amber: {
      bgIcon: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      borderGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
      gradient: 'from-amber-500/10 via-transparent to-transparent'
    },
    purple: {
      bgIcon: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      borderGlow: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
      gradient: 'from-purple-500/10 via-transparent to-transparent'
    },
    rose: {
      bgIcon: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      borderGlow: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
      gradient: 'from-rose-500/10 via-transparent to-transparent'
    }
  };

  const scheme = colorMap[accentColor] || colorMap.indigo;

  return (
    <div 
      onClick={onClick}
      className={`glass-panel relative overflow-hidden rounded-2xl p-5 border border-slate-700/50 dark:border-slate-800/80 bg-slate-900/80 dark:bg-slate-900/60 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${scheme.borderGlow} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Sutil gradiente de fondo */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${scheme.gradient} rounded-full blur-2xl pointer-events-none -mr-8 -mt-8`} />

      <div className="relative z-10">
        {/* Cabecera de la tarjeta */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          {Icon && (
            <div className={`p-2.5 rounded-xl border ${scheme.bgIcon}`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Valor Principal */}
        <div className="mb-2">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
            {value}
          </h3>
        </div>

        {/* Footer / Subtítulo y Badge */}
        <div className="flex items-center justify-between text-xs pt-1">
          <p className="text-slate-400 font-medium truncate max-w-[65%]">
            {subtitle}
          </p>

          {badge && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${
              badgeType === 'positive'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : badgeType === 'highlight'
                ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
