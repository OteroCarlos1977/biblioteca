require('dotenv').config();

const express = require('express');
const cors = require('cors');
const booksRoutes = require('./src/routes/booksRoutes');
const loansRoutes = require('./src/routes/loansRoutes');
const usersRoutes = require('./src/routes/usersRoutes');

// server.js es la puerta de entrada del backend.
// Mantiene responsabilidades generales: crear Express, registrar middlewares,
// montar rutas y levantar el servidor.
const PORT = process.env.PORT || 5010;
const app = express();

// Middlewares globales: se aplican antes de que la peticion llegue a routes.
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'API Biblioteca funcionando',
    endpoints: ['/api/books', '/api/users', '/api/loans'],
  });
});

app.use('/api/books', booksRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/loans', loansRoutes);

// En local ejecutamos app.listen(). En Vercel, el runtime serverless importa
// esta app y administra el servidor por su cuenta.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor biblioteca corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
