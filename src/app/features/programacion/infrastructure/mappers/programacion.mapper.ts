import {
  Analista,
} from '../../domain/entities/analista.entity';
import {
  AsignacionSemanal,
  EstadoProgramacion,
  ParametrosProgramacion,
  SemanaProgramacion,
} from '../../domain/entities/programacion.entity';
import {
  esTurnoId,
  Turno,
  TurnoTono,
  TurnoId,
} from '../../domain/entities/turno.entity';
import {
  AnalistaDto,
  AsignacionSemanalDto,
  EstadoProgramacionDto,
  ParametrosProgramacionDto,
  SemanaProgramacionDto,
  TurnoDto,
} from '../dtos/programacion.dto';

const TONOS: readonly TurnoTono[] = ['manana', 'tarde', 'noche', 'descanso', 'oficina'];

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function esTexto(valor: unknown): valor is string {
  return typeof valor === 'string';
}

function esNumero(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isFinite(valor);
}

function mapearTurno(dto: TurnoDto): Turno | null {
  if (!esTurnoId(dto.id) || !esTexto(dto.nombre) || !esTexto(dto.horario)) {
    return null;
  }

  return {
    id: dto.id,
    nombre: dto.nombre,
    horario: dto.horario,
    descripcion: esTexto(dto.descripcion) ? dto.descripcion : '',
    tono: TONOS.includes(dto.tono as TurnoTono) ? (dto.tono as TurnoTono) : 'manana',
    operativo: dto.operativo === true,
  };
}

function mapearAnalista(dto: AnalistaDto): Analista | null {
  if (!esTexto(dto.id) || !esTexto(dto.nombre) || !esTurnoId(dto.turnoInicial)) {
    return null;
  }

  return {
    id: dto.id,
    nombre: dto.nombre,
    turnoInicial: dto.turnoInicial,
    activo: dto.activo !== false,
  };
}

function mapearAsignacion(dto: AsignacionSemanalDto): AsignacionSemanal | null {
  if (!esTexto(dto.analistaId) || !esTurnoId(dto.turnoId)) {
    return null;
  }

  return { analistaId: dto.analistaId, turnoId: dto.turnoId };
}

function mapearSemana(dto: SemanaProgramacionDto): SemanaProgramacion | null {
  if (
    !esTexto(dto.id) ||
    !esNumero(dto.anio) ||
    !esNumero(dto.numero) ||
    !esTexto(dto.inicio) ||
    !esTexto(dto.fin) ||
    !Array.isArray(dto.asignaciones)
  ) {
    return null;
  }

  const asignaciones = dto.asignaciones
    .map((asignacion) => mapearAsignacion(asignacion))
    .filter((asignacion): asignacion is AsignacionSemanal => asignacion !== null);

  if (asignaciones.length !== dto.asignaciones.length) {
    return null;
  }

  return {
    id: dto.id,
    anio: dto.anio,
    numero: dto.numero,
    inicio: dto.inicio,
    fin: dto.fin,
    asignaciones,
  };
}

function mapearParametros(dto: ParametrosProgramacionDto): ParametrosProgramacion | null {
  if (
    !esTexto(dto.fechaBase) ||
    !esNumero(dto.indiceReferencia) ||
    !Array.isArray(dto.analistas) ||
    !Array.isArray(dto.turnos)
  ) {
    return null;
  }

  const analistas = dto.analistas
    .map((analista) => mapearAnalista(analista))
    .filter((analista): analista is Analista => analista !== null);

  const turnos = dto.turnos
    .map((turno) => mapearTurno(turno))
    .filter((turno): turno is Turno => turno !== null);

  if (analistas.length === 0 || turnos.length === 0) {
    return null;
  }

  return {
    fechaBase: dto.fechaBase,
    indiceReferencia: dto.indiceReferencia,
    analistas,
    turnos,
  };
}

export class ProgramacionMapper {
  static desdeDto(crudo: unknown): EstadoProgramacion | null {
    if (!esObjeto(crudo)) {
      return null;
    }

    const version = crudo['version'];

    if (!esNumero(version) || !esObjeto(crudo['parametros'])) {
      return null;
    }

    const parametros = mapearParametros(crudo['parametros'] as unknown as ParametrosProgramacionDto);
    const semanasDto = crudo['semanas'];

    if (!parametros || !Array.isArray(semanasDto)) {
      return null;
    }

    const semanas = semanasDto
      .map((semana) => mapearSemana(semana as SemanaProgramacionDto))
      .filter((semana): semana is SemanaProgramacion => semana !== null);

    if (semanas.length !== semanasDto.length || semanas.length === 0) {
      return null;
    }

    return {
      version,
      parametros,
      semanas,
    };
  }

  static aDto(estado: EstadoProgramacion): EstadoProgramacionDto {
    return {
      version: estado.version,
      parametros: {
        fechaBase: estado.parametros.fechaBase,
        indiceReferencia: estado.parametros.indiceReferencia,
        analistas: estado.parametros.analistas.map((analista) => ({
          id: analista.id,
          nombre: analista.nombre,
          turnoInicial: analista.turnoInicial as TurnoId,
          activo: analista.activo,
        })),
        turnos: estado.parametros.turnos.map((turno) => ({
          id: turno.id,
          nombre: turno.nombre,
          horario: turno.horario,
          descripcion: turno.descripcion,
          tono: turno.tono,
          operativo: turno.operativo,
        })),
      },
      semanas: estado.semanas.map((semana) => ({
        id: semana.id,
        anio: semana.anio,
        numero: semana.numero,
        inicio: semana.inicio,
        fin: semana.fin,
        asignaciones: semana.asignaciones.map((asignacion) => ({
          analistaId: asignacion.analistaId,
          turnoId: asignacion.turnoId,
        })),
      })),
    };
  }
}
