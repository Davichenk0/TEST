import { Analista } from '../../domain/entities/analista.entity';

/**
 * Asignación inicial de referencia definida en el informe funcional (sección 6).
 * El equipo se mantiene en una constante para poder sustituirlo por la hoja
 * de parámetros cuando exista una fuente corporativa.
 */
export const ANALISTAS_SEED: Analista[] = [
  { id: 'a1', nombre: 'David Gonzalo Cajamarca Torres', turnoInicial: 1, activo: true },
  { id: 'a2', nombre: 'Analista 2', turnoInicial: 2, activo: true },
  { id: 'a3', nombre: 'Analista 3', turnoInicial: 3, activo: true },
  { id: 'a4', nombre: 'Analista 4', turnoInicial: 4, activo: true },
  { id: 'a5', nombre: 'Analista 5', turnoInicial: 5, activo: true },
];
