const express  = require('express');
const router   = express.Router();
const protect  = require('../middleware/auth.middleware');
const {
  startInterview,
  respondToAnswer,
  finishInterview,
} = require('../controllers/interviewController');

router.post('/start',          protect, startInterview);
router.post('/:id/respond',    protect, respondToAnswer);
router.post('/:id/finish',     protect, finishInterview);

module.exports = router