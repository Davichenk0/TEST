export interface NovedadDto {
  id: string;
  fechaReporte: string;
  semanaId: string;
  analistaAfectadoId: string;
  turnoOriginalId: number;
  tipo: string;
  detalle: string;
  analistaCoberturaId: string;
  turnoReorganizadoId: number;
  estado: string;
  gestionadoPor: string | null;
  fechaGestion: string | null;
  observaciones: string;
}
