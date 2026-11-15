# SICOV CI2 · Mesa de Servicios

Aplicación Angular para el control de turnos, la rotación semanal y la gestión de novedades
del equipo de la Mesa de Servicios SICOV CI2.

El proyecto implementa los flujos descritos en los documentos de contexto entregados:
programación semanal de cinco turnos, rotación cíclica, registro de novedades con cobertura,
aprobación o rechazo por parte del jefe inmediato, histórico trazable e informes exportables.

---

## 1. Requisitos y ejecución

| Herramienta | Versión |
| --- | --- |
| Node.js | 20.19+, 22.12+ o 24.x |
| npm | 10+ |
| Angular | 21.2.26 |
| TypeScript | 5.9.3 |

```bash
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200/`.

```bash
npm run build       # compilación de producción en dist/sicov-ci2
npm run watch       # compilación de desarrollo en modo watch
```

> No se incluyen archivos `*.spec.ts`; la verificación se realizó con compilación de producción
> y pruebas de humo sobre las rutas y el flujo completo de novedades.

---

## 2. Funcionalidades

| Ruta | Módulo | Descripción |
| --- | --- | --- |
| `/inicio` | Inicio | Panel del día: saludo, turno vigente, alertas de novedades pendientes, cobertura de la semana, equipo y próximas semanas. |
| `/programacion` | Programación | Matriz de 12 semanas por analista, navegación semanal, ajuste por novedades aprobadas y edición de turnos iniciales. |
| `/novedades` | Novedades | Registro de ausencias, incapacidades, permisos, cambios de turno y coberturas. Filtros por texto, estado, tipo y semana. |
| `/aprobaciones` | Aprobaciones | Bandeja de novedades pendientes con detalle, aprobación y rechazo motivado. |
| `/historico` | Histórico | Consulta de novedades gestionadas con trazabilidad del aprobador y exportación CSV. |
| `/informes` | Informes | Indicadores por turno, tipo, estado, analista y semana, con exportación CSV. |

### Reglas de negocio implementadas

- **Cinco turnos:** T1 `06:00–14:00`, T2 `14:00–22:00`, T3 `22:00–06:00`, T4 descanso,
  T5 oficina `08:00–17:00`.
- **Rotación cíclica semanal:** cada analista avanza un turno por semana
  (`T1 → T2 → T3 → T4 → T5 → T1`). La semana en curso coincide con la asignación de referencia.
- **Cinco analistas** con turno inicial distinto, de modo que la matriz siempre cubra los turnos
  operativos.
- **Las novedades nacen pendientes** y no modifican la programación hasta ser aprobadas.
- **La aprobación aplica el turno reorganizado** y la cobertura propuesta; el turno original
  se conserva en el registro histórico de la novedad.
- **El rechazo exige un motivo** (mínimo 5 caracteres) y mantiene el turno original vigente.
- **Toda gestión deja trazabilidad:** estado, usuario aprobador y fecha de gestión.
- **El analista que cubre debe ser distinto** del analista afectado.
- **La ventana de programación se recentra** automáticamente si la semana actual queda fuera
  del rango almacenado.

---

## 3. Arquitectura

Organización por **feature** y, dentro de cada feature, por capas de Clean Architecture:

```
src/app/
├── core/                     # Sesión, notificaciones, utilidades y shell
├── shared/                   # Componentes, pipes y utilidades reutilizables
└── features/
    ├── programacion/
    │   ├── domain/           # Entidades, repositorio abstracto y casos de uso
    │   ├── application/      # Tokens de DI y fachadas
    │   ├── infrastructure/   # DTOs, mappers, repositorio localStorage y seed
    │   └── ui/               # Containers y componentes presentacionales
    ├── novedades/            # Misma estructura
    ├── inicio/
    ├── aprobaciones/
    ├── historico/
    └── informes/
```

### Decisiones técnicas

- **Angular standalone + signals + `inject()`**, sin `NgModules` y con detección de cambios
  zoneless (`provideZonelessChangeDetection`).
- **Separación Container / Presentational:** los containers orquestan estado y casos de uso;
  los componentes presentacionales solo reciben `input()` y emiten `output()`.
- **Dominio libre de Angular:** entidades, reglas y casos de uso son clases/funciones puras.
  Las fachadas (`application`) son las únicas que usan `@Injectable` y `signal`.
- **Inversión de dependencias:** los repositorios se declaran como interfaces en `domain`,
  se exponen mediante `InjectionToken` en `application/tokens` y se enlazan a su implementación
  en `app.config.ts`.
- **Casos de uso instanciados por las fachadas** con el repositorio inyectado, evitando
  sobreingeniería con un contenedor DI adicional.
- **Lazy loading por feature** mediante `loadChildren` y rutas hijas.
- **Persistencia local** con `localStorage`, aislada tras la capa de infraestructura.
- **Diseño visual propio y coherente:** sidebar, topbar, tarjetas KPI, tablas, badges por turno,
  modales y notificaciones tipo toast. Los estilos globales viven en `src/styles.css`.

### Flujo de datos

```
Componente (UI)
   └── Fachada (application, signals)
          └── Caso de uso (domain)
                 └── Repositorio (interfaz)
                        └── Implementación localStorage (infrastructure)
```

Las fachadas `ProgramacionFacade` y `NovedadesFacade` son la fuente de verdad de la sesión.
`Inicio`, `Aprobaciones`, `Histórico` e `Informes` son features de solo UI que consumen esas
fachadas; se mantienen separadas por responsabilidad de pantalla sin duplicar estado.

---

## 4. Persistencia y datos de demostración

Claves de `localStorage`:

| Clave | Contenido |
| --- | --- |
| `sicov-ci2.programacion.v2` | Parámetros, analistas, turnos y 12 semanas generadas. |
| `sicov-ci2.novedades.v1` | Novedades registradas y su estado. |

- La programación cubre **12 semanas**: 4 históricas, la semana actual y 7 futuras.
- El seed de novedades incluye **5 registros**: 2 aprobados en semanas anteriores, 1 rechazado
  y 2 pendientes en la semana en curso.
- La fecha de referencia se calcula al primer arranque, por lo que los datos demo siempre son
  relativos a la semana actual.
- **Para reiniciar la demo**, elimina ambas claves desde DevTools → Application → Local Storage
  y recarga la página.

---

## 5. Supuestos y alcance

Estos puntos no estaban definidos en los documentos entregados y se resolvieron de forma
explícita:

1. **`context-ui/` estaba vacío.** No había referencias visuales, por lo que se propuso un
   sistema de diseño propio (paleta, tipografía, componentes y espaciados) coherente con una
   mesa de servicios.
2. **Sin backend.** Se eligió `localStorage` con datos semilla para que la aplicación sea
   ejecutable con `npm install && npm start`, tal como se solicitó. La interfaz de repositorio
   permite sustituir la implementación por una API sin tocar dominio ni UI.
3. **Horario del turno 5 (oficina).** El documento no lo especificaba; se asumió `08:00–17:00`.
4. **Estado `rechazada`.** El documento describe tres estados (sin novedad, pendiente y aprobada),
   pero el flujo de aprobación requiere rechazo. Se añadió `rechazada` para conservar el
   histórico y la trazabilidad sin eliminar el turno original.
5. **Sesión simulada.** El usuario demo es David Gonzalo Cajamarca Torres con rol
   «Jefe inmediato», lo que habilita la edición de parámetros y la aprobación. No se inventaron
   correos ni credenciales.
6. **Sin envío de notificaciones externas.** Los avisos son toasts en pantalla; no se integró
   correo ni mensajería.
7. **Nombres de features.** Se usaron módulos de negocio (`programacion`, `novedades`, `inicio`,
   `aprobaciones`, `historico`, `informes`) en lugar de los nombres ilustrativos
   (`proyectos`, `clientes`, `usuario`, `factura`) del documento de arquitectura.

---

## 6. Estructura de componentes destacada

- `core/layout/shell`: layout principal, navegación, indicador de pendientes y toasts.
- `shared/components`: `icon`, `avatar`, `badge`, `stat-card`, `modal`, `empty-state`,
  `page-header`.
- `features/programacion/ui/containers/programacion-container`: matriz semanal, selector de
  semana y modal de parámetros.
- `features/novedades/ui/containers/novedades-container`: registro, filtros y detalle.
- `features/novedades/ui/presentational/novedad-detalle`: vista reutilizable del detalle.
- `features/aprobaciones/ui/containers/aprobaciones-container`: bandeja y confirmación de
  aprobación/rechazo.
- `features/historico` e `features/informes`: consulta, indicadores y exportación CSV.

---

## 7. Verificación realizada

- `npm run build` finaliza correctamente (sin errores de compilación).
- `npm start` sirve la aplicación en `http://localhost:4200/`.
- Las seis rutas renderizan su contenedor sin errores en tiempo de ejecución.
- Flujo completo comprobado en navegador headless:
  1. Registrar una novedad → queda **pendiente**.
  2. Aprobarla desde `/aprobaciones` → queda **aprobada** con el usuario y la fecha de gestión.
  3. Abrir `/programacion` → la semana actual muestra el **turno reorganizado** para el analista
     afectado.
- Exportación CSV disponible en Histórico e Informes.
