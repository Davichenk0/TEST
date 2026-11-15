import { InjectionToken } from '@angular/core';

import { ProgramacionRepository } from '../../domain/repositories/programacion.repository';

export const PROGRAMACION_REPOSITORY = new InjectionToken<ProgramacionRepository>(
  'ProgramacionRepository',
);
