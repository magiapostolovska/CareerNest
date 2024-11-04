const express = require('express');
const router = express.Router();
const companiesController = require('../controllers/companiesController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/companies', authenticateToken, authorizeRole(['admin', 'user','student']), companiesController.createCompany);
router.get('/companies', companiesController.getCompanies);
router.get('/companies/:id', companiesController.getCompanyById);
router.put('/companies/:id', authenticateToken, authorizeRole(['user', 'student']), companiesController.updateCompany);
router.delete('/companies/:id', authenticateToken, authorizeRole(['admin', 'user', 'student']), companiesController.deleteCompany);

module.exports = router;