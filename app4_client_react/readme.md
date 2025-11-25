# 1) Crear app React (Webpack + CRA)
npx create-react-app app3_client_react

# 2) Entrar y añadir dependencias
cd app3_client_react
npm i bootstrap

# Lint bonito
npm i -D prettier

# iniciar el proyecto
npm start


app3_client_react/
│
├── #1 .env.development.local       → Variables de entorno (puerto, URL API Flask)
│
├── #2 package.json                 → Configura dependencias y scripts (npm start, build…)*
├── package-lock.json               → Registro exacto de versiones instaladas*
│
├── #3 public/
│   └── index.html                  → HTML base donde React inserta la app (<div id="root">)*
│
├── #4 src/                         → Código fuente React
│   ├── index.js                    → Punto de entrada. Monta <App /> en #root
│   ├── index.css                   → Estilos globales (a medida del desarrollador)*
│   │
│   ├── #5 App.jsx                  → Componente principal. Orquesta todo el CRUD
│   ├── App.css                     → Estilos específicos de la interfaz*
│   │
│   ├── #6 services/
│   │   └── api.js                  → Capa de comunicación con el backend Flask (fetch)
│   │
│   ├── #7 components/
│   │   ├── ProductRow.jsx          → Fila editable (editar/eliminar productos)
│   │   └── AlertBox.jsx            → Componente de alerta auto-ocultable
│   │
│   ├── logo.svg                    → Imagen del logo (la que trae por defecto react u otra a elección personal)*
│   ├── reportWebVitals.js          → Métricas de rendimiento (no afecta la app)*
│   ├── setupTests.js               → Configuración para pruebas unitarias*
│   └── App.test.js                 → Archivo base para test de React*
│
├── #8 .gitignore                   → Archivos que Git debe ignorar (node_modules, build…)*
├── leer.md                         → Notas o documentación interna (lo genera la instalación)*
└── readme.md                       → Instrucciones generales del proyecto (lo elaboramos nosotros)


# Orden de ejecución/interacción en tiempo real del proyecto


|  #  | Archivo / Carpeta                 | Rol              | Acción principal                                        |
| :-: | --------------------------------- | ---------------- | ------------------------------------------------------- |
|  1  | `.env.development.local`          | Configuración    | Define el puerto y la URL del backend Flask             |
|  2  | `package.json`                    | Inicialización   | Instala React y dependencias (Bootstrap, etc.)          |
|  3  | `public/index.html`               | Base HTML        | Renderiza el contenedor donde React montará la app      |
|  4  | `src/index.js`                    | Entrada JS       | Carga Bootstrap y renderiza `<App />`                   |
|  5  | `src/App.jsx`                     | Lógica central   | Muestra tabla, formulario y orquesta CRUD               |
|  6  | `src/services/api.js`             | Comunicación API | Ejecuta peticiones a Flask (`GET/POST/PUT/DELETE`)      |
|  7  | `src/components/*`                | Componentes UI   | - `ProductRow`: fila editable<br>- `AlertBox`: mensajes |
|  8  | `.env` / `package.json` / `build` | Infraestructura  | Determinan puerto, entorno y despliegue final           |





