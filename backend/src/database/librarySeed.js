// Este archivo concentra los datos base para generar un dataset grande.
// Aunque se generan con codigo para no escribir 1000 objetos a mano, siguen
// siendo datos hardcodeados: no vienen de una base externa ni de un archivo.

const topics = [
  'Programacion',
  'Historia',
  'Filosofia',
  'Ciencia',
  'Matematica',
  'Literatura',
  'Arte',
  'Educacion',
  'Psicologia',
  'Economia',
  'Derecho',
  'Medicina',
  'Arquitectura',
  'Sociologia',
  'Tecnologia',
  'Biologia',
  'Fisica',
  'Quimica',
  'Geografia',
  'Administracion',
];

const authors = [
  'Ana Torres',
  'Julian Ramirez',
  'Camila Rios',
  'Martin Alvarez',
  'Lucia Herrera',
  'Pablo Medina',
  'Sofia Castro',
  'Diego Fernandez',
  'Valentina Lopez',
  'Mateo Suarez',
  'Elena Molina',
  'Ricardo Pereyra',
  'Clara Navarro',
  'Andres Vega',
  'Mariana Campos',
  'Nicolas Silva',
  'Paula Benitez',
  'Hector Duarte',
  'Carolina Arias',
  'Gabriel Soto',
  'Rosa Fuentes',
  'Emilio Acosta',
  'Florencia Vidal',
  'Jorge Quintana',
  'Irene Salas',
];

const publishers = [
  'Editorial Norte',
  'Ediciones del Sur',
  'Biblios',
  'Aula Mayor',
  'Planeta Academica',
  'Puente Cultural',
  'Horizonte Libros',
  'Nova Lectura',
  'Raiz Editorial',
  'Siglo Abierto',
];

const titlePrefixes = [
  'Introduccion a',
  'Manual de',
  'Fundamentos de',
  'Historia de',
  'Practicas de',
  'Estudios sobre',
  'Guia de',
  'Pensar',
  'Claves de',
  'Problemas de',
];

const streets = [
  'Av. San Martin',
  'Belgrano',
  'Rivadavia',
  'Mitre',
  'Sarmiento',
  'Moreno',
  'Alsina',
  'Independencia',
  'Lavalle',
  'Italia',
];

const firstNames = [
  'Juan',
  'Maria',
  'Pedro',
  'Ana',
  'Luis',
  'Laura',
  'Carlos',
  'Sofia',
  'Miguel',
  'Lucia',
  'Diego',
  'Valeria',
  'Andres',
  'Paula',
  'Javier',
  'Camila',
  'Nicolas',
  'Florencia',
  'Martin',
  'Carla',
];

const lastNames = [
  'Gomez',
  'Perez',
  'Rodriguez',
  'Fernandez',
  'Lopez',
  'Diaz',
  'Martinez',
  'Sanchez',
  'Romero',
  'Torres',
  'Alvarez',
  'Ruiz',
  'Ramirez',
  'Acosta',
  'Benitez',
];

const createBooks = (amount = 1200) => {
  return Array.from({ length: amount }, (_, index) => {
    const id = index + 1;
    const topic = topics[index % topics.length];
    const author = authors[index % authors.length];
    const publisher = publishers[index % publishers.length];
    const year = 1975 + (index % 50);
    const title = `${titlePrefixes[index % titlePrefixes.length]} ${topic} - Tomo ${Math.floor(index / topics.length) + 1}`;

    return {
      id,
      isbn: `978-950-${String(id).padStart(6, '0')}`,
      title,
      author,
      year,
      publisher,
      topic,
      edition: `${(index % 5) + 1}a edicion`,
      pages: 120 + (index % 480),
      language: index % 7 === 0 ? 'Ingles' : 'Español',
      availableCopies: 1 + (index % 8),
      shelfCode: `${topic.slice(0, 3).toUpperCase()}-${String(id).padStart(4, '0')}`,
    };
  });
};

const createLibraryUsers = (amount = 60) => {
  return Array.from({ length: amount }, (_, index) => {
    const id = index + 1;
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[index % lastNames.length];
    const dni = 30000000 + index * 137;

    return {
      id,
      memberNumber: `SOC-${String(id).padStart(5, '0')}`,
      firstName,
      lastName,
      dni: String(dni),
      address: `${streets[index % streets.length]} ${100 + index * 11}`,
      phone: `11-4${String(2000000 + index * 3217).slice(0, 7)}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id}@biblioteca.test`,
      city: index % 2 === 0 ? 'Buenos Aires' : 'La Plata',
      status: index % 9 === 0 ? 'Suspendido' : 'Activo',
      registeredAt: `${2018 + (index % 7)}-${String((index % 12) + 1).padStart(2, '0')}-15`,
    };
  });
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy.toISOString().slice(0, 10);
};

const createLoans = (amount = 90) => {
  return Array.from({ length: amount }, (_, index) => {
    const id = index + 1;
    const loanDate = addDays('2026-01-10', index);
    const isReturned = index % 4 === 0;

    return {
      id,
      bookId: (index % 140) + 1,
      userId: (index % 60) + 1,
      loanDate,
      dueDate: addDays(loanDate, 14),
      returnedAt: isReturned ? addDays(loanDate, 7) : null,
      status: isReturned ? 'Devuelto' : 'Activo',
    };
  });
};

module.exports = {
  createBooks,
  createLibraryUsers,
  createLoans,
};
