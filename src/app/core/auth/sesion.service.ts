import { computed, Injectable, signal } from '@angular/core';

export interface UsuarioSesion {
  id: string;
  nombre: string;
  rol: string;
  esJefe: boolean;
}

/**
 * Sesión simulada de la aplicación. En una versión con backend,
 * este servicio se alimentaría del proveedor de identidad corporativo.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private readonly usuarioState = signal<UsuarioSesion>({
    id: 'a1',
    nombre: 'David Gonzalo Cajamarca Torres',
    rol: 'Jefe inmediato',
    esJefe: true,
  });

  readonly usuario = this.usuarioState.asReadonly();
  readonly puedeEditarParametros = computed(() => this.usuarioState().esJefe);
}
