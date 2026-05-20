const {
  deleteLoanById,
  findAllLoans,
  findLoanById,
  insertLoan,
  returnLoanById,
} = require('../database');

// Prestamos concentra operaciones que modifican estado en memoria:
// crear un prestamo y registrar una devolucion.
const listLoans = async (req, res) => {
  const loans = await findAllLoans(req.query);
  res.json(loans);
};

const getLoan = async (req, res) => {
  const loan = await findLoanById(Number(req.params.id));

  if (!loan) {
    return res.status(404).json({ message: 'Prestamo no encontrado' });
  }

  return res.json(loan);
};

const createLoan = async (req, res) => {
  const result = await insertLoan(req.body);

  // hardcodedDatabase devuelve errores de negocio con codigos internos.
  // El controller los transforma en una respuesta HTTP 400 para el frontend.
  if (result.error) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result.loan);
};

const returnLoan = async (req, res) => {
  const loan = await returnLoanById(Number(req.params.id));

  if (!loan) {
    return res.status(404).json({ message: 'Prestamo no encontrado' });
  }

  return res.json(loan);
};

const deleteLoan = async (req, res) => {
  const wasDeleted = await deleteLoanById(Number(req.params.id));

  if (!wasDeleted) {
    return res.status(404).json({ message: 'Prestamo no encontrado' });
  }

  return res.json({ message: 'Prestamo eliminado' });
};

module.exports = {
  listLoans,
  getLoan,
  createLoan,
  returnLoan,
  deleteLoan,
};
