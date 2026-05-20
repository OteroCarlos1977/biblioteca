import { Card, Table } from 'react-bootstrap';

export const BooksTable = ({ books, onSelectBook }) => {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="m-0">Catalogo de libros</h5>
          <span className="text-muted">{books.length} resultados</span>
        </div>
        <p className="text-muted small mb-3">Haz click en un libro para ver disponibilidad e historial reciente.</p>

        <div className="table-wrap">
          <Table hover responsive align="middle">
            <thead className="table-dark">
              <tr>
                <th>ISBN</th>
                <th>Titulo</th>
                <th>Autor</th>
                <th>Tematica</th>
                <th>Año</th>
                <th>Editorial</th>
                <th>Ejemplares</th>
              </tr>
            </thead>
            <tbody>
              {books.map(book => (
                <tr key={book.id} role="button" onClick={() => onSelectBook(book)}>
                  <td>{book.isbn}</td>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.topic}</td>
                  <td>{book.year}</td>
                  <td>{book.publisher}</td>
                  <td>{book.availableCopies}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};
