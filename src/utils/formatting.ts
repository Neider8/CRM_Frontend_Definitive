    // src/utils/formatters.ts
    import { format, parseISO } from 'date-fns';
    import { es } from 'date-fns/locale'; // Importa el locale español

    /**
     * Formatea un valor numérico como moneda (COP por defecto).
     * @param value El valor numérico.
     * @param currency La moneda a usar (ej. 'COP', 'USD').
     * @param locale El locale para el formato.
     * @returns El string formateado.
     */
    export const formatCurrency = (value: number, currency: string = 'COP', locale: string = 'es-CO'): string => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0, // O 2 si siempre quieres decimales para COP
        maximumFractionDigits: 2,
      }).format(value);
    };

    /**
     * Formatea una cadena de fecha a 'dd/MM/yyyy'.
     * @param dateString La cadena de fecha (puede ser ISO o solo fecha).
     * @param locale El locale para el formato.
     * @returns El string de fecha formateado o 'N/A' si es nulo/indefinido.
     */
    export const formatDate = (dateString: string | null | undefined): string => {
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
    