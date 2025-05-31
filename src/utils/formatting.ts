// src/utils/formatting.ts
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatCurrency = (value: number | null | undefined, currency = 'COP', locale = 'es-CO'): string => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0, // O 2 si siempre quieres decimales para COP
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (dateString: string | null | undefined, locale = 'es-CO'): string => {
    if (!dateString) return 'N/A';
    try {
        // Intenta parsear primero como fecha completa (con hora) y luego solo como fecha
        let date = new Date(dateString);
        if (isNaN(date.getTime())) { // Si falla, prueba parseISO (más robusto para YYYY-MM-DD)
                date = parseISO(dateString);
        }
        return format(date, 'dd/MM/yyyy', { locale: es }); // Necesitas importar format y es de date-fns
    } catch (e) {
        console.error("Error formateando fecha:", dateString, e);
        return dateString; // Devuelve el original si falla el formateo
    }
};

function parseISO(dateString: string): Date {
    // Maneja fechas en formato YYYY-MM-DD
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
    if (isoMatch) {
        const [_, year, month, day] = isoMatch;
        // Mes en JS es 0-based
        return new Date(Number(year), Number(month) - 1, Number(day));
    }
    // Si no es formato ISO simple, intenta parsear normalmente
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
        return date;
    }
    throw new Error(`Invalid ISO date string: ${dateString}`);
}

