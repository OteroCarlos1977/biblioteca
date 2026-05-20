const notImplemented = () => {
  throw new Error('SQLite aun no esta implementado. Usar DB_PROVIDER=hardcoded por ahora.');
};

module.exports = {
  findAllBooks: notImplemented,
  findBookById: notImplemented,
  findBooksMeta: notImplemented,
  findAllUsers: notImplemented,
  findUserById: notImplemented,
  findAllLoans: notImplemented,
  findLoanById: notImplemented,
  findBookAvailability: notImplemented,
  insertLoan: notImplemented,
  returnLoanById: notImplemented,
  deleteLoanById: notImplemented,
};
