import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icon, IconName } from '../icon/icon';

export type TonoStat = 'primario' | 'exito' | 'advertencia' | 'peligro' | 'info';

@Component({
  selector: 'app-stat-card',
  imports: [Icon],
  template: `
    <article class="stat" [class]="'stat stat--' + tono()">
      <div class="stat__icono">
        <app-icon [nombre]="icono()" [tamano]="20" />
      </div>
      <div class="stat__contenido">
        <span class="stat__etiqueta">{{ etiqueta() }}</span>
        <strong class="stat__valor">{{ valor() }}</strong>
        @if (detalle()) {
          <span class="stat__detalle">{{ detalle() }}</span>
        }
      </div>
    </article>
  `,
  styles: `
    .stat {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 18px;
      border: 1px solid var(--borde);
      border-radius: var(--radio);
      background: var(--superficie);
      box-shadow: var(--sombra);
    }

    .stat__icono {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      flex-shrink: 0;
      background: var(--primario-suave);
      color: var(--primario);
    }

    .stat__contenido {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .stat__etiqueta {
      color: var(--texto-suave);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .stat__valor {
      font-size: 25px;
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .stat__detalle {
      color: var(--texto-tenue);
      font-size: 12px;
    }

    .stat--exito .stat__icono {
      background: var(--exito-suave);
      color: var(--exito);
    }

    .stat--advertencia .stat__icono {
      background: var(--advertencia-suave);
      color: var(--advertencia);
    }

    .stat--peligro .stat__icono {
      background: var(--peligro-suave);
      color: var(--peligro);
    }

    .stat--info .stat__icono {
      background: var(--info-suave);
      color: var(--info);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCard {
  readonly etiqueta = input.required<string>();
  readonly valor = input.required<string | number>();
  readonly detalle = input('');
  readonly icono = input<IconName>('info');
  readonly tono = input<TonoStat>('primario');
}
