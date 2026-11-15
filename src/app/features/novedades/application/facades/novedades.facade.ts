import { computed, inject, Injectable, signal } from '@angular/core';

import { SemanaProgramacion } from '../../../programacion/domain/entities/programacion.entity';
import {
  NuevaNovedad,
  Novedad,
} from '../../domain/entities/novedad.entity';
import {
  aplicarNovedades,
  SemanaAjustada,
} from '../../domain/use-cases/aplicar-novedades.use-case';
import { ListarNovedadesUseCase } from '../../domain/use-cases/listar-novedades.use-case';
import { RegistrarNovedadUseCase } from '../../domain/use-cases/registrar-novedad.use-case';
import { ResolverNovedadUseCase } from '../../domain/use-cases/resolver-novedad.use-case';
import { NOVEDAD_REPOSITORY } from '../tokens/novedad.token';

@Injectable({ providedIn: 'root' })
export class NovedadesFacade {
  private readonly repositorio = inject(NOVEDAD_REPOSITORY);
  private readonly listarNovedades = new ListarNovedadesUseCase(this.repositorio);
  private readonly registrarNovedad = new RegistrarNovedadUseCase(this.repositorio);
  private readonly resolverNovedad = new ResolverNovedadUseCase(this.repositorio);

  private readonly novedadesState = signal<Novedad[]>([]);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly novedades = computed(() =>
    [...this.novedadesState()].sort(
      (a, b) => b.fechaReporte.localeCompare(a.fechaReporte) || b.id.localeCompare(a.id),
    ),
  );

  readonly pendientes = computed(() =>
    this.novedades().filter((novedad) => novedad.estado === 'pendiente'),
  );
  readonly aprobadas = computed(() =>
    this.novedades().filter((novedad) => novedad.estado === 'aprobada'),
  );
  readonly rechazadas = computed(() =>
    this.novedades().filter((novedad) => novedad.estado === 'rechazada'),
  );
  readonly gestionadas = computed(() => this.aprobadas().length + this.rechazadas().length);

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      this.novedadesState.set(await this.listarNovedades.execute());
    } catch {
      this.error.set('No fue posible cargar las novedades registradas.');
    } finally {
      this.cargando.set(false);
    }
  }

  async registrar(nueva: NuevaNovedad): Promise<Novedad> {
    const novedad = await this.registrarNovedad.execute(nueva);
    this.novedadesState.update((novedades) => [novedad, ...novedades]);
    return novedad;
  }

  async aprobar(
    id: string,
    gestionadoPor: string,
    observaciones = '',
  ): Promise<Novedad> {
    const novedad = await this.resolverNovedad.execute(
      id,
      'aprobada',
      gestionadoPor,
      observaciones,
    );
    this.reemplazar(novedad);
    return novedad;
  }

  async rechazar(
    id: string,
    gestionadoPor: string,
    observaciones: string,
  ): Promise<Novedad> {
    const novedad = await this.resolverNovedad.execute(
      id,
      'rechazada',
      gestionadoPor,
      observaciones,
    );
    this.reemplazar(novedad);
    return novedad;
  }

  ajustarSemana(semana: SemanaProgramacion): SemanaAjustada {
    return aplicarNovedades(semana, this.novedadesState());
  }

  deSemana(semanaId: string): Novedad[] {
    return this.novedades().filter((novedad) => novedad.semanaId === semanaId);
  }

  contarPorSemana(semanaId: string): number {
    return this.novedadesState().filter((novedad) => novedad.semanaId === semanaId).length;
  }

  private reemplazar(novedad: Novedad): void {
    this.novedadesState.update((novedades) =>
      novedades.map((item) => (item.id === novedad.id ? novedad : item)),
    );
  }
}
