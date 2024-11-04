const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/studentsController');
const authenticateController = require('../controllers/authenticateController');
const { authenticateToken, authorizeRole }  = require('../middleware/authMiddleware');

router.post('/students', studentsController.createStudent);
router.get('/students', studentsController.getStudents);
router.get('/students/:id', studentsController.getStudentById);
router.put('/students', authenticateToken, authorizeRole(['user', 'student']), studentsController.updateStudent);
router.delete('/students/:id', authenticateToken, authorizeRole(['admin', 'student', 'user']), studentsController.deleteStudent);

module.exports = router;
