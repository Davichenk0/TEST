import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const PALETA: Array<{ fondo: string; texto: string }> = [
  { fondo: '#e3edff', texto: '#1f4fd1' },
  { fondo: '#fdf0d5', texto: '#96620c' },
  { fondo: '#ece7fe', texto: '#5b32c9' },
  { fondo: '#dcf5e8', texto: '#0a7a45' },
  { fondo: '#def3f8', texto: '#0a6a85' },
  { fondo: '#fde8ec', texto: '#b32d4a' },
];

@Component({
  selector: 'app-avatar',
  template: `
    <span
      class="avatar"
      [class.avatar--sm]="tamano() === 'sm'"
      [class.avatar--lg]="tamano() === 'lg'"
      [style.background]="color().fondo"
      [style.color]="color().texto"
      [attr.title]="nombre()"
    >
      {{ iniciales() }}
    </span>
  `,
  styles: `
    .avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.02em;
      flex-shrink: 0;
      user-select: none;
    }

    .avatar--sm {
      width: 28px;
      height: 28px;
      font-size: 10.5px;
    }

    .avatar--lg {
      width: 44px;
      height: 44px;
      font-size: 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Avatar {
  readonly nombre = input.required<string>();
  readonly tamano = input<'sm' | 'md' | 'lg'>('md');

  readonly iniciales = computed(() => {
    const partes = this.nombre().trim().split(/\s+/).filter(Boolean);
    const primera = partes[0]?.[0] ?? '';
    const segunda = partes[1]?.[0] ?? '';
    return `${primera}${segunda}`.toUpperCase();
  });

  readonly color = computed(() => {
    const nombre = this.nombre();
    let hash = 0;

    for (let i = 0; i < nombre.length; i++) {
      hash = (hash * 31 + nombre.charCodeAt(i)) % 997;
    }

    return PALETA[hash % PALETA.length];
  });
}
