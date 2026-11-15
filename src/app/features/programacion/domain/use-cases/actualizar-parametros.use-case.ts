import {
  EstadoProgramacion,
  ParametrosProgramacion,
} from '../entities/programacion.entity';
import { TurnoId } from '../entities/turno.entity';
import { ProgramacionRepository } from '../repositories/programacion.repository';
import { generarSemanas } from './generar-programacion.use-case';

export interface CambioTurnoInicial {
  analistaId: string;
  turnoId: TurnoId;
}

/**
 * Actualiza la asignación inicial de referencia de uno o varios analistas y
 * recalcula toda la rotación conservando el rango de semanas.
 */
export class ActualizarParametrosUseCase {
  constructor(private readonly repositorio: ProgramacionRepository) {}

  async execute(cambios: CambioTurnoInicial[]): Promise<EstadoProgramacion> {
    const estado = await this.repositorio.obtener();
    const cambiosPorAnalista = new Map(cambios.map((cambio) => [cambio.analistaId, cambio.turnoId]));

    const parametros: ParametrosProgramacion = {
      ...estado.parametros,
      analistas: estado.parametros.analistas.map((analista) => {
        const turnoId = cambiosPorAnalista.get(analista.id);
        return turnoId ? { ...analista, turnoInicial: turnoId } : analista;
      }),
    };

    const actualizado: EstadoProgramacion = {
      ...estado,
      parametros,
      semanas: generarSemanas(parametros),
    };

    await this.repositorio.guardar(actualizado);
    return actualizado;
  }
}
