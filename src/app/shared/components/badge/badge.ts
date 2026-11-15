import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type TonoBadge =
  | 'manana'
  | 'tarde'
  | 'noche'
  | 'descanso'
  | 'oficina'
  | 'pendiente'
  | 'aprobada'
  | 'rechazada'
  | 'neutral'
  | 'info'
  | 'exito'
  | 'advertencia'
  | 'peligro';

@Component({
  selector: 'app-badge',
  template: `
    <span class="badge" [class]="'badge badge--' + tono()">
      @if (punto()) {
        <span class="badge__punto"></span>
      }
      {{ etiqueta() }}
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Badge {
  readonly etiqueta = input.required<string>();
  readonly tono = input<TonoBadge>('neutral');
  readonly punto = input(true);
}
