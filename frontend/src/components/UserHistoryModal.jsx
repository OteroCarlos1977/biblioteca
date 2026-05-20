import { Badge, Modal, Table } from 'react-bootstrap';

export const UserHistoryModal = ({ show, user, loans, onClose }) => {
  // loans ya llega filtrado desde LibraryPage. Aca solo se separan activos
  // para indicar si el usuario conserva libros en su poder.
  const activeLoans = loans.filter(loan => loan.status === 'Activo');

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Historial de {user?.firstName} {user?.lastName}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {user && (
          <div className="mb-3">
            <p className="mb-1"><strong>Nro usuario:</strong> {user.memberNumber}</p>
            <p className="mb-1"><strong>DNI:</strong> {user.dni}</p>
            <p className="mb-1"><strong>Email:</strong> {user.email}</p>
            <p className="mb-0">
              <strong>Libros actualmente en su poder:</strong>{' '}
              <Badge bg={activeLoans.length > 0 ? 'warning' : 'success'}>
                {activeLoans.length}
              </Badge>
            </p>
          </div>
        )}

        {loans.length === 0 ? (
          <p className="text-muted mb-0">Este usuario no registra prestamos.</p>
        ) : (
          <Table hover responsive align="middle">
            <thead className="table-dark">
              <tr>
                <th>Libro</th>
                <th>ISBN</th>
                <th>Fecha retiro</th>
                <th>Fecha vencimiento</th>
                <th>Fecha devolucion</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {loans.map(loan => (
                <tr key={loan.id}>
                  <td>{loan.bookTitle}</td>
                  <td>{loan.bookIsbn}</td>
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
