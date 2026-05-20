import { useState } from 'react';
import { Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
import { notifyWarning } from '../services/notificationService';

export const LoansPanel = ({
  books,
  users,
  loans,
  availability,
  onCheckAvailability,
  onClearAvailability,
  onCreateLoan,
  onDeleteLoan,
  onReturnLoan,
}) => {
  const [bookId, setBookId] = useState('');
  const [userId, setUserId] = useState('');

  const selectedBook = books.find(book => book.id === Number(bookId));

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!bookId || !userId) {
      notifyWarning('Faltan datos', 'Selecciona un libro y un usuario antes de registrar el prestamo.');
      return;
    }

    const wasCreated = await onCreateLoan({ bookId: Number(bookId), userId: Number(userId) });

    if (wasCreated) {
      // Despues de un prestamo exitoso, el formulario queda listo para el
      // siguiente registro y no mantiene la disponibilidad del libro anterior.
      setBookId('');
      setUserId('');
      onClearAvailability();
    }
  };

  return (
    <Row className="g-4">
      <Col lg={4}>
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">Nuevo prestamo</h5>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Libro</Form.Label>
                <Form.Select
                  value={bookId}
                  onChange={event => {
                    const selectedBookId = event.target.value;
                    setBookId(selectedBookId);

                    if (selectedBookId) {
                      onCheckAvailability(Number(selectedBookId));
                    } else {
                      onClearAvailability();
                    }
                  }}
                >
                  <option value="">Seleccionar libro</option>
                  {books.slice(0, 300).map(book => (
                    <option key={book.id} value={book.id}>
                      {book.id} - {book.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Usuario</Form.Label>
                <Form.Select value={userId} onChange={event => setUserId(event.target.value)}>
                  <option value="">Seleccionar usuario</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.memberNumber} - {user.firstName} {user.lastName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Button type="submit" className="w-100" disabled={!availability?.canLoan}>
                Registrar prestamo
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {bookId && availability && (
          <Card className="shadow-sm mt-3">
            <Card.Body>
              <h6>Disponibilidad</h6>
              <p className="mb-1"><strong>{availability.book.title}</strong></p>
              <p className="mb-1">Ejemplares totales: {availability.totalCopies}</p>
              <p className="mb-1">Prestamos activos: {availability.activeLoansCount}</p>
              <p className="mb-0">
                Disponibles: {' '}
                <Badge bg={availability.canLoan ? 'success' : 'danger'}>
                  {availability.availableToLoan}
                </Badge>
              </p>
            </Card.Body>
          </Card>
        )}

        {bookId && selectedBook && !availability && (
          <p className="text-muted mt-3">Seleccionaste {selectedBook.title}. Consulta disponibilidad para prestarlo.</p>
        )}
      </Col>

      <Col lg={8}>
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="mb-3">Prestamos</h5>
            <div className="table-wrap">
              <Table hover responsive align="middle">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Libro</th>
                    <th>Usuario</th>
                    <th>Prestamo</th>
                    <th>Vence</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {loans.map(loan => (
                    <tr key={loan.id}>
                      <td>{loan.id}</td>
                      <td>{loan.bookTitle}</td>
                      <td>{loan.userFullName}</td>
                      <td>{loan.loanDate}</td>
                      <td>{loan.dueDate}</td>
                      <td>
                        <Badge bg={loan.status === 'Activo' ? 'warning' : 'secondary'}>
                          {loan.status}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            disabled={loan.status !== 'Activo'}
                            onClick={() => onReturnLoan(loan.id)}
                          >
                            Devolver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => onDeleteLoan(loan)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};
