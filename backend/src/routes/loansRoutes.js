const express = require('express');
const {
  createLoan,
  deleteLoan,
  getLoan,
  listLoans,
  returnLoan,
} = require('../controllers/loansController');

const router = express.Router();

router.get('/', listLoans);
router.get('/:id', getLoan);
router.post('/', createLoan);
router.put('/:id/return', returnLoan);
router.delete('/:id', deleteLoan);

module.exports = router;
