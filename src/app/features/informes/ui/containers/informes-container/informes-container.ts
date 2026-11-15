import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { etiquetaRango } from '../../../../../core/utils/fecha.util';
import { Avatar } from '../../../../../shared/components/avatar/avatar';
import { Badge } from '../../../../../shared/components/badge/badge';
import { EmptyState } from '../../../../../shared/components/empty-state/empty-state';
import { Icon } from '../../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { StatCard } from '../../../../../shared/components/stat-card/stat-card';
import { descargarCsv, nombreArchivoConFecha } from '../../../../../shared/utils/csv.util';
import {
  ESTADOS_NOVEDAD,
  TIPOS_NOVEDAD,
  TipoNovedad,
} from '../../../../novedades/domain/entities/novedad.entity';
import { NovedadesFacade } from '../../../../novedades/application/facades/novedades.facade';
import { ProgramacionFacade } from '../../../../programacion/application/facades/programacion.facade';
import {
  SemanaProgramacion,
} from '../../../../programacion/domain/entities/programacion.entity';
import { TurnoTono } from '../../../../programacion/domain/entities/turno.entity';

const COLOR_TURNO: Record<TurnoTono, string> = {
  manana: '#2f5bea',
  tarde: '#d08a14',
  noche: '#6d3fe0',
  descanso: '#0f9d58',
  oficina: '#0e7c9c',
};

const COLOR_ESTADO: Record<string, string> = {
  aprobada: '#0f9d58',
  pendiente: '#e2a33b',
  rechazada: '#d33b3b',
};

interface Barra {
  etiqueta: string;
  detalle: string;
  total: number;
  porcentaje: number;
  color: string;
}

interface ResumenSemana {
  semana: SemanaProgramacion;
  total: number;
  aprobadas: number;
  pendientes: number;
  rechazadas: number;
}

@Component({
  selector: 'app-informes-container',
  imports: [PageHeader, Icon, Badge, Avatar, StatCard, EmptyState],
  templateUrl: './informes-container.html',
  styleUrl: './informes-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformesContainer {
  readonly programacion = inject(ProgramacionFacade);
  readonly novedades = inject(NovedadesFacade);

  readonly cargando = computed(
    () => this.programacion.cargando() || this.novedades.cargando(),
  );

  readonly total = computed(() => this.novedades.novedades().length);
  readonly aprobadas = computed(() => this.novedades.aprobadas().length);
  readonly pendientes = computed(() => this.novedades.pendientes().length);
  readonly rechazadas = computed(() => this.novedades.rechazadas().length);

  readonly cobertura = computed(() => {
    const gestionadas = this.aprobadas() + this.rechazadas();
    return gestionadas === 0 ? 0 : Math.round((this.aprobadas() / gestionadas) * 100);
  });

  readonly porTurno = computed<Barra[]>(() => {
    const novedades = this.novedades.novedades();
    const items = this.programacion.turnos().map((turno) => ({
      etiqueta: turno.nombre,
      detalle: turno.horario,
      total: novedades.filter((novedad) => novedad.turnoOriginalId === turno.id).length,
      color: COLOR_TURNO[turno.tono],
    }));

    return this.conPorcentaje(items);
  });

  readonly porTipo = computed<Barra[]>(() => {
    const novedades = this.novedades.novedades();
    const items = TIPOS_NOVEDAD.map((tipo) => ({
      etiqueta: tipo.etiqueta,
      detalle: this.detalleTipo(tipo.valor),
      total: novedades.filter((novedad) => novedad.tipo === tipo.valor).length,
      color: '#2f5bea',
    }));

    return this.conPorcentaje(items);
  });

  readonly porEstado = computed(() =>
    ESTADOS_NOVEDAD.map((estado) => ({
      etiqueta: estado.etiqueta,
      total: this.novedades
        .novedades()
        .filter((novedad) => novedad.estado === estado.valor).length,
      color: COLOR_ESTADO[estado.valor],
    })),
  );

  readonly porAnalista = computed(() => {
    const novedades = this.novedades.novedades();
    const maximo = Math.max(
      1,
      ...this.programacion.analistas().map(
        (analista) =>
          novedades.filter((novedad) => novedad.analistaAfectadoId === analista.id).length,
      ),
    );

    return this.programacion
      .analistas()
      .map((analista) => {
        const propias = novedades.filter(
          (novedad) => novedad.analistaAfectadoId === analista.id,
        );

        return {
          analista,
          total: propias.length,
          aprobadas: propias.filter((novedad) => novedad.estado === 'aprobada').length,
          pendientes: propias.filter((novedad) => novedad.estado === 'pendiente').length,
          porcentaje: Math.round((propias.length / maximo) * 100),
        };
      })
      .sort((a, b) => b.total - a.total);
  });

  readonly porSemana = computed<ResumenSemana[]>(() => {
    const novedades = this.novedades.novedades();

    return this.programacion.semanas().map((semana) => {
      const deLaSemana = novedades.filter((novedad) => novedad.semanaId === semana.id);

      return {
        semana,
        total: deLaSemana.length,
        aprobadas: deLaSemana.filter((novedad) => novedad.estado === 'aprobada').length,
        pendientes: deLaSemana.filter((novedad) => novedad.estado === 'pendiente').length,
        rechazadas: deLaSemana.filter((novedad) => novedad.estado === 'rechazada').length,
      };
    });
  });

  readonly donaEstados = computed(() => {
    const total = this.total();

    if (total === 0) {
      return 'conic-gradient(#e3e7f1 0 100%)';
    }

    const aprobadas = (this.aprobadas() / total) * 100;
    const pendientes = (this.pendientes() / total) * 100;
    const finAprobadas = aprobadas;
    const finPendientes = aprobadas + pendientes;

    return `conic-gradient(#0f9d58 0 ${finAprobadas}%, #e2a33b ${finAprobadas}% ${finPendientes}%, #d33b3b ${finPendientes}% 100%)`;
  });

  readonly totalesSemana = computed(() =>
    this.porSemana().reduce(
      (acumulado, semana) => ({
        total: acumulado.total + semana.total,
        aprobadas: acumulado.aprobadas + semana.aprobadas,
        pendientes: acumulado.pendientes + semana.pendientes,
        rechazadas: acumulado.rechazadas + semana.rechazadas,
      }),
      { total: 0, aprobadas: 0, pendientes: 0, rechazadas: 0 },
    ),
  );

  rangoSemana(semana: SemanaProgramacion): string {
    return etiquetaRango(semana.inicio, semana.fin);
  }

  tipoEtiqueta(tipo: TipoNovedad): string {
    return TIPOS_NOVEDAD.find((item) => item.valor === tipo)?.etiqueta ?? tipo;
  }

  exportar(): void {
    const filas: Array<Array<string | number>> = [
      ['Semana', 'Rango', 'Total novedades', 'Aprobadas', 'Pendientes', 'Rechazadas'],
      ...this.porSemana().map((item) => [
        `Semana ${item.semana.numero}`,
        this.rangoSemana(item.semana),
        item.total,
        item.aprobadas,
        item.pendientes,
        item.rechazadas,
      ]),
      [
        'Totales',
        '',
        this.totalesSemana().total,
        this.totalesSemana().aprobadas,
        this.totalesSemana().pendientes,
        this.totalesSemana().rechazadas,
      ],
    ];

    descargarCsv(nombreArchivoConFecha('informe_novedades'), filas);
  }

  private conPorcentaje(
    items: Array<Omit<Barra, 'porcentaje'>>,
  ): Barra[] {
    const maximo = Math.max(1, ...items.map((item) => item.total));
    return items.map((item) => ({
      ...item,
      porcentaje: Math.round((item.total / maximo) * 100),
    }));
  }

  private detalleTipo(tipo: TipoNovedad): string {
    const novedades = this.novedades.novedades();
    return `${novedades.filter((novedad) => novedad.tipo === tipo).length} registros`;
  }
}
