import { Badge, Card, Table } from 'react-bootstrap';

export const UsersTable = ({ users, onSelectUser }) => {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <h5 className="mb-3">Usuarios de biblioteca</h5>
        <p className="text-muted small mb-3">Haz click en un usuario para ver su historial de prestamos.</p>
        <div className="table-wrap">
          <Table hover responsive align="middle">
            <thead className="table-dark">
              <tr>
                <th>Nro usuario</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Domicilio</th>
                <th>Telefono</th>
                <th>Email</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr
                  key={user.id}
                  role="button"
                  onClick={() => onSelectUser(user)}
                >
                  <td>{user.memberNumber}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.dni}</td>
                  <td>{user.address}</td>
                  <td>{user.phone}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={user.status === 'Activo' ? 'success' : 'secondary'}>
                      {user.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};
