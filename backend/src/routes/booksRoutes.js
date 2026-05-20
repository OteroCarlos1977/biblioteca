const express = require('express');
const {
  getBook,
  getBookAvailability,
  getBooksMeta,
  listBooks,
} = require('../controllers/booksController');

const router = express.Router();

router.get('/', listBooks);
router.get('/meta', getBooksMeta);
router.get('/:id/availability', getBookAvailability);
router.get('/:id', getBook);

module.exports = router;
