const express = require('express');
const router = express.Router();

const protect = require('../middleware/auth.middleware');
const { getCompanies } = require('../controllers/company.controller');

router.get('/', protect, getCompanies);

module.exports = router;
