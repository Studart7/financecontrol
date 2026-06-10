export const parseDateString = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  
  // Format 1: YYYY-MM-DD
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [y, m, d] = dateStr.split('-');
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  }

  // Format 2: DD Mmm YYYY (e.g. 05 Jun 2026 or 05 jun de 2026)
  const months: Record<string, number> = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
  const cleanStr = dateStr.toLowerCase().replace(/ de /g, ' ').replace(/\./g, '').trim();
  const parts = cleanStr.split(' ');
  
  if (parts.length >= 3) {
    const d = parseInt(parts[0], 10);
    const monthStr = parts.find(p => months[p] !== undefined);
    const m = monthStr ? months[monthStr] : 0;
    const y = parseInt(parts[parts.length - 1], 10);
    
    if (!isNaN(d) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }

  // Fallback
  const fallback = new Date(dateStr);
  if (!isNaN(fallback.getTime())) return fallback;
  
  return null;
};

export const isCurrentMonth = (dateStr: string): boolean => {
  const date = parseDateString(dateStr);
  if (!date) return true; // If we can't parse, include it just in case
  
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

export const isMonthMatch = (dateStr: string, month: number, year: number): boolean => {
  const date = parseDateString(dateStr);
  if (!date) return true;
  return date.getMonth() === month && date.getFullYear() === year;
};

export const MONTH_NAMES_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

export const MONTH_NAMES_SHORT_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
