import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Container, Row, Spinner, Tab, Tabs } from 'react-bootstrap';
import { BookFilters } from '../components/BookFilters';
import { BookHistoryModal } from '../components/BookHistoryModal';
import { BooksTable } from '../components/BooksTable';
import { LibraryStats } from '../components/LibraryStats';
import { LoansPanel } from '../components/LoansPanel';
import { UserHistoryModal } from '../components/UserHistoryModal';
import { UsersTable } from '../components/UsersTable';
import { useLibrary } from '../hooks/useLibrary';
import { confirmWithToast } from '../services/notificationService';

export const LibraryPage = () => {
  const {
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
    removeLoan,
    returnBook,
    setSelectedBookAvailability,
  } = useLibrary();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('biblioteca-theme') || 'light');

  useEffect(() => {
    // Bootstrap lee data-bs-theme para aplicar colores claros/oscuros en sus
    // componentes. Lo ponemos en html para que tambien alcance a los modales.
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.body.dataset.theme = theme;
    localStorage.setItem('biblioteca-theme', theme);
  }, [theme]);

  // El modal de usuario recibe solo los prestamos de ese usuario.
  // useMemo evita recalcular el filtro en renders donde loans/user no cambiaron.
  const selectedUserLoans = useMemo(() => {
    if (!selectedUser) {
      return [];
    }

    return loans.filter(loan => loan.userId === selectedUser.id);
  }, [loans, selectedUser]);

  const openBookHistory = (book) => {
    // Abrir un libro dispara una consulta puntual de disponibilidad actual.
    // El historial sale de loans ya cargado en memoria del frontend.
    setSelectedBook(book);
    setSelectedBookAvailability(null);
    checkSelectedBookAvailability(book.id);
  };

  const closeBookHistory = () => {
    setSelectedBook(null);
    setSelectedBookAvailability(null);
  };

  const toggleTheme = () => {
    setTheme(currentTheme => currentTheme === 'light' ? 'dark' : 'light');
  };

  const confirmDeleteLoan = (loan) => {
    confirmWithToast({
      title: 'Confirmar eliminacion',
      description: `Prestamo #${loan.id} - ${loan.bookTitle}`,
      confirmText: 'Eliminar',
      onConfirm: () => removeLoan(loan.id),
    });
  };

  return (
    <Container className="py-5 app-shell">
      <header className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-4">
        <div>
          <p className="text-uppercase text-primary fw-bold mb-1">Biblioteca</p>
          <h1 className="display-5 fw-bold">Gestion modular de catalogo y usuarios</h1>
          <p className="lead mb-0">Datos hardcodeados servidos desde Node y consumidos por React.</p>
        </div>

        <div className="theme-actions">
          <Button
            variant={theme === 'light' ? 'outline-dark' : 'outline-light'}
            onClick={toggleTheme}
          >
            {theme === 'light' ? 'Modo oscuro' : 'Modo claro'}
          </Button>
        </div>
      </header>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p className="mt-3">Cargando biblioteca...</p>
        </div>
      ) : (
        <>
          <LibraryStats meta={meta} visibleBooks={books.length} visibleUsers={users.length} />
          <BookFilters
            filters={filters}
            meta={meta}
            onChange={setFilters}
            onSearch={searchBooks}
            onClear={clearFilters}
          />

          <Tabs defaultActiveKey="books" className="mb-3">
            <Tab eventKey="books" title="Libros">
              <BooksTable books={books} onSelectBook={openBookHistory} />
            </Tab>
            <Tab eventKey="users" title="Usuarios">
              <Row>
                <Col>
                  <UsersTable users={users} onSelectUser={setSelectedUser} />
                </Col>
              </Row>
            </Tab>
            <Tab eventKey="loans" title="Prestamos">
              <LoansPanel
                books={books}
                users={users}
                loans={loans}
                availability={availability}
                onCheckAvailability={checkAvailability}
                onClearAvailability={clearAvailability}
                onCreateLoan={loanBook}
                onDeleteLoan={confirmDeleteLoan}
                onReturnLoan={returnBook}
              />
            </Tab>
          </Tabs>

          <UserHistoryModal
            show={Boolean(selectedUser)}
            user={selectedUser}
            loans={selectedUserLoans}
            onClose={() => setSelectedUser(null)}
          />

          <BookHistoryModal
            show={Boolean(selectedBook)}
            book={selectedBook}
            availability={selectedBookAvailability}
            loans={loans}
            onClose={closeBookHistory}
          />
        </>
      )}
    </Container>
  );
};
