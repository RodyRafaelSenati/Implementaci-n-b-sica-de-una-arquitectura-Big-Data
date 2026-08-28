/**
 * Utilidades de formateo para el Dashboard Empresarial DATASTORE S.A.C.
 */

// Formateo de Moneda en Soles Peruanos (S/)
export const formatCurrency = (amount, compact = false) => {
  if (amount === undefined || amount === null || isNaN(amount)) return 'S/ 0.00';
  
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `S/ ${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (compact && Math.abs(amount) >= 1_000) {
    return `S/ ${(amount / 1_000).toFixed(1)}k`;
  }

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('PEN', 'S/').trim();
};

// Formateo de Números enteros o decimales con separadores de miles
export const formatNumber = (num, decimals = 0) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
};

// Formateo de Porcentajes
export const formatPercent = (value, decimals = 1) => {
  if (value === undefined || value === null || isNaN(value)) return '0.0%';
  return `${(value).toFixed(decimals)}%`;
};

// Parser robusto para fechas en formato DD/MM/YYYY
export const parseDateDDMMYYYY = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) {
    // Intentar con guión si viene YYYY-MM-DD o DD-MM-YYYY
    const hyphenParts = dateStr.trim().split('-');
    if (hyphenParts.length === 3) {
      if (hyphenParts[0].length === 4) {
        return new Date(parseInt(hyphenParts[0]), parseInt(hyphenParts[1]) - 1, parseInt(hyphenParts[2]));
      } else {
        return new Date(parseInt(hyphenParts[2]), parseInt(hyphenParts[1]) - 1, parseInt(hyphenParts[0]));
      }
    }
    return null;
  }
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed en JS
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
};

// Formatear Date a string DD/MM/YYYY
export const formatDateDisplay = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Formatear Date a string YYYY-MM-DD para inputs de tipo date
export const formatDateInput = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

// Nombres de meses en español
export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MONTH_NAMES_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'
];
