const User = require('../scripts/models/users');
const Student = require('../scripts/models/students');
const { updateStudent } = require('../controllers/studentsController'); 


const bcrypt = require('bcrypt');


async function getUsers(req, res) {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get users', error: err.message });
    }
}

async function fetchUserById(userId) {
    try {
        return await User.findById(userId).select('-password'); // Exclude sensitive fields like password
    } catch (err) {
        console.error('Error fetching user:', err.message);
        throw new Error('Failed to fetch user');
    }
}

async function getUserById(req, res) {
    try {
        // Fetch the user data by ID
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch student data if exists for the user ID
        const student = await Student.findOne({ userId: req.params.id });

        // Create a response object that combines user data and student data
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
            // Add student data if available
            student: student ? {
                university: student.university,
                faculty: student.faculty,
                yearOfStudy: student.yearOfStudy,
                index: student.index,
            } : null
        };
    

        // Send the response with user and student data
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get user', error: err.message });
    }
}



async function updateUser(req, res) {
    try {
        const user = await User.findById(req.params.id); // Find user by ID from URL parameters

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updateData = {}; // Initialize the data to be updated

        // Update fields only if they are provided in the request body
        if (req.body.username) {
            updateData.username = req.body.username;
        }
        if (req.body.email) {
            updateData.email = req.body.email;
        }
        if (req.body.password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(req.body.password, saltRounds); // Hash the password
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

        // Update timestamps
        updateData.updatedAt = new Date();
        updateData.updatedBy = user.username; // Use the username from the fetched user object

        // If student data exists in the request body, update it separately
        if (req.body.student) {
            const updatedUser = await updateStudent(req.params.id, req.body.student); // Call the imported updateStudent function
            res.status(200).json({ message: 'User updated successfully', user: updatedUser });
        } else {
            // If no student data was provided, just update the user data
            const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
            res.status(200).json({ message: 'User updated successfully', user: updatedUser });
        }
    } catch (err) {
        // Handle any errors that occur
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

async function searchUsers(req, res) {
    try {
        const query = req.query.query || '';  // Get the search query from the request
        // Search users by username only, ignore emails
        const users = await User.find({
            username: { $regex: query, $options: 'i' } // Case-insensitive search for usernames
        })
        .select('username profilePicture');  // Only return username and profilePicture fields

        res.status(200).json(users);  // Return the filtered list of users
    } catch (err) {
        res.status(500).json({ message: 'Failed to get users', error: err.message });
    }
}


module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    searchUsers,
    fetchUserById,
};
