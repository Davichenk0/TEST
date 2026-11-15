import {
  aIso,
  idSemana,
  inicioSemana,
  sumarDias,
  sumarSemanas,
} from '../../../../core/utils/fecha.util';
import { ANALISTAS_SEED } from '../../../programacion/infrastructure/seed/analistas.seed';
import { turnoConDesplazamiento } from '../../../programacion/domain/entities/turno.entity';
import { Novedad } from '../../domain/entities/novedad.entity';

interface SemanaReferencia {
  id: string;
  inicio: string;
  fin: string;
}

function semanaConDesplazamiento(hoy: Date, desplazamiento: number): SemanaReferencia {
  const lunes = sumarSemanas(inicioSemana(hoy), desplazamiento);
  return {
    id: idSemana(lunes),
    inicio: aIso(lunes),
    fin: aIso(sumarDias(lunes, 6)),
  };
}

function turnoOriginalDe(analistaId: string, desplazamiento: number): 1 | 2 | 3 | 4 | 5 {
  const analista = ANALISTAS_SEED.find((item) => item.id === analistaId);

  if (!analista) {
    return 1;
  }

  return turnoConDesplazamiento(analista.turnoInicial, desplazamiento);
}

/**
 * Novedades de demostración: dos aprobadas en semanas anteriores, una
 * rechazada y dos pendientes en la semana en curso. Se generan relativas a la
 * fecha de la primera ejecución para que el tablero tenga información útil.
 */
export function crearNovedadesIniciales(hoy = new Date()): Novedad[] {
  const hace3 = semanaConDesplazamiento(hoy, -3);
  const hace2 = semanaConDesplazamiento(hoy, -2);
  const hace1 = semanaConDesplazamiento(hoy, -1);
  const actual = semanaConDesplazamiento(hoy, 0);

  return [
    {
      id: 'n-001',
      fechaReporte: hace3.inicio,
      semanaId: hace3.id,
      analistaAfectadoId: 'a1',
      turnoOriginalId: turnoOriginalDe('a1', -3),
      tipo: 'permiso',
      detalle: 'Solicitud de permiso personal para trámite bancario.',
      analistaCoberturaId: 'a4',
      turnoReorganizadoId: 4,
      estado: 'rechazada',
      gestionadoPor: 'David Gonzalo Cajamarca Torres',
      fechaGestion: hace2.inicio,
      observaciones: 'No se adjuntó el soporte del permiso; se solicita reprogramar la solicitud.',
    },
    {
      id: 'n-002',
      fechaReporte: hace2.inicio,
      semanaId: hace2.id,
      analistaAfectadoId: 'a5',
      turnoOriginalId: turnoOriginalDe('a5', -2),
      tipo: 'ausencia',
      detalle: 'Ausencia por cita médica programada.',
      analistaCoberturaId: 'a4',
      turnoReorganizadoId: 4,
      estado: 'aprobada',
      gestionadoPor: 'David Gonzalo Cajamarca Torres',
      fechaGestion: hace2.inicio,
      observaciones: 'Cobertura confirmada con el jefe inmediato.',
    },
    {
      id: 'n-003',
      fechaReporte: hace1.inicio,
      semanaId: hace1.id,
      analistaAfectadoId: 'a3',
      turnoOriginalId: turnoOriginalDe('a3', -1),
      tipo: 'permiso',
      detalle: 'Permiso remunerado aprobado por talento humano.',
      analistaCoberturaId: 'a2',
      turnoReorganizadoId: 4,
      estado: 'aprobada',
      gestionadoPor: 'David Gonzalo Cajamarca Torres',
      fechaGestion: hace1.inicio,
      observaciones: 'Se adjunta autorización de talento humano.',
    },
    {
      id: 'n-004',
      fechaReporte: actual.inicio,
      semanaId: actual.id,
      analistaAfectadoId: 'a1',
      turnoOriginalId: turnoOriginalDe('a1', 0),
      tipo: 'ausencia',
      detalle: 'Ausencia por diligencia personal durante la jornada de la mañana.',
      analistaCoberturaId: 'a2',
      turnoReorganizadoId: 4,
      estado: 'pendiente',
      gestionadoPor: null,
      fechaGestion: null,
      observaciones: 'Pendiente de aprobación del jefe inmediato.',
    },
    {
      id: 'n-005',
      fechaReporte: actual.inicio,
      semanaId: actual.id,
      analistaAfectadoId: 'a3',
      turnoOriginalId: turnoOriginalDe('a3', 0),
      tipo: 'incapacidad',
      detalle: 'Incapacidad médica de tres días con soporte adjunto.',
      analistaCoberturaId: 'a5',
      turnoReorganizadoId: 4,
      estado: 'pendiente',
      gestionadoPor: null,
      fechaGestion: null,
      observaciones: 'Se adjunta certificado médico.',
    },
  ];
}
