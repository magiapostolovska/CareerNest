const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applicationsController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');


router.post('/applications', authenticateToken, authorizeRole(['admin', 'user','student']), applicationsController.createApplication);
router.get('/applications', authenticateToken, authorizeRole(['admin', 'user','student']), applicationsController.getApplications);
router.get('/applications/:id', authenticateToken, authorizeRole(['admin', 'user','student']), applicationsController.getApplicationById);
router.put('/applications/:id', authenticateToken, authorizeRole(['admin', 'user','student']), applicationsController.updateApplication);
router.delete('/applications/:id', authenticateToken, authorizeRole(['admin', 'user','student']), applicationsController.deleteApplication);

module.exports = router;
