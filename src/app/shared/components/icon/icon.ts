import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconName =
  | 'inicio'
  | 'programacion'
  | 'novedades'
  | 'aprobaciones'
  | 'historico'
  | 'informes'
  | 'ajustes'
  | 'izquierda'
  | 'derecha'
  | 'mas'
  | 'descargar'
  | 'buscar'
  | 'cerrar'
  | 'usuario'
  | 'campana'
  | 'menu'
  | 'escudo'
  | 'info'
  | 'flecha'
  | 'filtro'
  | 'equipo'
  | 'luna'
  | 'check'
  | 'editar'
  | 'archivo'
  | 'candado'
  | 'reloj';

/**
 * Trazos SVG (atributo `d`) por icono. Todos los iconos comparten el mismo
 * viewBox y se dibujan solo con contorno para mantener coherencia visual.
 */
const TRAZOS: Record<IconName, string[]> = {
  inicio: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h14V9.5', 'M9.5 21v-6h5v6'],
  programacion: [
    'M8 3v4',
    'M16 3v4',
    'M3 10h18',
    'M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z',
  ],
  novedades: [
    'M12 9v4',
    'M12 17h.01',
    'M10.3 3.9 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  ],
  aprobaciones: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm8.5 12 2.5 2.5 4.5-5'],
  historico: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
  informes: ['M3 21h18', 'M6 21V11', 'M12 21V4', 'M18 21v-7'],
  ajustes: [
    'M4 21v-6',
    'M4 11V3',
    'M12 21v-9',
    'M12 8V3',
    'M20 21v-4',
    'M20 13V3',
    'M1 15h6',
    'M9 8h6',
    'M17 17h6',
  ],
  izquierda: ['m15 18-6-6 6-6'],
  derecha: ['m9 18 6-6-6-6'],
  mas: ['M12 5v14', 'M5 12h14'],
  descargar: ['M12 3v12', 'm7 10 5 5 5-5', 'M5 21h14'],
  buscar: ['M18.5 18.5 21 21', 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z'],
  cerrar: ['M18 6 6 18', 'M6 6l12 12'],
  usuario: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M4 21a8 8 0 0 1 16 0'],
  campana: [
    'M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9',
    'M10.3 21a2 2 0 0 0 3.4 0',
  ],
  menu: ['M3 6h18', 'M3 12h18', 'M3 18h18'],
  escudo: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z', 'm9 12 2 2 4-4'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 11v5', 'M12 8h.01'],
  flecha: ['M5 12h14', 'm13 6 6 6-6 6'],
  filtro: ['M3 5h18l-7 8v6l-4 2v-8Z'],
  equipo: [
    'M9 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
    'M2.5 21a6.5 6.5 0 0 1 13 0',
    'M16 4.5a3.5 3.5 0 0 1 0 7',
    'M18 21a6.5 6.5 0 0 0-3-5.5',
  ],
  luna: ['M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z'],
  check: ['m5 12 5 5 9-9'],
  editar: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'],
  archivo: [
    'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z',
    'M14 3v5h5',
  ],
  candado: ['M6 10h12v10H6Z', 'M9 10V7a3 3 0 0 1 6 0v3'],
  reloj: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7v5l3 2'],
};

@Component({
  selector: 'app-icon',
  template: `
    <svg
      [attr.width]="tamano()"
      [attr.height]="tamano()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="grosor()"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path [attr.d]="trazo()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly nombre = input.required<IconName>();
  readonly tamano = input(20);
  readonly grosor = input(1.8);

  readonly trazo = computed(() => TRAZOS[this.nombre()].join(' '));
}
