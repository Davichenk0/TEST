import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';
import { Badge } from '../../../../../shared/components/badge/badge';
import { Icon } from '../../../../../shared/components/icon/icon';
import {
  etiquetaEstadoNovedad,
  etiquetaTipoNovedad,
  Novedad,
} from '../../../domain/entities/novedad.entity';
import { TURNO_POR_ID } from '../../../../programacion/domain/entities/turno.entity';

@Component({
  selector: 'app-novedad-detalle',
  imports: [Badge, Icon, FechaPipe],
  template: `
    <div class="detalle">
      <div class="detalle__cabecera">
        <div class="pila">
          <span class="detalle__etiqueta">Semana de la novedad</span>
          <strong>{{ semanaEtiqueta() }}</strong>
        </div>
        <app-badge [etiqueta]="estadoEtiqueta()" [tono]="novedad().estado" />
      </div>

      <dl class="detalle__grid">
        <div>
          <dt>Analista afectado</dt>
          <dd>{{ nombreAfectado() }}</dd>
        </div>
        <div>
          <dt>Analista que cubre</dt>
          <dd>{{ nombreCobertura() }}</dd>
        </div>
        <div>
          <dt>Turno original</dt>
          <dd class="fila">
            <app-badge
              [etiqueta]="turnoOriginal().nombre"
              [tono]="turnoOriginal().tono"
              [punto]="false"
            />
            <span class="texto-suave texto-pequeno">{{ turnoOriginal().horario }}</span>
          </dd>
        </div>
        <div>
          <dt>Turno reorganizado</dt>
          <dd class="fila">
            <app-badge
              [etiqueta]="turnoReorganizado().nombre"
              [tono]="turnoReorganizado().tono"
              [punto]="false"
            />
            <span class="texto-suave texto-pequeno">{{ turnoReorganizado().horario }}</span>
          </dd>
        </div>
        <div>
          <dt>Tipo de novedad</dt>
          <dd>{{ tipoEtiqueta() }}</dd>
        </div>
        <div>
          <dt>Fecha del reporte</dt>
          <dd>{{ novedad().fechaReporte | fecha }}</dd>
        </div>
      </dl>

      <div class="detalle__bloque">
        <span class="detalle__etiqueta">Detalle</span>
        <p>{{ novedad().detalle }}</p>
      </div>

      <div class="detalle__bloque">
        <span class="detalle__etiqueta">Observaciones</span>
        <p>{{ novedad().observaciones || 'Sin observaciones registradas.' }}</p>
      </div>

      @if (novedad().gestionadoPor) {
        <div class="detalle__gestion">
          <app-icon nombre="escudo" [tamano]="18" />
          <div class="pila">
            <strong>
              {{ novedad().estado === 'aprobada' ? 'Aprobada' : 'Rechazada' }} por
              {{ novedad().gestionadoPor }}
            </strong>
            <span class="texto-suave texto-pequeno">
              Fecha de gestión: {{ novedad().fechaGestion | fecha }}
            </span>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .detalle {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .detalle__cabecera {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--borde);
    }

    .detalle__cabecera strong {
      font-size: 14px;
    }

    .detalle__etiqueta {
      color: var(--texto-tenue);
      font-size: 10.5px;
      font-weight: 650;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .detalle__grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px 18px;
      margin: 0;
    }

    .detalle__grid div {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .detalle__grid dt {
      color: var(--texto-tenue);
      font-size: 11.5px;
      font-weight: 550;
    }

    .detalle__grid dd {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
    }

    .detalle__bloque {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 12px 14px;
      border: 1px solid var(--borde);
      border-radius: var(--radio-sm);
      background: var(--superficie-suave);
    }

    .detalle__bloque p {
      color: #3d4862;
      font-size: 13px;
    }

    .detalle__gestion {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 14px;
      border: 1px solid #cfe9d9;
      border-radius: var(--radio-sm);
      background: var(--exito-suave);
      color: #0a6b3d;
    }

    .detalle__gestion strong {
      font-size: 12.5px;
    }

    @media (max-width: 560px) {
      .detalle__grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NovedadDetalle {
  readonly novedad = input.required<Novedad>();
  readonly semanaEtiqueta = input.required<string>();
  readonly nombreAfectado = input.required<string>();
  readonly nombreCobertura = input.required<string>();

  readonly turnoOriginal = computed(() => TURNO_POR_ID[this.novedad().turnoOriginalId]);
  readonly turnoReorganizado = computed(() => TURNO_POR_ID[this.novedad().turnoReorganizadoId]);
  readonly estadoEtiqueta = computed(() => etiquetaEstadoNovedad(this.novedad().estado));
  readonly tipoEtiqueta = computed(() => etiquetaTipoNovedad(this.novedad().tipo));
}
