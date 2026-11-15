import { Routes } from '@angular/router';

export const INFORMES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/containers/informes-container/informes-container').then(
        (m) => m.InformesContainer,
      ),
    data: { titulo: 'Informes' },
  },
];
