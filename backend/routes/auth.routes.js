const express = require('express');
const router  = express.Router();
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
} = require('../controllers/auth.controller');
const protect = require('../middleware/auth.middleware');

router.post('/register',   register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login',      login);          // 🆕
router.get('/me',          protect, getMe); // 🆕 protected

module.exports = router;