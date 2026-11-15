const MS_POR_DIA = 86_400_000;

/** Devuelve una copia de la fecha a medianoche local. */
export function soloFecha(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

/** Lunes de la semana ISO a la que pertenece la fecha. */
export function inicioSemana(fecha: Date): Date {
  const base = soloFecha(fecha);
  const dia = base.getDay();
  const desplazamiento = dia === 0 ? -6 : 1 - dia;
  base.setDate(base.getDate() + desplazamiento);
  return base;
}

export function sumarDias(fecha: Date, dias: number): Date {
  const resultado = soloFecha(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

export function sumarSemanas(fecha: Date, semanas: number): Date {
  return sumarDias(fecha, semanas * 7);
}

/** Serializa una fecha local como `YYYY-MM-DD` sin conversión de zona horaria. */
export function aIso(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const dia = `${fecha.getDate()}`.padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

/** Convierte `YYYY-MM-DD` en una fecha local (evita el desfase de `new Date(iso)`). */
export function desdeIso(iso: string): Date {
  const [anio, mes, dia] = iso.slice(0, 10).split('-').map(Number);
  return new Date(anio, (mes ?? 1) - 1, dia ?? 1);
}

export function hoyIso(): string {
  return aIso(new Date());
}

/** Año ISO de la semana (puede diferir del año calendario en enero y diciembre). */
export function anioSemanaIso(fecha: Date): number {
  const objetivo = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dia = objetivo.getUTCDay() || 7;
  objetivo.setUTCDate(objetivo.getUTCDate() + 4 - dia);
  return objetivo.getUTCFullYear();
}

/** Número de semana ISO 8601 (1 a 53). */
export function numeroSemanaIso(fecha: Date): number {
  const objetivo = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()));
  const dia = objetivo.getUTCDay() || 7;
  objetivo.setUTCDate(objetivo.getUTCDate() + 4 - dia);
  const inicioAnio = new Date(Date.UTC(objetivo.getUTCFullYear(), 0, 1));
  return Math.ceil(((objetivo.getTime() - inicioAnio.getTime()) / MS_POR_DIA + 1) / 7);
}

export function idSemana(fecha: Date): string {
  const numero = `${numeroSemanaIso(fecha)}`.padStart(2, '0');
  return `${anioSemanaIso(fecha)}-W${numero}`;
}

export function estaEnRango(fecha: string, inicio: string, fin: string): boolean {
  return fecha >= inicio && fecha <= fin;
}

const FORMATO_DIA_MES = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });
const FORMATO_DIA_MES_ANIO = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** Etiqueta legible de un rango semanal: `9 – 15 nov 2026`. */
export function etiquetaRango(inicio: string, fin: string): string {
  const desde = desdeIso(inicio);
  const hasta = desdeIso(fin);
  const mismoMes = desde.getMonth() === hasta.getMonth();
  const mismoAnio = desde.getFullYear() === hasta.getFullYear();

  if (mismoMes && mismoAnio) {
    return `${desde.getDate()} – ${FORMATO_DIA_MES_ANIO.format(hasta)}`;
  }

  if (mismoAnio) {
    return `${FORMATO_DIA_MES.format(desde)} – ${FORMATO_DIA_MES_ANIO.format(hasta)}`;
  }

  return `${FORMATO_DIA_MES_ANIO.format(desde)} – ${FORMATO_DIA_MES_ANIO.format(hasta)}`;
}

export function formatearFecha(iso: string, formato: 'corta' | 'media' | 'larga' = 'media'): string {
  const fecha = desdeIso(iso);

  if (formato === 'corta') {
    return FORMATO_DIA_MES.format(fecha);
  }

  if (formato === 'larga') {
    return new Intl.DateTimeFormat('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(fecha);
  }

  return FORMATO_DIA_MES_ANIO.format(fecha);
}

export function saludoSegunHora(fecha = new Date()): string {
  const hora = fecha.getHours();

  if (hora < 12) {
    return 'Buenos días';
  }

  if (hora < 19) {
    return 'Buenas tardes';
  }

  return 'Buenas noches';
}

export function nombrePila(nombreCompleto: string): string {
  return nombreCompleto.trim().split(/\s+/)[0] ?? nombreCompleto;
}
