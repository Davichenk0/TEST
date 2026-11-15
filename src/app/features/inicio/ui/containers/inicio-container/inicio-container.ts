import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SesionService } from '../../../../../core/auth/sesion.service';
import {
  etiquetaRango,
  nombrePila,
  saludoSegunHora,
} from '../../../../../core/utils/fecha.util';
import { Avatar } from '../../../../../shared/components/avatar/avatar';
import { Badge } from '../../../../../shared/components/badge/badge';
import { EmptyState } from '../../../../../shared/components/empty-state/empty-state';
import { Icon } from '../../../../../shared/components/icon/icon';
import { PageHeader } from '../../../../../shared/components/page-header/page-header';
import { StatCard, TonoStat } from '../../../../../shared/components/stat-card/stat-card';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';
import {
  etiquetaEstadoNovedad,
  etiquetaTipoNovedad,
  Novedad,
  TipoNovedad,
} from '../../../../novedades/domain/entities/novedad.entity';
import { NovedadesFacade } from '../../../../novedades/application/facades/novedades.facade';
import { ProgramacionFacade } from '../../../../programacion/application/facades/programacion.facade';
import { Analista } from '../../../../programacion/domain/entities/analista.entity';
import { SemanaProgramacion } from '../../../../programacion/domain/entities/programacion.entity';
import { Turno, TurnoId } from '../../../../programacion/domain/entities/turno.entity';

interface FilaInicio {
  analista: Analista;
  turno: Turno;
  cambioAprobado: boolean;
  novedadPendiente: Novedad | null;
  coberturas: Novedad[];
}

interface MiniTurno {
  analista: Analista;
  turno: Turno;
}

@Component({
  selector: 'app-inicio-container',
  imports: [PageHeader, Icon, Avatar, Badge, StatCard, EmptyState, RouterLink, FechaPipe],
  templateUrl: './inicio-container.html',
  styleUrl: './inicio-container.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioContainer {
  readonly programacion = inject(ProgramacionFacade);
  readonly novedades = inject(NovedadesFacade);
  private readonly sesion = inject(SesionService);
  private readonly router = inject(Router);

  readonly cargando = computed(
    () => this.programacion.cargando() || this.novedades.cargando(),
  );
  readonly usuario = this.sesion.usuario;
  readonly semana = this.programacion.semanaActual;
  readonly semanas = this.programacion.semanas;
  readonly analistas = this.programacion.analistas;
  readonly turnos = this.programacion.turnos;

  readonly saludo = computed(
    () => `${saludoSegunHora()}, ${nombrePila(this.usuario().nombre)}`,
  );

  readonly rangoActual = computed(() => {
    const semana = this.semana();
    return semana ? etiquetaRango(semana.inicio, semana.fin) : '';
  });

  readonly ajustada = computed(() => {
    const semana = this.semana();
    return semana ? this.novedades.ajustarSemana(semana) : null;
  });

  readonly filas = computed<FilaInicio[]>(() => {
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
          cambioAprobado: asignacion.turnoId !== asignacion.turnoOriginalId,
          novedadPendiente: asignacion.novedadPendiente,
          coberturas: ajustada.coberturas.filter(
            (novedad) => novedad.analistaCoberturaId === asignacion.analistaId,
          ),
        },
      ];
    });
  });

  readonly turnoPropio = computed(
    () => this.filas().find((fila) => fila.analista.id === this.usuario().id) ?? null,
  );

  readonly pendientesSemana = computed(() => {
    const semana = this.semana();
    return semana
      ? this.novedades.pendientes().filter((novedad) => novedad.semanaId === semana.id)
      : [];
  });

  readonly novedadesSemana = computed(() => {
    const semana = this.semana();
    return semana ? this.novedades.deSemana(semana.id) : [];
  });

  readonly cobertura = computed(() => {
    const ajustada = this.ajustada();

    if (!ajustada) {
      return { porcentaje: 0, cubiertos: 0, total: 0 };
    }

    const operativos = ajustada.asignaciones.filter(
      (asignacion) => this.programacion.turnoPorId(asignacion.turnoId).operativo,
    );
    const afectadosPendientes = new Set(
      this.pendientesSemana().map((novedad) => novedad.analistaAfectadoId),
    );
    const cubiertos = operativos.filter(
      (asignacion) => !afectadosPendientes.has(asignacion.analistaId),
    ).length;

    return {
      porcentaje: operativos.length ? Math.round((cubiertos / operativos.length) * 100) : 100,
      cubiertos,
      total: operativos.length,
    };
  });

  readonly tonoCobertura = computed<TonoStat>(() => {
    const porcentaje = this.cobertura().porcentaje;

    if (porcentaje >= 80) {
      return 'exito';
    }

    return porcentaje >= 50 ? 'advertencia' : 'peligro';
  });

  readonly proximasSemanas = computed(() => {
    const semana = this.semana();

    if (!semana) {
      return [];
    }

    const indice = this.semanas().findIndex((item) => item.id === semana.id);
    return this.semanas().slice(indice + 1, indice + 5);
  });

  rangoSemana(semana: SemanaProgramacion): string {
    return etiquetaRango(semana.inicio, semana.fin);
  }

  etiquetaSemanaCorta(semana: SemanaProgramacion): string {
    return `Semana ${semana.numero}`;
  }

  nombreAnalista(id: string): string {
    return this.programacion.analistaPorId(id)?.nombre ?? 'Sin asignar';
  }

  turnoDe(id: TurnoId): Turno {
    return this.programacion.turnoPorId(id);
  }

  tipoEtiqueta(tipo: TipoNovedad): string {
    return etiquetaTipoNovedad(tipo);
  }

  estadoEtiqueta(novedad: Novedad): string {
    return etiquetaEstadoNovedad(novedad.estado);
  }

  miniTurnos(semana: SemanaProgramacion): MiniTurno[] {
    const ajustada = this.novedades.ajustarSemana(semana);

    return this.analistas().map((analista) => {
      const asignacion = ajustada.asignaciones.find(
        (item) => item.analistaId === analista.id,
      );

      return {
        analista,
        turno: this.programacion.turnoPorId(asignacion?.turnoId ?? analista.turnoInicial),
      };
    });
  }

  irASemana(semana: SemanaProgramacion): void {
    this.programacion.seleccionarSemana(semana.id);
    void this.router.navigate(['/programacion']);
  }
}
