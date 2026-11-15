import { Analista } from './analista.entity';
import { Turno, TurnoId } from './turno.entity';

/** Cantidad de semanas que se generan y conservan en la programación. */
export const TOTAL_SEMANAS = 12;

/** Semanas anteriores a la semana en curso que se conservan para consulta. */
export const SEMANAS_HISTORICAS = 4;

export interface AsignacionSemanal {
  analistaId: string;
  turnoId: TurnoId;
}

export interface SemanaProgramacion {
  /** Identificador ISO de la semana, por ejemplo `2026-W46`. */
  id: string;
  anio: number;
  numero: number;
  /** Fecha de inicio (lunes) en formato `YYYY-MM-DD`. */
  inicio: string;
  /** Fecha de fin (domingo) en formato `YYYY-MM-DD`. */
  fin: string;
  asignaciones: AsignacionSemanal[];
}

export interface ParametrosProgramacion {
  /** Lunes de la primera semana generada. */
  fechaBase: string;
  /** Índice de la semana que coincide con la asignación inicial de referencia. */
  indiceReferencia: number;
  analistas: Analista[];
  turnos: Turno[];
}

export interface EstadoProgramacion {
  version: number;
  parametros: ParametrosProgramacion;
  semanas: SemanaProgramacion[];
}

export function asignacionDe(
  semana: SemanaProgramacion,
  analistaId: string,
): AsignacionSemanal | undefined {
  return semana.asignaciones.find((asignacion) => asignacion.analistaId === analistaId);
}
