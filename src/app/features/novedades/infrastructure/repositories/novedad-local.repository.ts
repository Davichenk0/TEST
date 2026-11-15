import { Injectable } from '@angular/core';

import { Novedad } from '../../domain/entities/novedad.entity';
import { NovedadRepository } from '../../domain/repositories/novedad.repository';
import { NovedadMapper } from '../mappers/novedad.mapper';
import { crearNovedadesIniciales } from '../seed/novedades.seed';

const CLAVE_ALMACENAMIENTO = 'sicov-ci2.novedades.v1';

@Injectable({ providedIn: 'root' })
export class NovedadLocalRepository implements NovedadRepository {
  async listar(): Promise<Novedad[]> {
    const novedades = this.leer();

    if (novedades) {
      return novedades;
    }

    const iniciales = crearNovedadesIniciales();
    this.escribir(iniciales);
    return iniciales;
  }

  async crear(novedad: Novedad): Promise<void> {
    const novedades = (await this.listar()).filter((item) => item.id !== novedad.id);
    this.escribir([novedad, ...novedades]);
  }

  async actualizar(novedad: Novedad): Promise<void> {
    const novedades = await this.listar();
    const actualizadas = novedades.some((item) => item.id === novedad.id)
      ? novedades.map((item) => (item.id === novedad.id ? novedad : item))
      : [novedad, ...novedades];

    this.escribir(actualizadas);
  }

  private leer(): Novedad[] | null {
    try {
      const crudo = localStorage.getItem(CLAVE_ALMACENAMIENTO);

      if (!crudo) {
        return null;
      }

      const parsed: unknown = JSON.parse(crudo);

      if (!Array.isArray(parsed)) {
        return null;
      }

      const novedades = parsed
        .map((item) => NovedadMapper.desdeDto(item))
        .filter((item): item is Novedad => item !== null);

      return novedades.length === parsed.length ? novedades : null;
    } catch {
      return null;
    }
  }

  private escribir(novedades: Novedad[]): void {
    try {
      localStorage.setItem(
        CLAVE_ALMACENAMIENTO,
        JSON.stringify(novedades.map((novedad) => NovedadMapper.aDto(novedad))),
      );
    } catch {
      // Almacenamiento no disponible: la sesión continúa en memoria.
    }
  }
}
