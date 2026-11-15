import { Novedad } from '../entities/novedad.entity';

export interface NovedadRepository {
  listar(): Promise<Novedad[]>;
  crear(novedad: Novedad): Promise<void>;
  actualizar(novedad: Novedad): Promise<void>;
}
