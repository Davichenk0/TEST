# Reglas de Trabajo del Agente de IA

## 1. Propósito

Este documento define **cómo debe comportarse el agente de IA** durante el desarrollo de este proyecto. No describe la arquitectura ni el negocio (eso está en otros documentos); describe el **modo de trabajo, las reglas de interacción y los límites de actuación** que el agente debe respetar en cada tarea.

## 2. Documentos y Recursos de Referencia Obligatoria

Antes de generar, modificar o proponer cualquier código, el agente **debe consultar y respetar** los siguientes documentos y recursos:

| Recurso | Tipo | Qué contiene | Prioridad |
|---------|------|--------------|-----------|
| `architecture-context.md` | Documento | Clean Architecture, SOLID, estructura por features, separación UI/lógica, convenciones. | **Vinculante.** El agente no puede violar estas reglas. |
| `context-general.md` | Documento | Contexto del aplicativo: propósito del negocio, dominio, funcionalidades existentes, alcance. | **Vinculante.** Toda funcionalidad debe tener sentido dentro de este contexto. |
| `context-ui/` | Carpeta de imágenes | Pantallazos (mockups, screenshots, diseños) de referencia visual de las pantallas del aplicativo. | **Vinculante para la UI.** La interfaz debe implementarse **tal cual** se muestra en las imágenes. |

Si alguno de estos documentos o recursos **no existe, está vacío o es contradictorio**, el agente debe detenerse y preguntar antes de continuar.

## 3. Contexto Visual (`context-ui/`)

### 3.1. Qué es

La carpeta `context-ui/` contiene las **imágenes de referencia visual** de las pantallas del aplicativo (pantallazos, mockups, diseños). Es la **fuente de verdad para la interfaz de usuario**.

### 3.2. Reglas de uso

1. **Antes de implementar cualquier componente visual**, el agente debe revisar si existe una imagen de referencia en `context-ui/` para esa pantalla o componente.
2. La implementación de la UI debe ser **fiel a la imagen**: estructura, jerarquía visual, distribución, textos, iconografía, colores y estados visibles.
3. Si la imagen **no es suficiente** para implementar (faltan estados, responsive, interacciones, validaciones visuales), el agente debe **preguntar** o **señalar la suposición** explícitamente.
4. Si existe **conflicto** entre la imagen y lo solicitado en el texto, el agente debe **señalarlo** y pedir confirmación antes de proceder.
5. El agente **no debe inventar diseño** cuando exista una imagen de referencia. Si no hay imagen para una pantalla, puede proponer una UI coherente con el resto, pero debe indicarlo.
6. Los nombres de las imágenes deben usarse como pista del componente o pantalla a la que corresponden (ej: `proyectos-list.png` → feature `proyectos`, pantalla de listado).

### 3.3. Convención sugerida para las imágenes

Para facilitar la correspondencia entre imagen y código, se recomienda nombrar los archivos así:

```text
context-ui/
├── proyectos/
│   ├── proyectos-list.png
│   ├── proyecto-form.png
│   └── proyecto-detail.png
├── clientes/
│   └── clientes-list.png
├── usuario/
│   └── usuario-perfil.png
└── factura/
    └── factura-create.png

### Principios de respuesta

1. **Ir al grano.** Empezar por la respuesta o el resultado; el contexto y las explicaciones van después, y solo si aportan.
2. **Sin preámbulos ni cortesías.** No usar frases como "Claro, con gusto te ayudo", "Excelente pregunta", "Por supuesto", "Como mencioné anteriormente".
3. **Sin resúmenes redundantes.** No repetir en texto lo que ya se muestra en el código o en una tabla.
4. **Sin explicar lo obvio.** No describir línea por línea lo que el código hace si es autoexplicativo.
5. **Una idea por párrafo.** Párrafos cortos (1–3 líneas). Listas cuando haya más de dos ítems.
6. **Código completo y listo para usar**, sin fragmentos incompletos que obliguen a pedir "el resto".