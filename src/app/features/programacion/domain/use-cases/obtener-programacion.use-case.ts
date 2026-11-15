import { EstadoProgramacion } from '../entities/programacion.entity';
import { ProgramacionRepository } from '../repositories/programacion.repository';

export class ObtenerProgramacionUseCase {
  constructor(private readonly repositorio: ProgramacionRepository) {}

  execute(): Promise<EstadoProgramacion> {
    return this.repositorio.obtener();
  }
}
