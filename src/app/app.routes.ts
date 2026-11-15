import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'inicio',
  },
  {
    path: 'inicio',
    loadChildren: () => import('./features/inicio/inicio.routes').then((m) => m.INICIO_ROUTES),
  },
  {
    path: 'programacion',
    loadChildren: () =>
      import('./features/programacion/programacion.routes').then((m) => m.PROGRAMACION_ROUTES),
  },
  {
    path: 'novedades',
    loadChildren: () =>
      import('./features/novedades/novedades.routes').then((m) => m.NOVEDADES_ROUTES),
  },
  {
    path: 'aprobaciones',
    loadChildren: () =>
      import('./features/aprobaciones/aprobaciones.routes').then((m) => m.APROBACIONES_ROUTES),
  },
  {
    path: 'historico',
    loadChildren: () =>
      import('./features/historico/historico.routes').then((m) => m.HISTORICO_ROUTES),
  },
  {
    path: 'informes',
    loadChildren: () =>
      import('./features/informes/informes.routes').then((m) => m.INFORMES_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
