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
import { StatCard } from '../../../../../shared/components/stat-card/stat-card';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';
import {
  etiquetaTipoNovedad,
  Novedad,
} from '../../../../novedades/domain/entities/novedad.entity';
import { NovedadesFacade } from '../../../../novedades/application/facades/novedades.facade';
import { NovedadDetalle } from '../../../../novedades/ui/presentational/novedad-detalle/novedad-detalle';
import { ProgramacionFacade } from '../../../../programacion/application/facades/programacion.facade';
import { Turno } from '../../../../programacion/domain/entities/turno.entity';

type AccionAprobacion = 'aprobar' | 'rechazar';

@Component({
  selector: 'app-aprobaciones-container',
  imports: [
    PageHeader,
    Icon,
    Badge,
    Avatar,
    Modal,
    EmptyState,
    StatCard,
    FechaPipe,
    NovedadDetalle,
  ],
  templateUrl: './aprobaciones-container.html',
  styleUrl: './aprobaciones-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AprobacionesContainer {
  private readonly programacion = inject(ProgramacionFacade);
  private readonly novedades = inject(NovedadesFacade);
  readonly sesion = inject(SesionService);
  private readonly notificaciones = inject(NotificacionService);

  readonly cargando = computed(
    () => this.programacion.cargando() || this.novedades.cargando(),
  );
  readonly pendientes = this.novedades.pendientes;
  readonly aprobadas = this.novedades.aprobadas;

  readonly semanasSinNovedad = computed(() => {
    const novedades = this.novedades.novedades();
    return this.programacion
      .semanas()
      .filter((semana) => !novedades.some((novedad) => novedad.semanaId === semana.id)).length;
  });

  readonly detalle = signal<Novedad | null>(null);
  readonly seleccionada = signal<Novedad | null>(null);
  readonly accion = signal<AccionAprobacion | null>(null);
  readonly observaciones = signal('');
  readonly errorAccion = signal('');
  readonly procesando = signal(false);

  nombreAnalista(id: string): string {
    return this.programacion.analistaPorId(id)?.nombre ?? 'Sin asignar';
  }

  etiquetaSemana(id: string): string {
    const semana = this.programacion.semanas().find((item) => item.id === id);
    return semana
      ? `Semana ${semana.numero} · ${etiquetaRango(semana.inicio, semana.fin)}`
      : id;
  }

  tipoEtiqueta(novedad: Novedad): string {
    return etiquetaTipoNovedad(novedad.tipo);
  }

  turnoDe(id: Novedad['turnoOriginalId']): Turno {
    return this.programacion.turnoPorId(id);
  }

  abrirDetalle(novedad: Novedad): void {
    this.detalle.set(novedad);
  }

  cerrarDetalle(): void {
    this.detalle.set(null);
  }

  abrirAccion(novedad: Novedad, accion: AccionAprobacion): void {
    this.seleccionada.set(novedad);
    this.accion.set(accion);
    this.observaciones.set(accion === 'aprobar' ? novedad.observaciones : '');
    this.errorAccion.set('');
  }

  cerrarAccion(): void {
    this.seleccionada.set(null);
    this.accion.set(null);
    this.observaciones.set('');
    this.errorAccion.set('');
  }

  async confirmar(): Promise<void> {
    const novedad = this.seleccionada();
    const accion = this.accion();

    if (!novedad || !accion) {
      return;
    }

    const observaciones = this.observaciones().trim();

    if (accion === 'rechazar' && observaciones.length < 5) {
      this.errorAccion.set('Registra el motivo del rechazo (mínimo 5 caracteres).');
      return;
    }

    this.procesando.set(true);
    this.errorAccion.set('');

    try {
      const aprobador = this.sesion.usuario().nombre;

      if (accion === 'aprobar') {
        await this.novedades.aprobar(novedad.id, aprobador, observaciones);
        this.notificaciones.exito(
          'Novedad aprobada. La programación reorganizada queda vigente.',
        );
      } else {
        await this.novedades.rechazar(novedad.id, aprobador, observaciones);
        this.notificaciones.exito(
          'Novedad rechazada. Se conserva el turno original en el histórico.',
        );
      }

      this.cerrarAccion();
    } catch (error) {
      this.errorAccion.set(
        error instanceof Error ? error.message : 'No fue posible gestionar la novedad.',
      );
    } finally {
      this.procesando.set(false);
    }
  }
}
