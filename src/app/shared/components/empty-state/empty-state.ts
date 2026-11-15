import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icon, IconName } from '../icon/icon';

@Component({
  selector: 'app-empty-state',
  imports: [Icon],
  template: `
    <div class="vacio">
      <div class="vacio__icono">
        <app-icon [nombre]="icono()" [tamano]="22" />
      </div>
      <strong class="vacio__titulo">{{ titulo() }}</strong>
      <p class="vacio__mensaje">{{ mensaje() }}</p>
      <ng-content />
    </div>
  `,
  styles: `
    .vacio {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 40px 24px;
      text-align: center;
    }

    .vacio__icono {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      margin-bottom: 6px;
      border-radius: 14px;
      background: var(--superficie-suave);
      border: 1px solid var(--borde);
      color: var(--texto-tenue);
    }

    .vacio__titulo {
      font-size: 14px;
      font-weight: 650;
    }

    .vacio__mensaje {
      max-width: 380px;
      color: var(--texto-suave);
      font-size: 12.5px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly titulo = input.required<string>();
  readonly mensaje = input.required<string>();
  readonly icono = input<IconName>('info');
}
