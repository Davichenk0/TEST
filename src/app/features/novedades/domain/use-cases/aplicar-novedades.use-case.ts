import {
  SemanaProgramacion,
} from '../../../programacion/domain/entities/programacion.entity';
import { TurnoId } from '../../../programacion/domain/entities/turno.entity';
import { Novedad } from '../entities/novedad.entity';

export interface AsignacionAjustada {
  analistaId: string;
  /** Turno efectivo: refleja las novedades aprobadas de la semana. */
  turnoId: TurnoId;
  /** Turno previsto originalmente; nunca se elimina. */
  turnoOriginalId: TurnoId;
  novedadAprobada: Novedad | null;
  novedadPendiente: Novedad | null;
}

export interface SemanaAjustada {
  semana: SemanaProgramacion;
  asignaciones: AsignacionAjustada[];
  /** Novedades aprobadas de la semana (coberturas activas). */
  coberturas: Novedad[];
  tienePendientes: boolean;
}

/**
 * Combina la programación base con las novedades de la semana. Solo las
 * novedades aprobadas modifican el turno efectivo; las pendientes se informan
 * sin alterar la programación vigente.
 */
export function aplicarNovedades(
  semana: SemanaProgramacion,
  novedades: Novedad[],
): SemanaAjustada {
  const deLaSemana = novedades.filter((novedad) => novedad.semanaId === semana.id);
  const aprobadas = deLaSemana.filter((novedad) => novedad.estado === 'aprobada');
  const pendientes = deLaSemana.filter((novedad) => novedad.estado === 'pendiente');

  const aprobadasPorAnalista = new Map(
    aprobadas.map((novedad) => [novedad.analistaAfectadoId, novedad]),
  );
  const pendientesPorAnalista = new Map(
    pendientes.map((novedad) => [novedad.analistaAfectadoId, novedad]),
  );

  return {
    semana,
    asignaciones: semana.asignaciones.map((asignacion) => {
      const aprobada = aprobadasPorAnalista.get(asignacion.analistaId) ?? null;

      return {
        analistaId: asignacion.analistaId,
        turnoOriginalId: asignacion.turnoId,
        turnoId: aprobada ? aprobada.turnoReorganizadoId : asignacion.turnoId,
        novedadAprobada: aprobada,
        novedadPendiente: pendientesPorAnalista.get(asignacion.analistaId) ?? null,
      };
    }),
    coberturas: aprobadas,
    tienePendientes: pendientes.length > 0,
  };
}
