import { Pipe, PipeTransform } from '@angular/core';

import { formatearFecha } from '../../core/utils/fecha.util';

@Pipe({
  name: 'fecha',
  pure: true,
})
export class FechaPipe implements PipeTransform {
  transform(valor: string | null | undefined, formato: 'corta' | 'media' | 'larga' = 'media'): string {
    if (!valor) {
      return '—';
    }

    return formatearFecha(valor, formato);
  }
}
