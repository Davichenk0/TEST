import { TurnoId } from './turno.entity';

export interface Analista {
  id: string;
  nombre: string;
  turnoInicial: TurnoId;
  activo: boolean;
}

export function inicialesAnalista(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  const primera = partes[0]?.[0] ?? '';
  const segunda = partes[1]?.[0] ?? '';
  return `${primera}${segunda}`.toUpperCase();
}
