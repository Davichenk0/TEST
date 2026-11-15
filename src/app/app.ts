import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Shell } from './core/layout/shell/shell';
import { NovedadesFacade } from './features/novedades/application/facades/novedades.facade';
import { ProgramacionFacade } from './features/programacion/application/facades/programacion.facade';

@Component({
  selector: 'app-root',
  imports: [Shell],
  template: '<app-shell />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly programacion = inject(ProgramacionFacade);
  private readonly novedades = inject(NovedadesFacade);

  constructor() {
    void this.programacion.cargar();
    void this.novedades.cargar();
  }
}
