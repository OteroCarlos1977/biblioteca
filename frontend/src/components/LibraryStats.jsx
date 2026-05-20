import { Card, Col, Row } from 'react-bootstrap';

export const LibraryStats = ({ meta, visibleBooks, visibleUsers }) => {
  const stats = [
    ['Libros cargados', meta?.totalBooks || 0],
    ['Libros visibles', visibleBooks],
    ['Usuarios', visibleUsers],
    ['Tematicas', meta?.topics?.length || 0],
  ];

  return (
    <Row className="g-3 mb-4">
      {stats.map(([label, value]) => (
        <Col md={3} sm={6} key={label}>
          <Card className="metric shadow-sm">
            <Card.Body>
              <div className="text-muted small">{label}</div>
              <div className="fs-3 fw-bold">{value}</div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};
