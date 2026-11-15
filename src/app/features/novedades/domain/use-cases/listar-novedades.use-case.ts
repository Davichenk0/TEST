import { Novedad } from '../entities/novedad.entity';
import { NovedadRepository } from '../repositories/novedad.repository';

export class ListarNovedadesUseCase {
  constructor(private readonly repositorio: NovedadRepository) {}

  execute(): Promise<Novedad[]> {
    return this.repositorio.listar();
  }
}
