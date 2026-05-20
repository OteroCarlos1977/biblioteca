const { createBooks, createLibraryUsers, createLoans } = require('./librarySeed');

// Adaptador activo por defecto.
// Simula una base de datos con 1200 libros y 60 usuarios en memoria.
// Todas las funciones son async para mantener la misma forma que tendrian
// consultas reales a una base de datos.
let books = createBooks();
let users = createLibraryUsers();
let loans = createLoans();
let nextLoanId = Math.max(...loans.map(loan => loan.id)) + 1;

const normalize = (value) => String(value || '').toLowerCase();

const findAllBooks = async (filters = {}) => {
  return books.filter(book => {
    const matchesTopic = !filters.topic || normalize(book.topic).includes(normalize(filters.topic));
    const matchesAuthor = !filters.author || normalize(book.author).includes(normalize(filters.author));
    const matchesPublisher = !filters.publisher || normalize(book.publisher).includes(normalize(filters.publisher));
    const matchesTitle = !filters.title || normalize(book.title).includes(normalize(filters.title));
    const matchesYear = !filters.year || book.year === Number(filters.year);

    return matchesTopic && matchesAuthor && matchesPublisher && matchesTitle && matchesYear;
  });
};

const findBookById = async (id) => {
  return books.find(book => book.id === id);
};

const findBooksMeta = async () => {
  return {
    totalBooks: books.length,
    totalUsers: users.length,
    topics: [...new Set(books.map(book => book.topic))].sort(),
    authors: [...new Set(books.map(book => book.author))].sort(),
    publishers: [...new Set(books.map(book => book.publisher))].sort(),
    years: [...new Set(books.map(book => book.year))].sort((a, b) => b - a),
  };
};

const findAllUsers = async (filters = {}) => {
  return users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`;
    const matchesName = !filters.name || normalize(fullName).includes(normalize(filters.name));
    const matchesDni = !filters.dni || user.dni.includes(String(filters.dni));
    const matchesMember = !filters.memberNumber || normalize(user.memberNumber).includes(normalize(filters.memberNumber));

    return matchesName && matchesDni && matchesMember;
  });
};

const findUserById = async (id) => {
  return users.find(user => user.id === id);
};

const buildLoanView = (loan) => {
  // Enriquecemos el prestamo con datos de libro y usuario para que el frontend
  // no tenga que cruzar entidades manualmente en cada tabla o modal.
  const book = books.find(currentBook => currentBook.id === loan.bookId);
  const user = users.find(currentUser => currentUser.id === loan.userId);

  return {
    ...loan,
    bookTitle: book?.title || 'Libro no encontrado',
    bookIsbn: book?.isbn || '',
    userFullName: user ? `${user.firstName} ${user.lastName}` : 'Usuario no encontrado',
    memberNumber: user?.memberNumber || '',
  };
};

const findAllLoans = async (filters = {}) => {
  return loans
    .filter(loan => !filters.status || loan.status === filters.status)
    .filter(loan => !filters.bookId || loan.bookId === Number(filters.bookId))
    .filter(loan => !filters.userId || loan.userId === Number(filters.userId))
    .map(buildLoanView);
};

const findLoanById = async (id) => {
  const loan = loans.find(currentLoan => currentLoan.id === id);
  return loan ? buildLoanView(loan) : null;
};

const findBookAvailability = async (bookId) => {
  const book = books.find(currentBook => currentBook.id === bookId);

  if (!book) {
    return null;
  }

  // La disponibilidad se calcula con ejemplares totales menos prestamos activos.
  // No se guarda como campo fijo porque podria desincronizarse.
  const activeLoans = loans.filter(loan => loan.bookId === bookId && loan.status === 'Activo');
  const availableToLoan = Math.max(book.availableCopies - activeLoans.length, 0);

  return {
    book,
    totalCopies: book.availableCopies,
    activeLoans: activeLoans.map(buildLoanView),
    activeLoansCount: activeLoans.length,
    availableToLoan,
    canLoan: availableToLoan > 0,
  };
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy.toISOString().slice(0, 10);
};

const insertLoan = async ({ bookId, userId }) => {
  const numericBookId = Number(bookId);
  const numericUserId = Number(userId);
  const book = books.find(currentBook => currentBook.id === numericBookId);
  const user = users.find(currentUser => currentUser.id === numericUserId);

  if (!book) {
    return { error: 'BOOK_NOT_FOUND' };
  }

  if (!user) {
    return { error: 'USER_NOT_FOUND' };
  }

  if (user.status !== 'Activo') {
    return { error: 'USER_NOT_ACTIVE' };
  }

  // Validamos disponibilidad y reglas de negocio antes de insertar el prestamo.
  const availability = await findBookAvailability(numericBookId);

  if (!availability.canLoan) {
    return { error: 'BOOK_NOT_AVAILABLE', availability };
  }

  const userAlreadyHasBook = loans.some(loan =>
    loan.bookId === numericBookId &&
    loan.userId === numericUserId &&
    loan.status === 'Activo'
  );

  if (userAlreadyHasBook) {
    return { error: 'USER_ALREADY_HAS_BOOK' };
  }

  const loanDate = new Date().toISOString().slice(0, 10);
  const newLoan = {
    id: nextLoanId,
    bookId: numericBookId,
    userId: numericUserId,
    loanDate,
    dueDate: addDays(loanDate, 14),
    returnedAt: null,
    status: 'Activo',
  };

  nextLoanId += 1;
  loans.push(newLoan);
  return { loan: buildLoanView(newLoan) };
};

const returnLoanById = async (id) => {
  const loan = loans.find(currentLoan => currentLoan.id === id);

  if (!loan) {
    return null;
  }

  loan.returnedAt = new Date().toISOString().slice(0, 10);
  loan.status = 'Devuelto';
  return buildLoanView(loan);
};

const deleteLoanById = async (id) => {
  const loanExists = loans.some(loan => loan.id === id);

  if (!loanExists) {
    return false;
  }

  loans = loans.filter(loan => loan.id !== id);
  return true;
};

module.exports = {
  findAllBooks,
  findBookById,
  findBooksMeta,
  findAllUsers,
  findUserById,
  findAllLoans,
  findLoanById,
  findBookAvailability,
  insertLoan,
  returnLoanById,
  deleteLoanById,
};
