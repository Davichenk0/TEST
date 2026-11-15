import { InjectionToken } from '@angular/core';

import { NovedadRepository } from '../../domain/repositories/novedad.repository';

export const NOVEDAD_REPOSITORY = new InjectionToken<NovedadRepository>('NovedadRepository');
