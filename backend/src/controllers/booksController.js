const {
  findAllBooks,
  findBookById,
  findBookAvailability,
  findBooksMeta,
} = require('../database');

// Los controllers no contienen datos. Solo traducen una peticion HTTP a una
// llamada del adaptador database y devuelven una respuesta JSON.
const listBooks = async (req, res) => {
  const books = await findAllBooks(req.query);
  res.json(books);
};

const getBook = async (req, res) => {
  const book = await findBookById(Number(req.params.id));

  if (!book) {
    return res.status(404).json({ message: 'Libro no encontrado' });
  }

  return res.json(book);
};

const getBooksMeta = async (req, res) => {
  const meta = await findBooksMeta();
  res.json(meta);
};

const getBookAvailability = async (req, res) => {
  const availability = await findBookAvailability(Number(req.params.id));

  if (!availability) {
    return res.status(404).json({ message: 'Libro no encontrado' });
  }

  return res.json(availability);
};

module.exports = {
  listBooks,
  getBook,
  getBooksMeta,
  getBookAvailability,
};
