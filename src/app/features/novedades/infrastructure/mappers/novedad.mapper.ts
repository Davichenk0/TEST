import { esTurnoId } from '../../../programacion/domain/entities/turno.entity';
import {
  esEstadoNovedad,
  esTipoNovedad,
  Novedad,
} from '../../domain/entities/novedad.entity';
import { NovedadDto } from '../dtos/novedad.dto';

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null;
}

function esTexto(valor: unknown): valor is string {
  return typeof valor === 'string';
}

export class NovedadMapper {
  static desdeDto(crudo: unknown): Novedad | null {
    if (!esObjeto(crudo)) {
      return null;
    }

    const {
      id,
      fechaReporte,
      semanaId,
      analistaAfectadoId,
      turnoOriginalId,
      tipo,
      detalle,
      analistaCoberturaId,
      turnoReorganizadoId,
      estado,
      gestionadoPor,
      fechaGestion,
      observaciones,
    } = crudo;

    if (
      !esTexto(id) ||
      !esTexto(fechaReporte) ||
      !esTexto(semanaId) ||
      !esTexto(analistaAfectadoId) ||
      !esTurnoId(turnoOriginalId) ||
      !esTipoNovedad(tipo) ||
      !esTexto(detalle) ||
      !esTexto(analistaCoberturaId) ||
      !esTurnoId(turnoReorganizadoId) ||
      !esEstadoNovedad(estado)
    ) {
      return null;
    }

    return {
      id,
      fechaReporte,
      semanaId,
      analistaAfectadoId,
      turnoOriginalId,
      tipo,
      detalle,
      analistaCoberturaId,
      turnoReorganizadoId,
      estado,
      gestionadoPor: esTexto(gestionadoPor) ? gestionadoPor : null,
      fechaGestion: esTexto(fechaGestion) ? fechaGestion : null,
      observaciones: esTexto(observaciones) ? observaciones : '',
    };
  }

  static aDto(novedad: Novedad): NovedadDto {
    return { ...novedad };
  }
}
