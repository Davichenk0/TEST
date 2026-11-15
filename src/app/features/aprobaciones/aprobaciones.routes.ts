import { Routes } from '@angular/router';

export const APROBACIONES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/containers/aprobaciones-container/aprobaciones-container').then(
        (m) => m.AprobacionesContainer,
      ),
    data: { titulo: 'Aprobaciones' },
  },
];
