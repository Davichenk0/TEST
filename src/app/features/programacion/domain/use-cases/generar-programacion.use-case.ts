import {
  aIso,
  anioSemanaIso,
  desdeIso,
  idSemana,
  numeroSemanaIso,
  sumarDias,
  sumarSemanas,
} from '../../../../core/utils/fecha.util';
import {
  ParametrosProgramacion,
  SemanaProgramacion,
  TOTAL_SEMANAS,
} from '../entities/programacion.entity';
import { turnoConDesplazamiento } from '../entities/turno.entity';

/**
 * Genera la programación semanal aplicando la rotación cíclica de cinco turnos.
 * Es una función pura: mismas entradas, misma programación.
 */
export function generarSemanas(parametros: ParametrosProgramacion): SemanaProgramacion[] {
  const fechaBase = desdeIso(parametros.fechaBase);
  const analistasActivos = parametros.analistas.filter((analista) => analista.activo);

  return Array.from({ length: TOTAL_SEMANAS }, (_, indice) => {
    const inicio = sumarSemanas(fechaBase, indice);
    const fin = sumarDias(inicio, 6);
    const desplazamiento = indice - parametros.indiceReferencia;

    return {
      id: idSemana(inicio),
      anio: anioSemanaIso(inicio),
      numero: numeroSemanaIso(inicio),
      inicio: aIso(inicio),
      fin: aIso(fin),
      asignaciones: analistasActivos.map((analista) => ({
        analistaId: analista.id,
        turnoId: turnoConDesplazamiento(analista.turnoInicial, desplazamiento),
      })),
    };
  });
}
