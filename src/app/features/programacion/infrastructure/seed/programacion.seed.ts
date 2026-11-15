import { aIso, inicioSemana, sumarSemanas } from '../../../../core/utils/fecha.util';
import {
  EstadoProgramacion,
  ParametrosProgramacion,
  SEMANAS_HISTORICAS,
  SemanaProgramacion,
} from '../../domain/entities/programacion.entity';
import { TURNOS } from '../../domain/entities/turno.entity';
import { generarSemanas } from '../../domain/use-cases/generar-programacion.use-case';
import { ANALISTAS_SEED } from './analistas.seed';

export const VERSION_PROGRAMACION = 1;

export function crearParametrosIniciales(hoy = new Date()): ParametrosProgramacion {
  return {
    fechaBase: aIso(sumarSemanas(inicioSemana(hoy), -SEMANAS_HISTORICAS)),
    indiceReferencia: SEMANAS_HISTORICAS,
    analistas: ANALISTAS_SEED.map((analista) => ({ ...analista })),
    turnos: TURNOS.map((turno) => ({ ...turno })),
  };
}

export function crearEstadoInicial(hoy = new Date()): EstadoProgramacion {
  const parametros = crearParametrosIniciales(hoy);

  return {
    version: VERSION_PROGRAMACION,
    parametros,
    semanas: generarSemanas(parametros),
  };
}

/**
 * Desplaza la ventana de programación para que siempre incluya la semana actual,
 * conservando los parámetros y las asignaciones iniciales configuradas.
 */
export function recentrarProgramacion(
  estado: EstadoProgramacion,
  hoy = new Date(),
): EstadoProgramacion {
  const parametros: ParametrosProgramacion = {
    ...estado.parametros,
    fechaBase: aIso(sumarSemanas(inicioSemana(hoy), -SEMANAS_HISTORICAS)),
    indiceReferencia: SEMANAS_HISTORICAS,
  };

  return {
    ...estado,
    parametros,
    semanas: generarSemanas(parametros),
  };
}

export function semanaContieneFecha(semana: SemanaProgramacion, fechaIso: string): boolean {
  return fechaIso >= semana.inicio && fechaIso <= semana.fin;
}
