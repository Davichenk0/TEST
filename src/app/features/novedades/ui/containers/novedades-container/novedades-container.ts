import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { NotificacionService } from '../../../../../core/services/notificacion.service';
import { etiquetaRango } from '../../../../../core/utils/fecha.util';
import { Avatar } from '../../../../../shared/components/avatar/avatar';
import { Badge } from '../../../../../shared/components/badge/badge';
import { EmptyState } from '../../../../../shared/components/empty-state/empty-state';
import { Icon } from '../../../../../shared/components/icon/icon';
import { Modal } from '../../../../../shared/components/modal/modal';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';
import {
  ESTADOS_NOVEDAD,
  EstadoNovedad,
  etiquetaEstadoNovedad,
  etiquetaTipoNovedad,
  Novedad,
  TIPOS_NOVEDAD,
  TipoNovedad,
} from '../../../domain/entities/novedad.entity';
import { NovedadesFacade } from '../../../application/facades/novedades.facade';
import { ProgramacionFacade } from '../../../../programacion/application/facades/programacion.facade';
import { Turno, TurnoId } from '../../../../programacion/domain/entities/turno.entity';
import { NovedadDetalle } from '../../presentational/novedad-detalle/novedad-detalle';

@Component({
  selector: 'app-novedades-container',
  imports: [
    PageHeader,
    Icon,
    Badge,
    Avatar,
    Modal,
    EmptyState,
    FechaPipe,
    NovedadDetalle,
    ReactiveFormsModule,
  ],
  templateUrl: './novedades-container.html',
  styleUrl: './novedades-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovedadesContainer {
  private readonly programacion = inject(ProgramacionFacade);
  readonly novedades = inject(NovedadesFacade);
  private readonly notificaciones = inject(NotificacionService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly cargando = computed(
    () => this.programacion.cargando() || this.novedades.cargando(),
  );
  readonly semanas = this.programacion.semanas;
  readonly analistas = this.programacion.analistas;
  readonly turnos = this.programacion.turnos;

  readonly tipos = TIPOS_NOVEDAD;
  readonly estados = ESTADOS_NOVEDAD;

  readonly filtroTexto = signal('');
  readonly filtroEstado = signal<'todas' | EstadoNovedad>('todas');
  readonly filtroTipo = signal<'todos' | TipoNovedad>('todos');
  readonly filtroSemana = signal('todas');

  readonly modalFormulario = signal(false);
  readonly detalle = signal<Novedad | null>(null);
  readonly errorFormulario = signal('');
  readonly guardando = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    semanaId: ['', Validators.required],
    analistaAfectadoId: ['', Validators.required],
    tipo: ['' as TipoNovedad | '', Validators.required],
    detalle: ['', [Validators.required, Validators.minLength(10)]],
    analistaCoberturaId: ['', Validators.required],
    turnoReorganizadoId: [4 as TurnoId, Validators.required],
    observaciones: [''],
  });

  private readonly valoresFormulario = toSignal(this.formulario.valueChanges, {
    initialValue: this.formulario.getRawValue(),
  });

  readonly turnoOriginalFormulario = computed<Turno | null>(() => {
    const valores = this.valoresFormulario();
    const semana = this.semanas().find((item) => item.id === valores.semanaId);
    const asignacion = semana?.asignaciones.find(
      (item) => item.analistaId === valores.analistaAfectadoId,
    );

    return asignacion ? this.programacion.turnoPorId(asignacion.turnoId) : null;
  });

  readonly coberturasDisponibles = computed(() => {
    const afectado = this.valoresFormulario().analistaAfectadoId;
    return this.analistas().filter((analista) => analista.id !== afectado);
  });

  readonly novedadesFiltradas = computed(() => {
    const texto = this.filtroTexto().trim().toLowerCase();
    const estado = this.filtroEstado();
    const tipo = this.filtroTipo();
    const semana = this.filtroSemana();

    return this.novedades.novedades().filter((novedad) => {
      const afectado = this.nombreAnalista(novedad.analistaAfectadoId);
      const cobertura = this.nombreAnalista(novedad.analistaCoberturaId);
      const contenido =
        `${afectado} ${cobertura} ${novedad.detalle} ${novedad.observaciones}`.toLowerCase();

      return (
        (!texto || contenido.includes(texto)) &&
        (estado === 'todas' || novedad.estado === estado) &&
        (tipo === 'todos' || novedad.tipo === tipo) &&
        (semana === 'todas' || novedad.semanaId === semana)
      );
    });
  });

  readonly hayFiltros = computed(
    () =>
      this.filtroTexto().trim().length > 0 ||
      this.filtroEstado() !== 'todas' ||
      this.filtroTipo() !== 'todos' ||
      this.filtroSemana() !== 'todas',
  );

  constructor() {
    if (this.route.snapshot.queryParamMap.get('nueva') === '1') {
      this.abrirFormulario();
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true,
      });
    }
  }

  nombreAnalista(id: string): string {
    return this.programacion.analistaPorId(id)?.nombre ?? 'Sin asignar';
  }

  turnoDe(id: TurnoId): Turno {
    return this.programacion.turnoPorId(id);
  }

  etiquetaSemana(id: string): string {
    const semana = this.semanas().find((item) => item.id === id);
    return semana
      ? `Semana ${semana.numero} · ${etiquetaRango(semana.inicio, semana.fin)}`
      : id;
  }

  etiquetaSemanaCorta(id: string): string {
    const semana = this.semanas().find((item) => item.id === id);
    return semana ? `S${semana.numero}` : id;
  }

  tipoEtiqueta(tipo: TipoNovedad): string {
    return etiquetaTipoNovedad(tipo);
  }

  estadoEtiqueta(estado: EstadoNovedad): string {
    return etiquetaEstadoNovedad(estado);
  }

  limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroEstado.set('todas');
    this.filtroTipo.set('todos');
    this.filtroSemana.set('todas');
  }

  abrirFormulario(): void {
    this.errorFormulario.set('');
    this.formulario.reset({
      semanaId: this.programacion.semanaActual()?.id ?? this.semanas()[0]?.id ?? '',
      analistaAfectadoId: '',
      tipo: '',
      detalle: '',
      analistaCoberturaId: '',
      turnoReorganizadoId: 4,
      observaciones: '',
    });
    this.modalFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.modalFormulario.set(false);
  }

  abrirDetalle(novedad: Novedad): void {
    this.detalle.set(novedad);
  }

  cerrarDetalle(): void {
    this.detalle.set(null);
  }

  async registrar(): Promise<void> {
    this.formulario.markAllAsTouched();
    this.errorFormulario.set('');

    if (this.formulario.invalid) {
      this.errorFormulario.set('Completa los campos obligatorios para registrar la novedad.');
      return;
    }

    const valores = this.formulario.getRawValue();
    const turnoOriginal = this.turnoOriginalFormulario();

    if (!turnoOriginal) {
      this.errorFormulario.set(
        'Selecciona una semana y un analista con asignación vigente para continuar.',
      );
      return;
    }

    if (valores.analistaAfectadoId === valores.analistaCoberturaId) {
      this.errorFormulario.set(
        'El analista que cubre debe ser diferente al analista afectado.',
      );
      return;
    }

    this.guardando.set(true);

    try {
      await this.novedades.registrar({
        semanaId: valores.semanaId,
        analistaAfectadoId: valores.analistaAfectadoId,
        turnoOriginalId: turnoOriginal.id,
        tipo: valores.tipo as TipoNovedad,
        detalle: valores.detalle,
        analistaCoberturaId: valores.analistaCoberturaId,
        turnoReorganizadoId: valores.turnoReorganizadoId,
        observaciones: valores.observaciones,
      });

      this.notificaciones.exito(
        'Novedad registrada. Queda pendiente de aprobación del jefe inmediato.',
      );
      this.modalFormulario.set(false);
    } catch (error) {
      this.errorFormulario.set(
        error instanceof Error ? error.message : 'No fue posible registrar la novedad.',
      );
    } finally {
      this.guardando.set(false);
    }
  }
}
