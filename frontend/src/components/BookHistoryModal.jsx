import { Badge, Modal, Table } from 'react-bootstrap';

export const BookHistoryModal = ({ show, book, availability, loans, onClose }) => {
  // El modal muestra solo una ventana corta del historial para no saturar la UI.
  const lastFiveLoans = loans
    .filter(loan => loan.bookId === book?.id)
    .sort((a, b) => new Date(b.loanDate) - new Date(a.loanDate))
    .slice(0, 5);

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>{book?.title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {book && (
          <div className="mb-3">
            <p className="mb-1"><strong>ISBN:</strong> {book.isbn}</p>
            <p className="mb-1"><strong>Autor:</strong> {book.author}</p>
            <p className="mb-1"><strong>Tematica:</strong> {book.topic}</p>
            <p className="mb-1"><strong>Editorial:</strong> {book.publisher}</p>
            <p className="mb-1"><strong>Año:</strong> {book.year}</p>
            <p className="mb-0">
              <strong>Disponibilidad:</strong>{' '}
              <Badge bg={availability?.canLoan ? 'success' : 'danger'}>
                {availability ? `${availability.availableToLoan} disponibles` : 'Consultando'}
              </Badge>
            </p>
          </div>
        )}

        <h6>Ultimos 5 prestamos</h6>

        {lastFiveLoans.length === 0 ? (
          <p className="text-muted mb-0">Este libro no registra prestamos.</p>
        ) : (
          <Table hover responsive align="middle">
            <thead className="table-dark">
              <tr>
                <th>Usuario</th>
                <th>Nro usuario</th>
                <th>Fecha retiro</th>
                <th>Fecha vencimiento</th>
                <th>Fecha devolucion</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {lastFiveLoans.map(loan => (
                <tr key={loan.id}>
                  <td>{loan.userFullName}</td>
                  <td>{loan.memberNumber}</td>
                  <td>{loan.loanDate}</td>
                  <td>{loan.dueDate}</td>
                  <td>{loan.returnedAt || 'Aun en poder del usuario'}</td>
                  <td>
                    <Badge bg={loan.status === 'Activo' ? 'warning' : 'secondary'}>
                      {loan.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
};
