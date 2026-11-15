export interface TurnoDto {
  id: number;
  nombre: string;
  horario: string;
  descripcion: string;
  tono: string;
  operativo: boolean;
}

export interface AnalistaDto {
  id: string;
  nombre: string;
  turnoInicial: number;
  activo: boolean;
}

export interface AsignacionSemanalDto {
  analistaId: string;
  turnoId: number;
}

export interface SemanaProgramacionDto {
  id: string;
  anio: number;
  numero: number;
  inicio: string;
  fin: string;
  asignaciones: AsignacionSemanalDto[];
}

export interface ParametrosProgramacionDto {
  fechaBase: string;
  indiceReferencia: number;
  analistas: AnalistaDto[];
  turnos: TurnoDto[];
}

export interface EstadoProgramacionDto {
  version: number;
  parametros: ParametrosProgramacionDto;
  semanas: SemanaProgramacionDto[];
}
