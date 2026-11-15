import { hoyIso } from '../../../../core/utils/fecha.util';
import { NuevaNovedad, Novedad } from '../entities/novedad.entity';
import { NovedadRepository } from '../repositories/novedad.repository';

function generarId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `n-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

/**
 * Registra una novedad en estado pendiente. No aplica cambios a la
 * programación: la reorganización solo se refleja cuando el jefe inmediato
 * aprueba la solicitud (regla de control del informe funcional).
 */
export class RegistrarNovedadUseCase {
  constructor(private readonly repositorio: NovedadRepository) {}

  async execute(nueva: NuevaNovedad): Promise<Novedad> {
    this.validar(nueva);

    const novedad: Novedad = {
      id: generarId(),
      fechaReporte: nueva.fechaReporte ?? hoyIso(),
      semanaId: nueva.semanaId,
      analistaAfectadoId: nueva.analistaAfectadoId,
      turnoOriginalId: nueva.turnoOriginalId,
      tipo: nueva.tipo,
      detalle: nueva.detalle.trim(),
      analistaCoberturaId: nueva.analistaCoberturaId,
      turnoReorganizadoId: nueva.turnoReorganizadoId,
      estado: 'pendiente',
      gestionadoPor: null,
      fechaGestion: null,
      observaciones: nueva.observaciones.trim(),
    };

    await this.repositorio.crear(novedad);
    return novedad;
  }

  private validar(nueva: NuevaNovedad): void {
    if (!nueva.semanaId) {
      throw new Error('Debes seleccionar la semana de la novedad.');
    }

    if (!nueva.analistaAfectadoId) {
      throw new Error('Debes seleccionar el analista afectado.');
    }

    if (!nueva.analistaCoberturaId) {
      throw new Error('Debes indicar el analista que cubre el turno.');
    }

    if (nueva.analistaAfectadoId === nueva.analistaCoberturaId) {
      throw new Error('El analista que cubre debe ser diferente al analista afectado.');
    }

    if (nueva.detalle.trim().length < 10) {
      throw new Error('El detalle de la novedad debe tener al menos 10 caracteres.');
    }
  }
}
