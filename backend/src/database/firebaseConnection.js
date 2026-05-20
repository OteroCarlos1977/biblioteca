const fs = require('fs');
const admin = require('firebase-admin');

// Este adaptador implementa la misma interfaz que hardcodedDatabase.js.
// Por eso los controllers pueden seguir importando desde ../database sin
// saber si los datos vienen de memoria o de Firestore.
const collections = {
  books: process.env.FIREBASE_BOOKS_COLLECTION || 'books',
  users: process.env.FIREBASE_USERS_COLLECTION || 'users',
  loans: process.env.FIREBASE_LOANS_COLLECTION || 'loans',
};

let firestoreInstance = null;

const getCredential = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    return admin.credential.cert(serviceAccount);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
    return admin.credential.cert(serviceAccount);
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.credential.applicationDefault();
  }

  throw new Error(
    'Firebase no tiene credenciales configuradas. Defini FIREBASE_SERVICE_ACCOUNT_PATH, FIREBASE_SERVICE_ACCOUNT_JSON o GOOGLE_APPLICATION_CREDENTIALS.'
  );
};

const getFirestore = () => {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: getCredential(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  firestoreInstance = admin.firestore();
  return firestoreInstance;
};

const normalize = (value) => String(value || '').toLowerCase();

const snapshotToList = (snapshot) => {
  return snapshot.docs.map(doc => doc.data());
};

const collection = (name) => {
  return getFirestore().collection(collections[name]);
};

const findByNumericId = async (collectionName, id) => {
  const numericId = Number(id);
  const doc = await collection(collectionName).doc(String(numericId)).get();

  if (doc.exists) {
    return doc.data();
  }

  // Fallback util si una carga manual guardo documentos con IDs generados.
  const snapshot = await collection(collectionName)
    .where('id', '==', numericId)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
};

const findAllBooks = async (filters = {}) => {
  const snapshot = await collection('books').get();
  const books = snapshotToList(snapshot);

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
  return findByNumericId('books', id);
};

const findBooksMeta = async () => {
  const books = await findAllBooks();
  const usersSnapshot = await collection('users').get();

  return {
    totalBooks: books.length,
    totalUsers: usersSnapshot.size,
    topics: [...new Set(books.map(book => book.topic))].sort(),
    authors: [...new Set(books.map(book => book.author))].sort(),
    publishers: [...new Set(books.map(book => book.publisher))].sort(),
    years: [...new Set(books.map(book => book.year))].sort((a, b) => b - a),
  };
};

const findAllUsers = async (filters = {}) => {
  const snapshot = await collection('users').get();
  const users = snapshotToList(snapshot);

  return users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`;
    const matchesName = !filters.name || normalize(fullName).includes(normalize(filters.name));
    const matchesDni = !filters.dni || String(user.dni).includes(String(filters.dni));
    const matchesMember = !filters.memberNumber || normalize(user.memberNumber).includes(normalize(filters.memberNumber));

    return matchesName && matchesDni && matchesMember;
  });
};

const findUserById = async (id) => {
  return findByNumericId('users', id);
};

const buildLoanView = (loan, booksById, usersById) => {
  const book = booksById.get(Number(loan.bookId));
  const user = usersById.get(Number(loan.userId));

  return {
    ...loan,
    bookTitle: book?.title || 'Libro no encontrado',
    bookIsbn: book?.isbn || '',
    userFullName: user ? `${user.firstName} ${user.lastName}` : 'Usuario no encontrado',
    memberNumber: user?.memberNumber || '',
  };
};

const getEntityMaps = async () => {
  const [booksSnapshot, usersSnapshot] = await Promise.all([
    collection('books').get(),
    collection('users').get(),
  ]);

  return {
    booksById: new Map(snapshotToList(booksSnapshot).map(book => [Number(book.id), book])),
    usersById: new Map(snapshotToList(usersSnapshot).map(user => [Number(user.id), user])),
  };
};

const findAllLoans = async (filters = {}) => {
  const snapshot = await collection('loans').get();
  const loans = snapshotToList(snapshot)
    .filter(loan => !filters.status || loan.status === filters.status)
    .filter(loan => !filters.bookId || loan.bookId === Number(filters.bookId))
    .filter(loan => !filters.userId || loan.userId === Number(filters.userId))
    .sort((a, b) => Number(a.id) - Number(b.id));
  const { booksById, usersById } = await getEntityMaps();

  return loans.map(loan => buildLoanView(loan, booksById, usersById));
};

const findLoanById = async (id) => {
  const loan = await findByNumericId('loans', id);

  if (!loan) {
    return null;
  }

  const { booksById, usersById } = await getEntityMaps();
  return buildLoanView(loan, booksById, usersById);
};

const findBookAvailability = async (bookId) => {
  const numericBookId = Number(bookId);
  const book = await findBookById(numericBookId);

  if (!book) {
    return null;
  }

  const loans = await findAllLoans({ bookId: numericBookId, status: 'Activo' });
  const availableToLoan = Math.max(book.availableCopies - loans.length, 0);

  return {
    book,
    totalCopies: book.availableCopies,
    activeLoans: loans,
    activeLoansCount: loans.length,
    availableToLoan,
    canLoan: availableToLoan > 0,
  };
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy.toISOString().slice(0, 10);
};

const getNextLoanId = async () => {
  const snapshot = await collection('loans').orderBy('id', 'desc').limit(1).get();

  if (snapshot.empty) {
    return 1;
  }

  return Number(snapshot.docs[0].data().id) + 1;
};

const insertLoan = async ({ bookId, userId }) => {
  const numericBookId = Number(bookId);
  const numericUserId = Number(userId);
  const [book, user] = await Promise.all([
    findBookById(numericBookId),
    findUserById(numericUserId),
  ]);

  if (!book) {
    return { error: 'BOOK_NOT_FOUND' };
  }

  if (!user) {
    return { error: 'USER_NOT_FOUND' };
  }

  if (user.status !== 'Activo') {
    return { error: 'USER_NOT_ACTIVE' };
  }

  const availability = await findBookAvailability(numericBookId);

  if (!availability.canLoan) {
    return { error: 'BOOK_NOT_AVAILABLE', availability };
  }

  const activeUserLoans = await findAllLoans({
    bookId: numericBookId,
    userId: numericUserId,
    status: 'Activo',
  });

  if (activeUserLoans.length > 0) {
    return { error: 'USER_ALREADY_HAS_BOOK' };
  }

  const id = await getNextLoanId();
  const loanDate = new Date().toISOString().slice(0, 10);
  const newLoan = {
    id,
    bookId: numericBookId,
    userId: numericUserId,
    loanDate,
    dueDate: addDays(loanDate, 14),
    returnedAt: null,
    status: 'Activo',
  };

  await collection('loans').doc(String(id)).set(newLoan);
  return { loan: await findLoanById(id) };
};

const returnLoanById = async (id) => {
  const numericId = Number(id);
  const loan = await findLoanById(numericId);

  if (!loan) {
    return null;
  }

  await collection('loans').doc(String(numericId)).update({
    returnedAt: new Date().toISOString().slice(0, 10),
    status: 'Devuelto',
  });

  return findLoanById(numericId);
};

const deleteLoanById = async (id) => {
  const numericId = Number(id);
  const loan = await findByNumericId('loans', numericId);

  if (!loan) {
    return false;
  }

  await collection('loans').doc(String(numericId)).delete();
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
