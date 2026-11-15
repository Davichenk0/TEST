import { Routes } from '@angular/router';

export const NOVEDADES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/containers/novedades-container/novedades-container').then(
        (m) => m.NovedadesContainer,
      ),
    data: { titulo: 'Novedades' },
  },
];
