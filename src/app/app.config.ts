import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { NOVEDAD_REPOSITORY } from './features/novedades/application/tokens/novedad.token';
import { NovedadLocalRepository } from './features/novedades/infrastructure/repositories/novedad-local.repository';
import { PROGRAMACION_REPOSITORY } from './features/programacion/application/tokens/programacion.token';
import { ProgramacionLocalRepository } from './features/programacion/infrastructure/repositories/programacion-local.repository';

registerLocaleData(localeEsCo, 'es-CO');

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: PROGRAMACION_REPOSITORY, useClass: ProgramacionLocalRepository },
    { provide: NOVEDAD_REPOSITORY, useClass: NovedadLocalRepository },
  ],
};
