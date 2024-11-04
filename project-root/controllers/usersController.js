const User = require('../scripts/models/users');
const Student = require('../scripts/models/students');

const bcrypt = require('bcrypt');


async function getUsers(req, res) {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get users', error: err.message });
    }
}

async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get user', error: err.message });
    }
}

async function updateUser(req, res) {
    try {
        const userId = req.user.userId;
        const username = req.user.username;


        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updateData = {};

        if (req.body.username) {
            updateData.username = req.body.username;
        }
        if (req.body.email) {
            updateData.email = req.body.email;
        }
        if (req.body.password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(req.body.password, saltRounds);
        }
        updateData.updatedAt = new Date();
        updateData.updatedBy = username; 
        if (req.body.role) {
            updateData.role = req.body.role;
        }
        if (req.body.profilePicture) {
            updateData.profilePicture = req.body.profilePicture;
        }
        if (req.body.bio) {
            updateData.bio = req.body.bio;
        }
        if (req.body.firstName) {
            updateData.firstName = req.body.firstName;
        }
        if (req.body.lastName) {
            updateData.lastName = req.body.lastName;
        }
        if (req.body.phoneNumber) {
            updateData.phoneNumber = req.body.phoneNumber;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
        
        res.status(200).json({ message: 'User updated successfully', user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update user', error: err.message });
    }
}

async function deleteUser(req, res) {
    try {
        const requestingUserId = req.user.userId; 
        const targetUserId = req.params.id; 
        const requestingUserRole = req.user.role; 

        if (requestingUserRole !== 'admin' && requestingUserId !== targetUserId) {
            return res.status(403).json({ message: 'Access denied: You can only delete your own account' });
        }

        const existingUser = await Users.findById(targetUserId);
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (existingUser.role === 'student') {
            await Student.findOneAndDelete({ userId: targetUserId });
        }

        await Users.findByIdAndDelete(targetUserId);

        res.status(200).json({ message: 'User and associated student profile deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
}


module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};
