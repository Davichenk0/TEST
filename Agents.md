# AGENTS.md — Contexto Inicial para OpenCode

## Instrucciones de Arranque

Este proyecto usa **OpenCode** como agente de IA para el desarrollo. Cada vez que se inicie una sesión en este repositorio, el agente **debe leer y respetar** los documentos de contexto listados abajo **antes de realizar cualquier acción**.

**No improvises. No asumas. Lee primero.**

## Orden de Lectura Obligatorio

Al iniciar la sesión y **antes de responder o generar código**, el agente debe leer los siguientes archivos en este orden:

| Orden | Archivo / Carpeta | Propósito | Carácter |
|-------|-------------------|-----------|----------|
| 1 | `agent-operation-rules.md` | Reglas de trabajo: cuándo preguntar, qué no hacer, simplicidad, concisión, flujo esperado. | **Vinculante** |
| 2 | `architecture-context.md` | Clean Architecture, SOLID, estructura por features, separación UI/lógica, convenciones. | **Vinculante** |
| 3 | `context-general.md` | Contexto del aplicativo: propósito, dominio, funcionalidades existentes, alcance. | **Vinculante** |
| 4 | `context-ui/` (carpeta) | Pantallazos e imágenes de referencia visual de las pantallas. | **Vinculante para la UI** |

Si alguno **no existe, está vacío o es contradictorio**, el agente debe **detenerse y preguntar** al usuario antes de continuar.

## Resumen del Stack y Arquitectura

- **Framework:** Angular (standalone components, signals, `inject()`).
- **Arquitectura:** Clean Architecture adaptada a Angular, organizada **por features/dominio** (ej: `proyectos`, `clientes`, `usuario`, `factura`).
- **Capas por feature:** `domain` → `application` → `infrastructure` → `ui`.
- **UI:** Componentes divididos en **Container** (lógica/estado) y **Presentational** (render puro). La UI debe respetar `context-ui/`.
- **Principios:** SOLID aplicado con criterio, sin sobreingeniería.
- **Tests:** **No** se generan tests (`*.spec.ts`) por el momento.

## Estructura de Referencia del Proyecto

```text
.
├── AGENTS.md                     ← este archivo (arranque para OpenCode)
├── agent-operation-rules.md      ← reglas de trabajo del agente
├── architecture-context.md       ← arquitectura y convenciones
├── context-general.md            ← contexto de negocio y alcance
├── context-ui/                   ← pantallazos de referencia visual
│   ├── proyectos/
│   ├── clientes/
│   ├── usuario/
│   └── factura/
└── src/                          ← código fuente Angular
    └── app/
        ├── core/
        ├── shared/
        └── features/
            ├── proyectos/
            ├── clientes/
            ├── usuario/
            └── factura/