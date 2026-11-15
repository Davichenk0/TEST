import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { etiquetaRango } from '../../../../../core/utils/fecha.util';
import { Avatar } from '../../../../../shared/components/avatar/avatar';
import { Badge } from '../../../../../shared/components/badge/badge';
import { EmptyState } from '../../../../../shared/components/empty-state/empty-state';
import { Icon } from '../../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';
import { descargarCsv, nombreArchivoConFecha } from '../../../../../shared/utils/csv.util';
import {
  EstadoNovedad,
  etiquetaEstadoNovedad,
  etiquetaTipoNovedad,
  Novedad,
  TipoNovedad,
} from '../../../../novedades/domain/entities/novedad.entity';
import { NovedadesFacade } from '../../../../novedades/application/facades/novedades.facade';
import { NovedadDetalle } from '../../../../novedades/ui/presentational/novedad-detalle/novedad-detalle';
import { ProgramacionFacade } from '../../../../programacion/application/facades/programacion.facade';
import { Turno, TurnoId } from '../../../../programacion/domain/entities/turno.entity';

@Component({
  selector: 'app-historico-container',
  imports: [PageHeader, Icon, Badge, Avatar, EmptyState, FechaPipe, NovedadDetalle],
  templateUrl: './historico-container.html',
  styleUrl: './historico-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoricoContainer {
  readonly programacion = inject(ProgramacionFacade);
  private readonly novedades = inject(NovedadesFacade);

  readonly cargando = computed(
    () => this.programacion.cargando() || this.novedades.cargando(),
  );

  readonly filtroTexto = signal('');
  readonly filtroEstado = signal<'todas' | 'aprobada' | 'rechazada'>('todas');
  readonly filtroSemana = signal('todas');
  readonly expandida = signal<string | null>(null);

  readonly gestionadas = computed(() =>
    this.novedades.novedades().filter((novedad) => novedad.estado !== 'pendiente'),
  );

  readonly filtradas = computed(() => {
    const texto = this.filtroTexto().trim().toLowerCase();
    const estado = this.filtroEstado();
    const semana = this.filtroSemana();

    return this.gestionadas().filter((novedad) => {
      const contenido =
        `${this.nombreAnalista(novedad.analistaAfectadoId)} ${this.nombreAnalista(
          novedad.analistaCoberturaId,
        )} ${novedad.detalle} ${novedad.observaciones} ${novedad.gestionadoPor ?? ''}`.toLowerCase();

      return (
        (!texto || contenido.includes(texto)) &&
        (estado === 'todas' || novedad.estado === estado) &&
        (semana === 'todas' || novedad.semanaId === semana)
      );
    });
  });

  readonly hayFiltros = computed(
    () =>
      this.filtroTexto().trim().length > 0 ||
      this.filtroEstado() !== 'todas' ||
      this.filtroSemana() !== 'todas',
  );

  nombreAnalista(id: string): string {
    return this.programacion.analistaPorId(id)?.nombre ?? 'Sin asignar';
  }

  etiquetaSemana(id: string): string {
    const semana = this.programacion.semanas().find((item) => item.id === id);
    return semana
      ? `Semana ${semana.numero} · ${etiquetaRango(semana.inicio, semana.fin)}`
      : id;
  }

  etiquetaSemanaCorta(id: string): string {
    const semana = this.programacion.semanas().find((item) => item.id === id);
    return semana ? `S${semana.numero}` : id;
  }

  tipoEtiqueta(tipo: TipoNovedad): string {
    return etiquetaTipoNovedad(tipo);
  }

  estadoEtiqueta(estado: EstadoNovedad): string {
    return etiquetaEstadoNovedad(estado);
  }

  turnoDe(id: TurnoId): Turno {
    return this.programacion.turnoPorId(id);
  }

  alternarDetalle(novedad: Novedad): void {
    this.expandida.update((id) => (id === novedad.id ? null : novedad.id));
  }

  limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroEstado.set('todas');
    this.filtroSemana.set('todas');
  }

  exportar(): void {
    const filas: Array<Array<string | number>> = [
      [
        'Fecha del reporte',
        'Semana',
        'Analista afectado',
        'Turno original',
        'Tipo de novedad',
        'Analista que cubre',
        'Turno reorganizado',
        'Estado',
        'Aprobación del jefe inmediato',
        'Fecha de gestión',
        'Detalle',
        'Observaciones',
      ],
      ...this.filtradas().map((novedad) => [
        novedad.fechaReporte,
        this.etiquetaSemana(novedad.semanaId),
        this.nombreAnalista(novedad.analistaAfectadoId),
        this.turnoDe(novedad.turnoOriginalId).nombre,
        this.tipoEtiqueta(novedad.tipo),
        this.nombreAnalista(novedad.analistaCoberturaId),
        this.turnoDe(novedad.turnoReorganizadoId).nombre,
        this.estadoEtiqueta(novedad.estado),
        novedad.gestionadoPor ?? 'Sin gestionar',
        novedad.fechaGestion ?? '',
        novedad.detalle,
        novedad.observaciones,
      ]),
    ];

    descargarCsv(nombreArchivoConFecha('historico_novedades'), filas);
  }
}
