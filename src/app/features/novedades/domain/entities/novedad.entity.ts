import { TurnoId } from '../../../programacion/domain/entities/turno.entity';

export type EstadoNovedad = 'pendiente' | 'aprobada' | 'rechazada';

export type TipoNovedad = 'ausencia' | 'incapacidad' | 'permiso' | 'cambio-turno' | 'cobertura';

export interface Novedad {
  id: string;
  fechaReporte: string;
  semanaId: string;
  analistaAfectadoId: string;
  turnoOriginalId: TurnoId;
  tipo: TipoNovedad;
  detalle: string;
  analistaCoberturaId: string;
  turnoReorganizadoId: TurnoId;
  estado: EstadoNovedad;
  gestionadoPor: string | null;
  fechaGestion: string | null;
  observaciones: string;
}

export type NuevaNovedad = Omit<
  Novedad,
  'id' | 'estado' | 'gestionadoPor' | 'fechaGestion' | 'fechaReporte'
> & {
  fechaReporte?: string;
};

export const TIPOS_NOVEDAD: ReadonlyArray<{ valor: TipoNovedad; etiqueta: string }> = [
  { valor: 'ausencia', etiqueta: 'Ausencia' },
  { valor: 'incapacidad', etiqueta: 'Incapacidad' },
  { valor: 'permiso', etiqueta: 'Permiso' },
  { valor: 'cambio-turno', etiqueta: 'Cambio de turno' },
  { valor: 'cobertura', etiqueta: 'Cobertura' },
];

export const ESTADOS_NOVEDAD: ReadonlyArray<{
  valor: EstadoNovedad;
  etiqueta: string;
}> = [
  { valor: 'pendiente', etiqueta: 'Pendiente de aprobación' },
  { valor: 'aprobada', etiqueta: 'Aprobada' },
  { valor: 'rechazada', etiqueta: 'Rechazada' },
];

const ETIQUETAS_TIPO = new Map(TIPOS_NOVEDAD.map((tipo) => [tipo.valor, tipo.etiqueta]));
const ETIQUETAS_ESTADO = new Map(ESTADOS_NOVEDAD.map((estado) => [estado.valor, estado.etiqueta]));

export function esTipoNovedad(valor: unknown): valor is TipoNovedad {
  return typeof valor === 'string' && ETIQUETAS_TIPO.has(valor as TipoNovedad);
}

export function esEstadoNovedad(valor: unknown): valor is EstadoNovedad {
  return typeof valor === 'string' && ETIQUETAS_ESTADO.has(valor as EstadoNovedad);
}

export function etiquetaTipoNovedad(tipo: TipoNovedad): string {
  return ETIQUETAS_TIPO.get(tipo) ?? tipo;
}

export function etiquetaEstadoNovedad(estado: EstadoNovedad): string {
  return ETIQUETAS_ESTADO.get(estado) ?? estado;
}

export function estaPendiente(novedad: Novedad): boolean {
  return novedad.estado === 'pendiente';
}
