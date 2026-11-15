/**
 * Descarga una matriz de datos como CSV compatible con Excel en español
 * (separador `;`, BOM UTF-8 y celdas entre comillas).
 */
export function descargarCsv(nombreArchivo: string, filas: Array<Array<string | number>>): void {
  const contenido = filas
    .map((fila) =>
      fila
        .map((celda) => `"${String(celda ?? '').replace(/"/g, '""')}"`)
        .join(';'),
    )
    .join('\r\n');

  const blob = new Blob([`\uFEFF${contenido}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');

  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.style.display = 'none';
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);

  URL.revokeObjectURL(url);
}

export function nombreArchivoConFecha(prefijo: string): string {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = `${ahora.getMonth() + 1}`.padStart(2, '0');
  const dia = `${ahora.getDate()}`.padStart(2, '0');
  return `${prefijo}_${anio}-${mes}-${dia}.csv`;
}
