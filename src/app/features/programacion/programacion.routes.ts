import { Routes } from '@angular/router';

export const PROGRAMACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/containers/programacion-container/programacion-container').then(
        (m) => m.ProgramacionContainer,
      ),
    data: { titulo: 'Programación' },
  },
];
