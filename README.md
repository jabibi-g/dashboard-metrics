# Dashboard ejecutivo de métricas de ventas

Permite a un Jefe de Ventas revisar en ~5 minutos el estado de su pipeline y navegar entre cuatro escenarios de datos (A, B, C, D).

```bash
npm install
npm run dev
# El backend correrá en http://localhost:3001
# El frontend correrá en http://localhost:5173 (o el siguiente puerto disponible)
```

---

## Tecnologías utilizadas (Tech Stack)

### Frontend
- **React (v18)**: Librería principal para la interfaz de usuario.
- **Vite (v6)**: Herramienta de compilación y servidor de desarrollo ultrarrápido.
- **TypeScript**: Tipado estático para mayor seguridad y robustez.
- **Recharts**: Biblioteca declarativa basada en componentes de React para la creación de gráficos.
- **Date-fns**: Utilidades para el manejo y formateo de fechas.
- **Vanilla CSS**: Estilos nativos utilizando *custom properties* (variables CSS).

### Backend
- **Node.js**: Entorno de ejecución.
- **Express.js (v5)**: Framework web minimalista para la API REST.
- **TypeScript**: Compartiendo interfaces directamente con el frontend.
- **Middlewares de seguridad y rendimiento**: `helmet`, `cors`, `compression`, `express-rate-limit` y `morgan`.
- **ts-node-dev**: Servidor de desarrollo con recarga en vivo para TypeScript.

### Arquitectura y Herramientas
- **Monolito unificado**: Código de cliente y servidor integrados en un único directorio `src/`.
- **Concurrently**: Herramienta para ejecutar los servidores de desarrollo de backend y frontend simultáneamente con un solo comando (`npm run dev`).

---

## 1. Decisiones técnicas

**Express.js**: Se descartaron frameworks más completos por no aportar nada a un problema de pura lectura. Middleware seleccionado con el mismo criterio: `compression` reduce los 668 KB del dataset a ~80 KB en tránsito; `helmet`, `morgan` y `express-rate-limit` cubren seguridad y observabilidad sin infraestructura adicional.

**Vite**: El frontend llama a `/api` sin configurar CORS en desarrollo. **Recharts** sobre Chart.js o D3 por ser declarativo y nativo en React. **Vanilla CSS con custom properties** mantiene la consistencia visual sin dependencias externas. Sin librería de estado global: el estado de la app son dos variables que `useState` maneja sin necesidad de Zustand ni Redux.

**Arquitectura unificada (Monolito)**: Originalmente divididos en dos sub-proyectos, el backend y frontend han sido unificados en un solo directorio raíz y una única carpeta `src/`. Al tratarse de un proyecto pequeño, esto elimina la duplicación de código (compartiendo directamente las interfaces de TypeScript), centraliza la gestión de dependencias en un único `package.json` y facilita la experiencia de desarrollo, permitiendo compilar y ejecutar ambas partes simultáneamente mediante `concurrently`.

**Stale-while-revalidate y panel de resumen**: Al cambiar de dataset, los hooks mantienen los datos anteriores visibles mientras llega la respuesta nueva. El panel de resumen semanal (`utils/insights.ts`) es una función pura que clasifica métricas por severidad y genera observaciones de negocio ordenadas por prioridad.

---

## 2. Segunda iteración

- **Selector de rango de fechas**: El backend ya acepta `?from=&to=`; solo falta el control en el frontend.
- **Mini sparklines en KPI cards**: Una línea de 30 puntos dentro de cada card daría contexto visual que el porcentaje solo no entrega.
- **Modo comparación**: Superponer dos datasets en el mismo gráfico para entender las diferencias entre escenarios.
- **Persistencia de preferencias**: Guardar dataset activo y métrica en `localStorage`.
- **Tests y datos en tiempo real**: `insights.ts` y `metrics.service.ts` son candidatas a unit tests por ser funciones puras; en producción el backend reemplazaría el JSON por una conexión a base de datos.
