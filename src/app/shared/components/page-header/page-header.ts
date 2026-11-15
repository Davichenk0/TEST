import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="pagina__cabecera">
      <div>
        <h1 class="pagina__titulo">{{ titulo() }}</h1>
        @if (descripcion()) {
          <p class="pagina__descripcion">{{ descripcion() }}</p>
        }
      </div>
      <div class="pagina__acciones">
        <ng-content select="[acciones]" />
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly titulo = input.required<string>();
  readonly descripcion = input('');
}
