import { Routes } from '@angular/router';

export const HISTORICO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ui/containers/historico-container/historico-container').then(
        (m) => m.HistoricoContainer,
      ),
    data: { titulo: 'Histórico' },
  },
];
