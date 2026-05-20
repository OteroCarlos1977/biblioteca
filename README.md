# Biblioteca

Aplicacion modular de biblioteca construida con React, Vite, Node.js y Express. El proyecto nacio como ejemplo educativo con datos hardcodeados y luego incorporo Firebase Firestore como base de datos real, manteniendo la misma estructura de capas.

## URLs

- App completa en Vercel: https://biblioteca-gilt-seven.vercel.app/
- API en el mismo dominio: `https://biblioteca-gilt-seven.vercel.app/api`
- Frontend alternativo en GitHub Pages: https://oterocarlos1977.github.io/biblioteca/
- Backend Vercel separado, mantenido como referencia: https://biblioteca-backend-blond.vercel.app
- Repositorio: https://github.com/OteroCarlos1977/biblioteca

En local:

```txt
Backend: http://localhost:5010
Frontend: http://127.0.0.1:5173
```

## Stack

- Frontend: React, Vite, React-Bootstrap, Bootstrap y Sileo.
- Backend: Node.js, Express y CORS.
- Base de datos local por defecto: datos hardcodeados en memoria.
- Base de datos real disponible: Firebase Firestore con `firebase-admin`.
- Despliegue principal: Vercel con frontend y backend en el mismo proyecto.
- Despliegue alternativo: GitHub Pages para frontend y Vercel para backend.

## Datos

El proyecto trabaja con tres entidades principales:

- Libros: 1200 registros.
- Usuarios: 60 registros.
- Prestamos: 90 registros iniciales.

Campos principales:

```txt
Libro: id, isbn, title, author, year, publisher, topic, edition, pages, language, availableCopies, shelfCode
Usuario: id, memberNumber, firstName, lastName, dni, address, phone, email, city, status, registeredAt
Prestamo: id, bookId, userId, loanDate, dueDate, returnedAt, status
```

## Estructura

```txt
biblioteca/
  backend/
    server.js
    vercel.json
    scripts/
      seedFirebase.js
    src/
      controllers/
      database/
      routes/
  frontend/
    index.html
    vite.config.js
    src/
      components/
      hooks/
      pages/
      services/
      App.jsx
      main.jsx
```

Responsabilidades principales:

- `backend/server.js`: configura Express, CORS, JSON, rutas y exporta la app para Vercel.
- `backend/src/routes`: define endpoints.
- `backend/src/controllers`: traduce peticiones HTTP a operaciones de datos.
- `backend/src/database/index.js`: selecciona el proveedor activo mediante `DB_PROVIDER`.
- `backend/src/database/hardcodedDatabase.js`: implementa la version en memoria.
- `backend/src/database/firebaseConnection.js`: implementa la version Firestore.
- `frontend/src/services/libraryService.js`: concentra las llamadas `fetch`.
- `frontend/src/hooks/useLibrary.js`: administra estado, carga inicial, filtros y operaciones.
- `frontend/src/pages/LibraryPage.jsx`: coordina la pantalla principal.
- `frontend/src/components`: contiene tablas, filtros, modales, cards y formularios.

## Flujo

```txt
Componente React
  -> useLibrary
  -> libraryService
  -> Backend Express
  -> Route
  -> Controller
  -> database/index.js
  -> hardcodedDatabase.js o firebaseConnection.js
  -> respuesta JSON
  -> React actualiza pantalla
```

El frontend no se conecta directamente a Firebase. La conexion con Firestore vive en el backend para proteger credenciales y mantener la modularizacion.

## Funcionalidades

- Listado y busqueda de libros.
- Filtros por titulo, autor, editorial, tematica y año.
- Listado de usuarios.
- Registro de prestamos.
- Devolucion de prestamos.
- Eliminacion de prestamos con confirmacion.
- Consulta de disponibilidad de libros.
- Modal de historial de usuario.
- Modal de historial de libro con ultimos prestamos.
- Modo claro y oscuro.
- Mensajes emergentes con Sileo para guardado, actualizacion, error y confirmacion.

## Endpoints

Libros:

```txt
GET /api/books
GET /api/books/meta
GET /api/books/:id
GET /api/books/:id/availability
```

Usuarios:

```txt
GET /api/users
GET /api/users/:id
```

Prestamos:

```txt
GET /api/loans
GET /api/loans/:id
POST /api/loans
PUT /api/loans/:id/return
DELETE /api/loans/:id
```

Filtros de ejemplo:

```txt
GET /api/books?topic=Historia
GET /api/books?author=Ana
GET /api/books?publisher=Biblios
GET /api/books?year=2001
GET /api/books?title=Manual
GET /api/loans?status=Activo
GET /api/loans?bookId=10
GET /api/loans?userId=4
```

## Reglas de negocio

- Un libro puede prestarse si quedan ejemplares disponibles.
- La disponibilidad se calcula con ejemplares totales menos prestamos activos.
- Un usuario suspendido no puede recibir prestamos.
- Un usuario no puede tener activo dos veces el mismo libro.
- Al devolver un prestamo, cambia de `Activo` a `Devuelto` y se completa `returnedAt`.
- La disponibilidad no se guarda como campo fijo para evitar datos desincronizados.

## Base de datos

El backend selecciona proveedor con:

```txt
DB_PROVIDER=hardcoded
```

o:

```txt
DB_PROVIDER=firebase
```

Los adaptadores deben respetar esta interfaz:

```txt
findAllBooks
findBookById
findBooksMeta
findAllUsers
findUserById
findAllLoans
findLoanById
findBookAvailability
insertLoan
returnLoanById
deleteLoanById
```

Esto permite cambiar entre memoria, Firebase u otra base futura sin reescribir rutas ni controladores.

## Configuracion local

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Firebase

Crear `backend/.env` tomando como referencia `backend/.env.example`.

Para usar Firebase con clave local:

```txt
PORT=5010
DB_PROVIDER=firebase
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_SERVICE_ACCOUNT_PATH=C:\ruta\segura\serviceAccountKey.json
FIREBASE_BOOKS_COLLECTION=books
FIREBASE_USERS_COLLECTION=users
FIREBASE_LOANS_COLLECTION=loans
```

Para cargar datos iniciales en Firestore:

```bash
cd backend
npm run seed:firebase
```

El archivo JSON de Firebase no debe subirse al repositorio. En produccion se usa la variable `FIREBASE_SERVICE_ACCOUNT_JSON` configurada como secreto del hosting.

## Despliegue

### App completa en Vercel

La raiz del proyecto incluye `vercel.json` para publicar la aplicacion completa:

```txt
/          -> frontend React
/api/*     -> backend Express
```

En este modo, el frontend usa `/api` como URL relativa y no necesita una variable `VITE_API_URL`.

### Frontend en GitHub Pages

El workflow `.github/workflows/github-pages.yml` publica `frontend/dist` en GitHub Pages.

La URL del backend se define como variable del repositorio:

```txt
VITE_API_URL=https://biblioteca-backend-blond.vercel.app/api
```

### Backend en Vercel

El backend usa `backend/vercel.json` y exporta la app Express desde `server.js`.

Variables necesarias en Vercel:

```txt
DB_PROVIDER
FIREBASE_PROJECT_ID
FIREBASE_SERVICE_ACCOUNT_JSON
FIREBASE_BOOKS_COLLECTION
FIREBASE_USERS_COLLECTION
FIREBASE_LOANS_COLLECTION
```

## Validacion

Backend:

```bash
cd backend
npm run check
```

Frontend:

```bash
cd frontend
npm run build
```

## Convenciones

El proyecto usa nombres tecnicos en ingles para respetar convenciones comunes del ecosistema: `components`, `services`, `hooks`, `pages`, `routes`, `controllers` y `database`.

La documentacion, comentarios orientativos y mensajes de commit se escriben en español. Los comentarios dentro del codigo buscan explicar el flujo y las responsabilidades de cada capa, no describir linea por linea lo que el codigo ya expresa.
