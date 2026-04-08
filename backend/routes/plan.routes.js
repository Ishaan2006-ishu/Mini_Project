const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const { getPlans } = require('../controllers/plan.controller');

router.get('/', protect, getPlans);

module.exports = router;
