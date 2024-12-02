const express = require('express');
const router = express.Router();
const internshipsController = require('../controllers/internshipsController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/internships', authenticateToken, authorizeRole(['admin', 'user','student']), internshipsController.createInternship);
router.get('/internships', internshipsController.getInternships);
router.get('/internships/filtered', internshipsController.getInternshipsFiltered);
router.get('/internships/:id', internshipsController.getInternshipById);
router.put('/internships/:id', authenticateToken, authorizeRole(['user', 'admin']), internshipsController.updateInternship);
router.delete('/internships/:id', authenticateToken, authorizeRole(['admin', 'user']), internshipsController.deleteInternship);
router.get('/search-internships', internshipsController.searchInternships);

module.exports = router;
