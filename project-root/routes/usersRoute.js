const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authenticateController = require('../controllers/authenticateController');
const { authenticateToken, authorizeRole }  = require('../middleware/authMiddleware');

//
router.post('/login',authenticateController.login);
router.post('/register', authenticateController.register);
//
router.get('/users', usersController.getUsers);
router.get('/users/:id', usersController.getUserById);
router.put('/users', authenticateToken, usersController.updateUser);
router.delete('/users/:id', authenticateToken, authorizeRole(['admin', 'user']), usersController.deleteUser);

module.exports = router;
