import { Injectable } from '@angular/core';

import { estaEnRango, hoyIso } from '../../../../core/utils/fecha.util';
import { EstadoProgramacion } from '../../domain/entities/programacion.entity';
import { ProgramacionRepository } from '../../domain/repositories/programacion.repository';
import { ProgramacionMapper } from '../mappers/programacion.mapper';
import { crearEstadoInicial, recentrarProgramacion } from '../seed/programacion.seed';

const CLAVE_ALMACENAMIENTO = 'sicov-ci2.programacion.v2';

@Injectable({ providedIn: 'root' })
export class ProgramacionLocalRepository implements ProgramacionRepository {
  async obtener(): Promise<EstadoProgramacion> {
    const estado = this.leer();

    if (estado && this.contieneSemanaActual(estado)) {
      return estado;
    }

    const actualizado = estado ? recentrarProgramacion(estado) : crearEstadoInicial();
    this.escribir(actualizado);

    return actualizado;
  }

  async guardar(estado: EstadoProgramacion): Promise<void> {
    this.escribir(estado);
  }

  private contieneSemanaActual(estado: EstadoProgramacion): boolean {
    const hoy = hoyIso();
    return estado.semanas.some((semana) => estaEnRango(hoy, semana.inicio, semana.fin));
  }

  private leer(): EstadoProgramacion | null {
    try {
      const crudo = localStorage.getItem(CLAVE_ALMACENAMIENTO);
      return crudo ? ProgramacionMapper.desdeDto(JSON.parse(crudo)) : null;
    } catch {
      return null;
    }
  }

  private escribir(estado: EstadoProgramacion): void {
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(ProgramacionMapper.aDto(estado)));
    } catch {
      // Almacenamiento no disponible: la sesión continúa en memoria.
    }
  }
}
