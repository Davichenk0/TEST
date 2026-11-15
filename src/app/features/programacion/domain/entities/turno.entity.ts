export type TurnoId = 1 | 2 | 3 | 4 | 5;

export type TurnoTono = 'manana' | 'tarde' | 'noche' | 'descanso' | 'oficina';

export interface Turno {
  id: TurnoId;
  nombre: string;
  horario: string;
  descripcion: string;
  tono: TurnoTono;
  operativo: boolean;
}

/** Catálogo de turnos definido en el informe funcional (sección 4). */
export const TURNOS: readonly Turno[] = [
  {
    id: 1,
    nombre: 'Turno 1',
    horario: '06:00 - 14:00',
    descripcion: 'Jornada operativa de la mañana.',
    tono: 'manana',
    operativo: true,
  },
  {
    id: 2,
    nombre: 'Turno 2',
    horario: '14:00 - 22:00',
    descripcion: 'Jornada operativa de la tarde.',
    tono: 'tarde',
    operativo: true,
  },
  {
    id: 3,
    nombre: 'Turno 3',
    horario: '22:00 - 06:00',
    descripcion: 'Jornada operativa nocturna.',
    tono: 'noche',
    operativo: true,
  },
  {
    id: 4,
    nombre: 'Turno 4',
    horario: 'Semana completa',
    descripcion: 'Periodo semanal de descanso del analista.',
    tono: 'descanso',
    operativo: false,
  },
  {
    id: 5,
    nombre: 'Turno 5',
    horario: '08:00 - 17:00',
    descripcion: 'Jornada administrativa de oficina.',
    tono: 'oficina',
    operativo: false,
  },
] as const;

export const TURNO_POR_ID: Record<TurnoId, Turno> = {
  1: TURNOS[0],
  2: TURNOS[1],
  3: TURNOS[2],
  4: TURNOS[3],
  5: TURNOS[4],
};

export const TURNOS_OPERATIVOS = TURNOS.filter((turno) => turno.operativo);

export function esTurnoId(valor: unknown): valor is TurnoId {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= 1 && valor <= 5;
}

/**
 * Aplica la rotación cíclica semanal: cada semana el analista avanza un turno
 * (1 → 2 → 3 → 4 → 5 → 1). El desplazamiento puede ser negativo para calcular
 * semanas anteriores a la semana de referencia.
 */
export function turnoConDesplazamiento(inicial: TurnoId, desplazamiento: number): TurnoId {
  const indice = (((inicial - 1 + desplazamiento) % 5) + 5) % 5;
  return (indice + 1) as TurnoId;
}
