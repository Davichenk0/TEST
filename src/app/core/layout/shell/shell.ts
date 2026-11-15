import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { SesionService } from '../../auth/sesion.service';
import { NotificacionService } from '../../services/notificacion.service';
import { etiquetaRango } from '../../utils/fecha.util';
import { Avatar } from '../../../shared/components/avatar/avatar';
import { Icon, IconName } from '../../../shared/components/icon/icon';
import { NovedadesFacade } from '../../../features/novedades/application/facades/novedades.facade';
import { ProgramacionFacade } from '../../../features/programacion/application/facades/programacion.facade';

interface ItemNavegacion {
  ruta: string;
  etiqueta: string;
  icono: IconName;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe, Icon, Avatar],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  private readonly router = inject(Router);
  private readonly sesion = inject(SesionService);
  private readonly programacion = inject(ProgramacionFacade);
  private readonly novedades = inject(NovedadesFacade);
  readonly notificaciones = inject(NotificacionService);

  readonly usuario = this.sesion.usuario;
  readonly menuAbierto = signal(false);
  readonly tituloPagina = signal('Inicio');
  readonly hoy = new Date();

  readonly semanaActual = this.programacion.semanaActual;
  readonly rangoSemana = computed(() => {
    const semana = this.semanaActual();
    return semana ? etiquetaRango(semana.inicio, semana.fin) : '';
  });
  readonly novedadesPendientes = this.novedades.pendientes;

  readonly navegacionPrincipal: ItemNavegacion[] = [
    { ruta: '/inicio', etiqueta: 'Inicio', icono: 'inicio' },
    { ruta: '/programacion', etiqueta: 'Programación', icono: 'programacion' },
  ];

  readonly navegacionGestion: ItemNavegacion[] = [
    { ruta: '/novedades', etiqueta: 'Novedades', icono: 'novedades' },
    { ruta: '/aprobaciones', etiqueta: 'Aprobaciones', icono: 'aprobaciones' },
    { ruta: '/historico', etiqueta: 'Histórico', icono: 'historico' },
  ];

  readonly navegacionAnalisis: ItemNavegacion[] = [
    { ruta: '/informes', etiqueta: 'Informes', icono: 'informes' },
  ];

  constructor() {
    this.actualizarTitulo();

    this.router.events
      .pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.actualizarTitulo();
        this.menuAbierto.set(false);
      });
  }

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  private actualizarTitulo(): void {
    let ruta = this.router.routerState.root;

    while (ruta.firstChild) {
      ruta = ruta.firstChild;
    }

    this.tituloPagina.set((ruta.snapshot.data['titulo'] as string | undefined) ?? 'Inicio');
  }
}
