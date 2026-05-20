import { useEffect, useState } from 'react';
import {
  createLoan,
  deleteLoan,
  getBookAvailability,
  getBooks,
  getBooksMeta,
  getLoans,
  getUsers,
  returnLoan,
} from '../services/libraryService';
import { notifyError, notifySuccess } from '../services/notificationService';

// Hook principal de la biblioteca.
// La pagina usa este hook y no necesita conocer detalles de fetch ni endpoints.
export const useLibrary = () => {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [selectedBookAvailability, setSelectedBookAvailability] = useState(null);
  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState({
    title: '',
    topic: '',
    author: '',
    publisher: '',
    year: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Carga inicial de la pantalla: trae catalogo, usuarios, prestamos y metadata
  // en paralelo porque no dependen entre si.
  const loadInitialData = async () => {
    try {
      setErrorMessage('');
      const [booksData, usersData, loansData, metaData] = await Promise.all([
        getBooks(filters),
        getUsers(),
        getLoans(),
        getBooksMeta(),
      ]);

      setBooks(booksData);
      setUsers(usersData);
      setLoans(loansData);
      setMeta(metaData);
    } catch (error) {
      console.error(error);
      setErrorMessage('No se pudo conectar con el backend de biblioteca.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchBooks = async () => {
    try {
      setErrorMessage('');
      const booksData = await getBooks(filters);
      setBooks(booksData);
    } catch (error) {
      console.error(error);
      setErrorMessage('No se pudieron aplicar los filtros.');
    }
  };

  const clearFilters = async () => {
    const emptyFilters = {
      title: '',
      topic: '',
      author: '',
      publisher: '',
      year: '',
    };

    setFilters(emptyFilters);
    const booksData = await getBooks(emptyFilters);
    setBooks(booksData);
  };

  const checkAvailability = async (bookId) => {
    try {
      setErrorMessage('');
      const availabilityData = await getBookAvailability(bookId);
      setAvailability(availabilityData);
    } catch (error) {
      console.error(error);
      setErrorMessage('No se pudo consultar la disponibilidad del libro.');
    }
  };

  // Disponibilidad usada por el modal de libros. Esta separada de availability,
  // que pertenece al formulario de prestamos, para evitar estados cruzados.
  const checkSelectedBookAvailability = async (bookId) => {
    try {
      setErrorMessage('');
      const availabilityData = await getBookAvailability(bookId);
      setSelectedBookAvailability(availabilityData);
    } catch (error) {
      console.error(error);
      setErrorMessage('No se pudo consultar la disponibilidad del libro seleccionado.');
    }
  };

  const loanBook = async ({ bookId, userId }) => {
    try {
      setErrorMessage('');
      await createLoan({ bookId, userId });
      const loansData = await getLoans();
      setLoans(loansData);
      // Si el prestamo se registro, el formulario vuelve a estado limpio.
      setAvailability(null);
      notifySuccess('Prestamo registrado', 'El registro se guardo correctamente.');
      return true;
    } catch (error) {
      console.error(error);
      setErrorMessage('No se pudo crear el prestamo. Puede que no haya ejemplares o que el usuario ya tenga el libro.');
      notifyError('No se pudo guardar', 'Revisa disponibilidad, usuario activo o prestamos duplicados.');
      return false;
    }
  };

  const clearAvailability = () => {
    setAvailability(null);
  };

  const returnBook = async (loanId) => {
    try {
      setErrorMessage('');
      const returnedLoan = await returnLoan(loanId);
      const loansData = await getLoans();
      setLoans(loansData);

      // Si la devolucion afecta al libro que se esta mirando, refrescamos
      // su disponibilidad en pantalla.
      if (availability?.book?.id === returnedLoan.bookId) {
        const availabilityData = await getBookAvailability(returnedLoan.bookId);
        setAvailability(availabilityData);
      }

      notifySuccess('Prestamo actualizado', 'La devolucion fue registrada correctamente.');
    } catch (error) {
      console.error(error);
      setErrorMessage('No se pudo registrar la devolucion.');
      notifyError('No se pudo actualizar', 'La devolucion no pudo registrarse.');
    }
  };

  const removeLoan = async (loanId) => {
    try {
      setErrorMessage('');
      await deleteLoan(loanId);
      const loansData = await getLoans();
      setLoans(loansData);
      notifySuccess('Prestamo eliminado', 'El registro fue eliminado correctamente.');
    } catch (error) {
      console.error(error);
      setErrorMessage('No se pudo eliminar el prestamo.');
      notifyError('No se pudo eliminar', 'El registro no pudo eliminarse.');
    }
  };

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadInitialData();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return {
    books,
    users,
    loans,
    availability,
    selectedBookAvailability,
    meta,
    filters,
    isLoading,
    errorMessage,
    setFilters,
    searchBooks,
    clearFilters,
    checkAvailability,
    checkSelectedBookAvailability,
    clearAvailability,
    loanBook,
    returnBook,
    removeLoan,
    setSelectedBookAvailability,
  };
};
