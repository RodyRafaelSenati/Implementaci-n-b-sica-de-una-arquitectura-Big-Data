import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registrar todos los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Paleta corporativa de colores para gráficos
export const CHART_COLORS = {
  indigo: '#6366f1',
  indigoLight: 'rgba(99, 102, 241, 0.2)',
  cyan: '#06b6d4',
  cyanLight: 'rgba(6, 182, 212, 0.2)',
  emerald: '#10b981',
  emeraldLight: 'rgba(16, 185, 129, 0.2)',
  amber: '#f59e0b',
  amberLight: 'rgba(245, 158, 11, 0.2)',
  purple: '#8b5cf6',
  purpleLight: 'rgba(139, 92, 246, 0.2)',
  rose: '#f43f5e',
  roseLight: 'rgba(244, 63, 94, 0.2)',
  blue: '#3b82f6',
  teal: '#14b8a6',
  slate: '#64748b'
};

export const PALETTE = [
  '#6366f1', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#14b8a6', // Teal
  '#eab308', // Yellow
  '#ec4899', // Pink
];

// Opciones base de Tooltip oscuro corporativo
export const getBaseTooltipOptions = (isDark = true) => ({
  backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
  titleColor: isDark ? '#f8fafc' : '#0f172a',
  bodyColor: isDark ? '#cbd5e1' : '#334155',
  borderColor: isDark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(226, 232, 240, 0.9)',
  borderWidth: 1,
  padding: 12,
  boxPadding: 6,
  usePointStyle: true,
  cornerRadius: 10,
  titleFont: {
    family: 'Inter, sans-serif',
    size: 12,
    weight: 'bold'
  },
  bodyFont: {
    family: 'Inter, sans-serif',
    size: 11
  }
});
