import { hoyIso } from '../../../../core/utils/fecha.util';
import { EstadoNovedad, Novedad } from '../entities/novedad.entity';
import { NovedadRepository } from '../repositories/novedad.repository';

export type DecisionNovedad = Extract<EstadoNovedad, 'aprobada' | 'rechazada'>;

/**
 * Resuelve una novedad pendiente conservando siempre el turno original en el
 * registro histórico y dejando trazabilidad del aprobador.
 */
export class ResolverNovedadUseCase {
  constructor(private readonly repositorio: NovedadRepository) {}

  async execute(
    id: string,
    decision: DecisionNovedad,
    gestionadoPor: string,
    observaciones = '',
  ): Promise<Novedad> {
    const novedades = await this.repositorio.listar();
    const novedad = novedades.find((item) => item.id === id);

    if (!novedad) {
      throw new Error('La novedad no existe o fue eliminada.');
    }

    if (novedad.estado !== 'pendiente') {
      throw new Error('Solo se pueden gestionar novedades pendientes.');
    }

    if (decision === 'rechazada' && observaciones.trim().length < 5) {
      throw new Error('Debes registrar el motivo del rechazo (mínimo 5 caracteres).');
    }

    const actualizada: Novedad = {
      ...novedad,
      estado: decision,
      gestionadoPor,
      fechaGestion: hoyIso(),
      observaciones: observaciones.trim() || novedad.observaciones,
    };

    await this.repositorio.actualizar(actualizada);
    return actualizada;
  }
}
