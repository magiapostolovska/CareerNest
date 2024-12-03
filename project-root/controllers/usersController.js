const User = require('../scripts/models/users');
const Student = require('../scripts/models/students');
const { updateStudent } = require('../controllers/studentsController'); 


const bcrypt = require('bcrypt');


async function getUsers(req, res) {
    try {
        const { username } = req.query;

        const filters = username ? { username } : {};

        const users = await User.find(filters);

        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get users', error: err.message });
    }
}

async function fetchUserById(userId) {
    try {
        return await User.findById(userId).select('-password'); 
    } catch (err) {
        console.error('Error fetching user:', err.message);
        throw new Error('Failed to fetch user');
    }
}

async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const student = await Student.findOne({ userId: req.params.id });

        const response = {
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            city: user.city,
            createdBy: user.createdBy,
            updatedBy: user.updatedBy,
            role: user.role,
            profilePicture: user.profilePicture,
            bio: user.bio,
            phoneNumber: user.phoneNumber,
            student: student ? {
                university: student.university,
                faculty: student.faculty,
                yearOfStudy: student.yearOfStudy,
                index: student.index,
            } : null
        };
    

        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get user', error: err.message });
    }
}



async function updateUser(req, res) {
    try {
        const user = await User.findById(req.params.id); 

        if (!user) {
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
        if (req.body.role) {
            updateData.role = req.body.role;
        }

        updateData.updatedAt = new Date();
        updateData.updatedBy = user.username; 

        if (req.body.student) {
            const updatedUser = await updateStudent(req.params.id, req.body.student); 
            res.status(200).json({ message: 'User updated successfully', user: updatedUser });
        } else {
            const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
            res.status(200).json({ message: 'User updated successfully', user: updatedUser });
        }
    } catch (err) {
        res.status(500).json({ message: 'Failed to update user', error: err.message });
    }
}

async function deleteUser(req, res) {
    try {
        const targetUserId = req.params.id;  

        const existingUser = await User.findByIdAndDelete(targetUserId);

        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
}


async function searchUsers(req, res) {
    try {
        const query = req.query.query || '';  
        const users = await User.find({
            username: { $regex: query, $options: 'i' } 
        })
        .select('username profilePicture');  

        res.status(200).json(users);  
    } catch (err) {
        res.status(500).json({ message: 'Failed to get users', error: err.message });
    }
}

async function getUsersByUsername(username) {
    try {
        const users = await User.find({ username });
        return users; 
    } catch (err) {
        throw new Error('Failed to get users by username: ' + err.message);
    }
}

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    searchUsers,
    fetchUserById,
    getUsersByUsername,
};
