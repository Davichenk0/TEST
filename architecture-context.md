# Contexto del Proyecto: Angular con Clean Architecture y Organización por Features

## 1. Propósito y Alcance

Este documento define el contexto arquitectónico y las convenciones que debe seguir el agente de IA al generar, modificar o revisar código en este proyecto Angular. El objetivo es construir una aplicación escalable, mantenible y con una clara separación de responsabilidades, aplicando los principios de Clean Architecture y SOLID, sin incluir pruebas automatizadas por el momento.

## 2. Principios Rectores

### 2.1. Clean Architecture (Adaptada a Angular)

La arquitectura se organiza en capas concéntricas donde las dependencias apuntan siempre hacia adentro (hacia el dominio). La capa de Presentación (UI) puede depender de la capa de Aplicación/Dominio, pero nunca al revés.

Las capas lógicas dentro de cada feature son:

| Capa | Responsabilidad | Dependencias Permitidas |
|------|----------------|--------------------------|
| **Domain** | Entidades, interfaces de repositorio, casos de uso. Lógica de negocio pura. No depende de Angular ni de infraestructura. | Ninguna (o solo RxJS si es estrictamente necesario). |
| **Application** | Orquestación de casos de uso. Estado de la feature (si aplica). Fachadas (Facades) que exponen funcionalidad al UI. | Domain. |
| **Infrastructure** | Implementaciones concretas de repositorios (HTTP, localStorage). DTOs y mapeadores. | Domain. |
| **UI (Presentation)** | Componentes, directivas, pipes, rutas. | Application (preferiblemente) y Domain (solo para tipos). |

### 2.2. Principios SOLID

- **S (Single Responsibility):** Cada clase (servicio, componente, caso de uso) tiene una única razón para cambiar. Los componentes se dividen en **Container** (lógica y estado) y **Presentational** (renderizado puro).
- **O (Open/Closed):** Se prefieren interfaces y composición sobre herencia rígida. Las nuevas funcionalidades se añaden extendiendo, no modificando el núcleo existente.
- **L (Liskov Substitution):** Las implementaciones de repositorios respetan estrictamente el contrato de la interfaz definida en Domain.
- **I (Interface Segregation):** Se crean interfaces pequeñas y específicas por caso de uso. Evitar interfaces "gordas" que obliguen a implementar métodos innecesarios.
- **D (Dependency Inversion):** Los módulos de alto nivel (casos de uso, componentes) dependen de abstracciones (interfaces). La infraestructura (HttpClient) se inyecta como implementación concreta mediante el sistema de DI de Angular.

## 3. Estructura de Carpetas por Feature

La organización del código es **por dominio/feature**, no por tipo técnico (evitar carpetas globales como `components/`, `services/`). Cada feature es autocontenida y puede evolucionar de forma independiente.

```text
src/
├── app/
│   ├── core/                          # Servicios singleton, guards, interceptors globales
│   │   └── auth/
│   ├── shared/                        # Componentes UI reutilizables (presentacionales puros)
│   │   ├── components/
│   │   └── directives/
│   ├── features/
│   │   ├── proyectos/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── proyecto.entity.ts
│   │   │   │   ├── repositories/       # Interfaces (puertos)
│   │   │   │   │   └── proyecto.repository.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── crear-proyecto.use-case.ts
│   │   │   │       └── listar-proyectos.use-case.ts
│   │   │   ├── application/
│   │   │   │   ├── facades/
│   │   │   │   │   └── proyectos.facade.ts
│   │   │   │   └── state/              # Signals / NgRx (opcional)
│   │   │   ├── infrastructure/
│   │   │   │   ├── repositories/
│   │   │   │   │   └── proyecto-http.repository.ts
│   │   │   │   └── dtos/
│   │   │   │       └── proyecto.dto.ts
│   │   │   ├── ui/
│   │   │   │   ├── containers/
│   │   │   │   │   └── proyectos-list-container/
│   │   │   │   │       ├── proyectos-list-container.ts
│   │   │   │   │       ├── proyectos-list-container.html
│   │   │   │   │       └── proyectos-list-container.css
│   │   │   │   └── presentational/
│   │   │   │       └── proyecto-card/
│   │   │   │           ├── proyecto-card.ts
│   │   │   │           ├── proyecto-card.html
│   │   │   │           └── proyecto-card.css
│   │   │   └── proyectos.routes.ts
│   │   ├── clientes/
│   │   │   └── ... (misma estructura)
│   │   ├── usuario/
│   │   │   └── ...
│   │   └── factura/
│   │       └── ...
│   └── app.routes.ts