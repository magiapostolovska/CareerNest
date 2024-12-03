const express = require('express');
const router = express.Router();
const { fetchUserById } = require('../controllers/usersController');
const usersController = require('../controllers/usersController');
const authenticateController = require('../controllers/authenticateController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/login', authenticateController.login);
router.post('/register', authenticateController.register);

router.get('/users', usersController.getUsers);
router.get('/users/:id', usersController.getUserById);
router.put('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);
router.get('/search-users', usersController.searchUsers);


router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await fetchUserById(req.user.userId); 
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user profile', error: error.message });
    }
});

module.exports = router;
