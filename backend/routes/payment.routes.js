const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const { createOrder, verifyPayment, getTransactionHistory, cancelTransaction, debugPaymentSetup } = require('../controllers/payment.controller');

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/transaction-history', protect, getTransactionHistory);
router.post('/cancel-transaction/:transactionId', protect, cancelTransaction);
router.get('/debug', protect, debugPaymentSetup);

module.exports = router;
