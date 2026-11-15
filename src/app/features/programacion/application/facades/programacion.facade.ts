import { computed, inject, Injectable, signal } from '@angular/core';

import { hoyIso } from '../../../../core/utils/fecha.util';
import {
  AsignacionSemanal,
  EstadoProgramacion,
  SemanaProgramacion,
} from '../../domain/entities/programacion.entity';
import { Analista } from '../../domain/entities/analista.entity';
import { TURNO_POR_ID, Turno, TurnoId } from '../../domain/entities/turno.entity';
import {
  ActualizarParametrosUseCase,
  CambioTurnoInicial,
} from '../../domain/use-cases/actualizar-parametros.use-case';
import { ObtenerProgramacionUseCase } from '../../domain/use-cases/obtener-programacion.use-case';
import { PROGRAMACION_REPOSITORY } from '../tokens/programacion.token';

@Injectable({ providedIn: 'root' })
export class ProgramacionFacade {
  private readonly repositorio = inject(PROGRAMACION_REPOSITORY);
  private readonly obtenerProgramacion = new ObtenerProgramacionUseCase(this.repositorio);
  private readonly actualizarParametros = new ActualizarParametrosUseCase(this.repositorio);

  private readonly estado = signal<EstadoProgramacion | null>(null);
  private readonly seleccionadaId = signal<string | null>(null);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  readonly semanas = computed(() => this.estado()?.semanas ?? []);
  readonly analistas = computed(() =>
    (this.estado()?.parametros.analistas ?? []).filter((analista) => analista.activo),
  );
  readonly turnos = computed(() => this.estado()?.parametros.turnos ?? []);
  readonly turnosOperativos = computed(() => this.turnos().filter((turno) => turno.operativo));

  readonly semanaActual = computed(() => {
    const hoy = hoyIso();
    return (
      this.semanas().find((semana) => hoy >= semana.inicio && hoy <= semana.fin) ??
      this.semanas()[0] ??
      null
    );
  });

  readonly semanaSeleccionada = computed(() => {
    const id = this.seleccionadaId();
    return (
      this.semanas().find((semana) => semana.id === id) ??
      this.semanaActual() ??
      null
    );
  });

  readonly indiceSeleccionado = computed(() =>
    this.semanas().findIndex((semana) => semana.id === this.semanaSeleccionada()?.id),
  );

  readonly puedeAnterior = computed(() => this.indiceSeleccionado() > 0);
  readonly puedeSiguiente = computed(() => {
    const indice = this.indiceSeleccionado();
    return indice >= 0 && indice < this.semanas().length - 1;
  });

  async cargar(): Promise<void> {
    this.cargando.set(true);
    this.error.set(null);

    try {
      const estado = await this.obtenerProgramacion.execute();
      this.estado.set(estado);

      if (!this.seleccionadaId()) {
        this.seleccionadaId.set(this.semanaActual()?.id ?? estado.semanas[0]?.id ?? null);
      }
    } catch {
      this.error.set('No fue posible cargar la programación semanal.');
    } finally {
      this.cargando.set(false);
    }
  }

  seleccionarSemana(id: string): void {
    this.seleccionadaId.set(id);
  }

  irASemanaAnterior(): void {
    const indice = this.indiceSeleccionado();
    const anterior = this.semanas()[indice - 1];

    if (anterior) {
      this.seleccionadaId.set(anterior.id);
    }
  }

  irASemanaSiguiente(): void {
    const indice = this.indiceSeleccionado();
    const siguiente = this.semanas()[indice + 1];

    if (siguiente) {
      this.seleccionadaId.set(siguiente.id);
    }
  }

  irASemanaActual(): void {
    const actual = this.semanaActual();

    if (actual) {
      this.seleccionadaId.set(actual.id);
    }
  }

  esSemanaActual(semana: SemanaProgramacion): boolean {
    return semana.id === this.semanaActual()?.id;
  }

  turnoPorId(id: TurnoId): Turno {
    return this.turnos().find((turno) => turno.id === id) ?? TURNO_POR_ID[id];
  }

  analistaPorId(id: string): Analista | undefined {
    return this.analistas().find((analista) => analista.id === id);
  }

  asignacionDe(semana: SemanaProgramacion, analistaId: string): AsignacionSemanal | undefined {
    return semana.asignaciones.find((asignacion) => asignacion.analistaId === analistaId);
  }

  async guardarTurnosIniciales(cambios: CambioTurnoInicial[]): Promise<void> {
    const estado = await this.actualizarParametros.execute(cambios);
    this.estado.set(estado);
  }
}
