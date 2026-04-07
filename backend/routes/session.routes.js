const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const { getRoles, startSession, getHistory, getSession, submitSession } = require('../controllers/session.controller');

router.get('/roles', protect, getRoles);
router.post('/start', protect, startSession);
router.get('/history', protect, getHistory);
router.get('/:id', protect, getSession);
router.post('/:id/submit', protect, submitSession);

module.exports = router;
