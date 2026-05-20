# Flujo del proyecto Biblioteca

Este proyecto es una aplicacion modular con React, Vite, Node.js y Express. Trabaja con datos hardcodeados de biblioteca y deja preparada una capa de acceso a datos para reemplazar esos datos por una base real mas adelante.

## Resumen

- Frontend: React + Vite + React-Bootstrap.
- Backend: Node.js + Express.
- Puerto backend: `5010`.
- Puerto frontend: `5173`.
- Datos actuales por defecto: memoria hardcodeada.
- Base alternativa disponible: Firebase Firestore mediante `DB_PROVIDER=firebase`.
- Entidades: libros, usuarios y prestamos.

El puerto `5000` estaba ocupado cuando se creo el proyecto, por eso este backend usa `5010`.

## Datos incluidos

- 1200 libros generados en memoria.
- 60 usuarios de biblioteca generados en memoria.
- Prestamos generados en memoria.

Los libros incluyen:

```txt
id, isbn, title, author, year, publisher, topic, edition, pages, language, availableCopies, shelfCode
```

Los usuarios incluyen:

```txt
id, memberNumber, firstName, lastName, dni, address, phone, email, city, status, registeredAt
```

Los prestamos incluyen:

```txt
id, bookId, userId, loanDate, dueDate, returnedAt, status
```

Los datos se regeneran al iniciar el backend. Si se reinicia el servidor, se vuelve al estado inicial.

## Estructura backend

```txt
backend/
  server.js
  src/
    controllers/
      booksController.js
      usersController.js
      loansController.js
    database/
      index.js
      hardcodedDatabase.js
      librarySeed.js
      mysqlConnection.js
      sqliteConnection.js
      postgresConnection.js
      firebaseConnection.js
    routes/
      booksRoutes.js
      usersRoutes.js
      loansRoutes.js
```

Responsabilidades:

- `server.js`: configura Express, CORS, JSON y monta rutas.
- `routes`: define URLs y conecta cada endpoint con su controller.
- `controllers`: traduce HTTP a operaciones del dominio. Recibe `req`, usa `database`, responde con `res`.
- `database/index.js`: selecciona el adaptador de datos activo.
- `hardcodedDatabase.js`: implementa consultas y reglas con arrays en memoria.
- `librarySeed.js`: genera libros, usuarios y prestamos iniciales.
- `mysqlConnection.js`, `sqliteConnection.js`, `postgresConnection.js`: placeholders para futuras bases reales.
- `firebaseConnection.js`: adaptador real para Firestore usando Firebase Admin.

## Estructura frontend

```txt
frontend/src/
  components/
    BookFilters.jsx
    BookHistoryModal.jsx
    BooksTable.jsx
    LibraryStats.jsx
    LoansPanel.jsx
    UserHistoryModal.jsx
    UsersTable.jsx
  hooks/
    useLibrary.js
  pages/
    LibraryPage.jsx
  services/
    libraryService.js
  App.jsx
  main.jsx
```

Responsabilidades:

- `App.jsx`: renderiza `LibraryPage`.
- `LibraryPage.jsx`: coordina la pantalla y abre/cierra modales.
- `useLibrary.js`: administra estado, carga inicial, filtros, prestamos, devoluciones y disponibilidad.
- `libraryService.js`: concentra llamadas `fetch` al backend.
- `components`: muestran UI y reciben datos/callbacks por props.

## Flujo de datos

Consulta normal:

```txt
Componente React
  -> useLibrary
  -> libraryService
  -> Express route
  -> Controller
  -> database/index.js
  -> hardcodedDatabase.js
  -> respuesta JSON
  -> useLibrary actualiza estado
  -> React renderiza
```

Ejemplo de carga de libros:

```txt
LibraryPage
  -> useLibrary.loadInitialData()
  -> getBooks()
  -> GET /api/books
  -> booksRoutes
  -> booksController.listBooks
  -> database.findAllBooks
  -> hardcodedDatabase.findAllBooks
```

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

Filtros soportados:

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

## Reglas de prestamos

- Un libro puede prestarse si `availableCopies` es mayor que la cantidad de prestamos activos de ese libro.
- Un usuario suspendido no puede recibir prestamos.
- Un mismo usuario no puede tener activo dos veces el mismo libro.
- Al devolver, el prestamo cambia de `Activo` a `Devuelto` y se completa `returnedAt`.
- La disponibilidad se calcula, no se guarda como dato duplicado.

## Flujos de pantalla

### Libros

La pestaña `Libros` muestra el catalogo y filtros.

Al hacer click en un libro:

```txt
BooksTable
  -> onSelectBook
  -> LibraryPage.openBookHistory
  -> useLibrary.checkSelectedBookAvailability
  -> GET /api/books/:id/availability
  -> BookHistoryModal
```

El modal muestra datos del libro, disponibilidad actual y los ultimos 5 prestamos del libro.

### Usuarios

La pestaña `Usuarios` muestra los socios de biblioteca.

Al hacer click en un usuario:

```txt
UsersTable
  -> onSelectUser
  -> LibraryPage selecciona usuario
  -> UserHistoryModal recibe prestamos filtrados por userId
```

El modal muestra historial de libros retirados y cuantos libros conserva activos.

### Prestamos

La pestaña `Prestamos` permite:

- seleccionar libro;
- consultar disponibilidad;
- seleccionar usuario;
- registrar prestamo;
- devolver prestamos activos.
- eliminar prestamos con confirmacion previa.

Al registrar un prestamo correctamente, el formulario se limpia y la card de disponibilidad desaparece para dejar listo el siguiente registro.

Los mensajes emergentes usan Sileo. Se muestran avisos para guardado, actualizacion/devolucion, errores y confirmacion de eliminacion.

### Modo claro/oscuro

La cabecera principal incluye un boton para alternar entre modo claro y oscuro. La preferencia se guarda en `localStorage` con la clave `biblioteca-theme`.

El cambio se aplica con:

```txt
document.documentElement.setAttribute('data-bs-theme', theme)
document.body.dataset.theme = theme
```

`data-bs-theme` permite que Bootstrap adapte cards, formularios, modales y tablas. Los estilos propios del fondo y algunos textos se ajustan desde `index.css`.

## Capa database

`database/index.js` exporta el adaptador activo. Por defecto usa:

```txt
DB_PROVIDER=hardcoded
```

Si no se define `DB_PROVIDER`, tambien usa `hardcoded`.

Para usar Firebase se cambia el proveedor:

```txt
DB_PROVIDER=firebase
```

El frontend no se conecta directo a Firebase. React sigue usando `libraryService.js`, que consulta al backend Express. El backend decide si obtiene los datos desde memoria o desde Firestore. Esto protege las credenciales y mantiene la modularizacion:

```txt
React
  -> backend Express
  -> controller
  -> database/index.js
  -> firebaseConnection.js
  -> Firestore
```

Los adaptadores futuros deben respetar la interfaz usada por los controllers:

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

La idea es que los controllers no tengan que cambiar si mañana se reemplaza memoria por MySQL, SQLite, PostgreSQL o Firebase.

### Configuracion de Firebase

El backend usa `firebase-admin`, porque la conexion a Firestore necesita credenciales privadas. Esas credenciales no deben guardarse en el frontend.

Crear `backend/.env` tomando como base `backend/.env.example`:

```txt
PORT=5010
DB_PROVIDER=firebase
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_SERVICE_ACCOUNT_PATH=C:\ruta\segura\serviceAccountKey.json
FIREBASE_BOOKS_COLLECTION=books
FIREBASE_USERS_COLLECTION=users
FIREBASE_LOANS_COLLECTION=loans
```

Pasos generales:

1. Crear proyecto en Firebase.
2. Crear una base Firestore.
3. Generar una clave privada en Configuracion del proyecto > Cuentas de servicio.
4. Guardar el JSON fuera del repositorio.
5. Apuntar `FIREBASE_SERVICE_ACCOUNT_PATH` a ese archivo.
6. Ejecutar la carga inicial:

```bash
cd C:\biblioteca\backend
npm run seed:firebase
```

El seed crea las colecciones `books`, `users` y `loans` con los mismos datos que hoy se generan en memoria.

Para volver a trabajar sin Firebase, usar:

```txt
DB_PROVIDER=hardcoded
```

## Ejecucion

Backend:

```bash
cd C:\biblioteca\backend
npm install
npm start
```

Frontend:

```bash
cd C:\biblioteca\frontend
npm install
npm run dev
```

URLs:

```txt
Backend: http://localhost:5010
Frontend: http://127.0.0.1:5173
```

## Validacion

Backend:

```bash
cd C:\biblioteca\backend
npm run check
```

Frontend:

```bash
cd C:\biblioteca\frontend
npm run build
```

## Convenciones

El proyecto usa nombres tecnicos en ingles: `components`, `services`, `hooks`, `pages`, `routes`, `controllers`, `database`.

Los comentarios dentro del codigo no explican cada linea. Su objetivo es orientar el flujo: donde entra una peticion, que capa responde, donde se calcula disponibilidad y que estado usa cada parte del frontend.
