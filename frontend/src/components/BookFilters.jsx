import { Button, Card, Col, Form, Row } from 'react-bootstrap';

export const BookFilters = ({ filters, meta, onChange, onSearch, onClear }) => {
  const updateField = (field, value) => {
    onChange(current => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Body>
        <Row className="g-3 align-items-end">
          <Col lg={3} md={6}>
            <Form.Label>Titulo</Form.Label>
            <Form.Control value={filters.title} onChange={event => updateField('title', event.target.value)} />
          </Col>

          <Col lg={2} md={6}>
            <Form.Label>Tematica</Form.Label>
            <Form.Select value={filters.topic} onChange={event => updateField('topic', event.target.value)}>
              <option value="">Todas</option>
              {meta?.topics?.map(topic => <option key={topic}>{topic}</option>)}
            </Form.Select>
          </Col>

          <Col lg={2} md={6}>
            <Form.Label>Autor</Form.Label>
            <Form.Select value={filters.author} onChange={event => updateField('author', event.target.value)}>
              <option value="">Todos</option>
              {meta?.authors?.map(author => <option key={author}>{author}</option>)}
            </Form.Select>
          </Col>

          <Col lg={2} md={6}>
            <Form.Label>Editorial</Form.Label>
            <Form.Select value={filters.publisher} onChange={event => updateField('publisher', event.target.value)}>
              <option value="">Todas</option>
              {meta?.publishers?.map(publisher => <option key={publisher}>{publisher}</option>)}
            </Form.Select>
          </Col>

          <Col lg={1} md={6}>
            <Form.Label>Año</Form.Label>
            <Form.Select value={filters.year} onChange={event => updateField('year', event.target.value)}>
              <option value="">Todos</option>
              {meta?.years?.map(year => <option key={year}>{year}</option>)}
            </Form.Select>
          </Col>

          <Col lg={2} md={6} className="d-flex gap-2">
            <Button className="w-100" onClick={onSearch}>Buscar</Button>
            <Button className="w-100" variant="secondary" onClick={onClear}>Limpiar</Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
