import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Icon } from '../icon/icon';

@Component({
  selector: 'app-modal',
  imports: [Icon],
  host: {
    '(document:keydown.escape)': 'solicitarCierre()',
  },
  template: `
    <div class="modal-fondo" (click)="solicitarCierre()">
      <section
        class="modal"
        [class.modal--ancho]="tamano() === 'ancho'"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="titulo()"
        (click)="$event.stopPropagation()"
      >
        <header class="modal__cabecera">
          <div class="modal__textos">
            <h2 class="modal__titulo">{{ titulo() }}</h2>
            @if (descripcion()) {
              <p class="modal__descripcion">{{ descripcion() }}</p>
            }
          </div>
          <button type="button" class="boton-icono boton-icono--plano" (click)="solicitarCierre()">
            <app-icon nombre="cerrar" [tamano]="18" />
            <span class="sr-only">Cerrar</span>
          </button>
        </header>

        <div class="modal__cuerpo">
          <ng-content />
        </div>

        @if (conPie()) {
          <footer class="modal__pie">
            <ng-content select="[pie]" />
          </footer>
        }
      </section>
    </div>
  `,
  styles: `
    .modal-fondo {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: 48px 18px;
      overflow-y: auto;
      background: rgba(9, 15, 30, 0.55);
      backdrop-filter: blur(2px);
      animation: fondo-entrada 160ms ease;
    }

    .modal {
      width: 100%;
      max-width: 580px;
      margin: auto 0;
      border-radius: 18px;
      background: var(--superficie);
      box-shadow: var(--sombra-fuerte);
      animation: modal-entrada 180ms ease;
    }

    .modal--ancho {
      max-width: 780px;
    }

    .modal__cabecera {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 22px;
      border-bottom: 1px solid var(--borde);
    }

    .modal__textos {
      min-width: 0;
    }

    .modal__titulo {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .modal__descripcion {
      margin-top: 3px;
      color: var(--texto-suave);
      font-size: 12.5px;
    }

    .modal__cuerpo {
      padding: 22px;
    }

    .modal__pie {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 22px;
      border-top: 1px solid var(--borde);
      background: var(--superficie-suave);
      border-radius: 0 0 18px 18px;
    }

    @keyframes fondo-entrada {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes modal-entrada {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.99);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 560px) {
      .modal-fondo {
        padding: 16px 12px;
      }

      .modal__cabecera,
      .modal__cuerpo,
      .modal__pie {
        padding: 16px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly titulo = input.required<string>();
  readonly descripcion = input('');
  readonly tamano = input<'normal' | 'ancho'>('normal');
  readonly conPie = input(true);
  readonly cerrar = output<void>();

  solicitarCierre(): void {
    this.cerrar.emit();
  }
}
