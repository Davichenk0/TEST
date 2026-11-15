import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { SesionService } from '../../../../../core/auth/sesion.service';
import { NotificacionService } from '../../../../../core/services/notificacion.service';
import { etiquetaRango } from '../../../../../core/utils/fecha.util';
import { Avatar } from '../../../../../shared/components/avatar/avatar';
import { Badge } from '../../../../../shared/components/badge/badge';
import { EmptyState } from '../../../../../shared/components/empty-state/empty-state';
import { Icon } from '../../../../../shared/components/icon/icon';
import { Modal } from '../../../../../shared/components/modal/modal';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { Novedad, etiquetaTipoNovedad } from '../../../../novedades/domain/entities/novedad.entity';
import { NovedadesFacade } from '../../../../novedades/application/facades/novedades.facade';
import { Analista } from '../../../domain/entities/analista.entity';
import { SemanaProgramacion } from '../../../domain/entities/programacion.entity';
import { Turno, TurnoId } from '../../../domain/entities/turno.entity';
import { ProgramacionFacade } from '../../../application/facades/programacion.facade';

interface FilaProgramacion {
  analista: Analista;
  turno: Turno;
  turnoOriginal: Turno;
  cambioAprobado: boolean;
  novedadPendiente: Novedad | null;
  coberturas: Novedad[];
}

interface CeldaMatriz {
  semanaId: string;
  turno: Turno;
  ajustado: boolean;
}

interface FilaMatriz {
  analista: Analista;
  celdas: CeldaMatriz[];
}

@Component({
  selector: 'app-programacion-container',
  imports: [PageHeader, Icon, Badge, Avatar, Modal, EmptyState],
  templateUrl: './programacion-container.html',
  styleUrl: './programacion-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramacionContainer {
  readonly programacion = inject(ProgramacionFacade);
  private readonly novedades = inject(NovedadesFacade);
  private readonly sesion = inject(SesionService);
  private readonly notificaciones = inject(NotificacionService);

  readonly puedeEditarParametros = this.sesion.puedeEditarParametros;
  readonly cargando = computed(
    () => this.programacion.cargando() || this.novedades.cargando(),
  );

  readonly semana = this.programacion.semanaSeleccionada;
  readonly semanaActualId = computed(() => this.programacion.semanaActual()?.id ?? null);
  readonly semanas = this.programacion.semanas;
  readonly analistas = this.programacion.analistas;
  readonly turnos = this.programacion.turnos;

  readonly ajustada = computed(() => {
    const semana = this.semana();
    return semana ? this.novedades.ajustarSemana(semana) : null;
  });

  readonly filas = computed<FilaProgramacion[]>(() => {
    const ajustada = this.ajustada();

    if (!ajustada) {
      return [];
    }

    return ajustada.asignaciones.flatMap((asignacion) => {
      const analista = this.programacion.analistaPorId(asignacion.analistaId);

      if (!analista) {
        return [];
      }

      return [
        {
          analista,
          turno: this.programacion.turnoPorId(asignacion.turnoId),
          turnoOriginal: this.programacion.turnoPorId(asignacion.turnoOriginalId),
          cambioAprobado: asignacion.turnoId !== asignacion.turnoOriginalId,
          novedadPendiente: asignacion.novedadPendiente,
          coberturas: ajustada.coberturas.filter(
            (novedad) => novedad.analistaCoberturaId === asignacion.analistaId,
          ),
        },
      ];
    });
  });

  readonly columnasMatriz = computed(() => {
    const indice = Math.max(this.programacion.indiceSeleccionado(), 0);
    return this.semanas().slice(indice, indice + 6);
  });

  readonly filasMatriz = computed<FilaMatriz[]>(() => {
    const columnas = this.columnasMatriz();

    return this.analistas().map((analista) => ({
      analista,
      celdas: columnas.map((semana) => {
        const ajustada = this.novedades.ajustarSemana(semana);
        const asignacion = ajustada.asignaciones.find(
          (item) => item.analistaId === analista.id,
        );

        return {
          semanaId: semana.id,
          turno: this.programacion.turnoPorId(
            asignacion?.turnoId ?? analista.turnoInicial,
          ),
          ajustado: Boolean(
            asignacion && asignacion.turnoId !== asignacion.turnoOriginalId,
          ),
        };
      }),
    }));
  });

  readonly modalParametros = signal(false);
  readonly borrador = signal<Record<string, TurnoId>>({});
  readonly guardando = signal(false);

  readonly hayCambios = computed(() =>
    this.analistas().some(
      (analista) => this.borrador()[analista.id] !== analista.turnoInicial,
    ),
  );

  readonly resumen = computed(() => {
    const filas = this.filas();
    const operativos = filas.filter((fila) => fila.turno.operativo).length;
    const ajustados = filas.filter((fila) => fila.cambioAprobado).length;
    const pendientes = filas.filter((fila) => fila.novedadPendiente).length;

    return { operativos, ajustados, pendientes };
  });

  etiquetaSemana(semana: SemanaProgramacion): string {
    return `Semana ${semana.numero} · ${etiquetaRango(semana.inicio, semana.fin)}`;
  }

  rangoSemana(semana: SemanaProgramacion): string {
    return etiquetaRango(semana.inicio, semana.fin);
  }

  esSemanaActual(semana: SemanaProgramacion): boolean {
    return this.programacion.esSemanaActual(semana);
  }

  esSeleccionada(semana: SemanaProgramacion): boolean {
    return this.semana()?.id === semana.id;
  }

  tipoNovedad(novedad: Novedad): string {
    return etiquetaTipoNovedad(novedad.tipo);
  }

  nombreAnalista(id: string): string {
    return this.programacion.analistaPorId(id)?.nombre ?? 'Sin asignar';
  }

  abrirParametros(): void {
    const borrador: Record<string, TurnoId> = {};

    for (const analista of this.analistas()) {
      borrador[analista.id] = analista.turnoInicial;
    }

    this.borrador.set(borrador);
    this.modalParametros.set(true);
  }

  cerrarParametros(): void {
    this.modalParametros.set(false);
  }

  cambiarTurno(analistaId: string, evento: Event): void {
    const valor = Number((evento.target as HTMLSelectElement).value) as TurnoId;
    this.borrador.update((borrador) => ({ ...borrador, [analistaId]: valor }));
  }

  turnoBorrador(analistaId: string): TurnoId {
    return this.borrador()[analistaId] ?? 1;
  }

  async guardarParametros(): Promise<void> {
    const cambios = this.analistas()
      .filter((analista) => this.borrador()[analista.id] !== analista.turnoInicial)
      .map((analista) => ({
        analistaId: analista.id,
        turnoId: this.borrador()[analista.id],
      }));

    if (cambios.length === 0) {
      this.modalParametros.set(false);
      return;
    }

    this.guardando.set(true);

    try {
      await this.programacion.guardarTurnosIniciales(cambios);
      this.notificaciones.exito('Asignación inicial actualizada y rotación recalculada.');
      this.modalParametros.set(false);
    } catch {
      this.notificaciones.error('No fue posible actualizar la asignación inicial.');
    } finally {
      this.guardando.set(false);
    }
  }
}
