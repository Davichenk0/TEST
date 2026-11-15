import { Injectable, signal } from '@angular/core';

export type TonoNotificacion = 'exito' | 'error' | 'info';

export interface Notificacion {
  id: number;
  mensaje: string;
  tono: TonoNotificacion;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private readonly itemsState = signal<Notificacion[]>([]);
  private contador = 0;

  readonly items = this.itemsState.asReadonly();

  exito(mensaje: string): void {
    this.mostrar(mensaje, 'exito');
  }

  error(mensaje: string): void {
    this.mostrar(mensaje, 'error');
  }

  info(mensaje: string): void {
    this.mostrar(mensaje, 'info');
  }

  cerrar(id: number): void {
    this.itemsState.update((items) => items.filter((item) => item.id !== id));
  }

  private mostrar(mensaje: string, tono: TonoNotificacion): void {
    const id = ++this.contador;
    this.itemsState.update((items) => [...items, { id, mensaje, tono }]);
    setTimeout(() => this.cerrar(id), 4200);
  }
}
