import { EstadoProgramacion } from '../entities/programacion.entity';

/**
 * Puerto de persistencia de la programación. La implementación concreta vive
 * en infraestructura (localStorage, HTTP, Excel, SharePoint, etc.).
 */
export interface ProgramacionRepository {
  obtener(): Promise<EstadoProgramacion>;
  guardar(estado: EstadoProgramacion): Promise<void>;
}
