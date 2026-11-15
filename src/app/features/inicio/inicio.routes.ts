import { Routes } from '@angular/router';

export const INICIO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/containers/inicio-container/inicio-container').then(
        (m) => m.InicioContainer,
      ),
    data: { titulo: 'Inicio' },
  },
];
