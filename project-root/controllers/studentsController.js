const Students = require('../scripts/models/students');
const User = require('../scripts/models/users');


async function createStudent(req, res) {
    try {
        const { userId, university, faculty, yearOfStudy, index, city, country } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required to create a student profile' });
        }

        const existingStudent = await Students.findOne({ userId });
        if (existingStudent) {
            return res.status(400).json({ message: 'A student profile already exists for this user' });
        }

        const newStudent = new Students({
            userId,
            university,
            faculty,
            yearOfStudy,
            index,
            city,
            country,
            createdAt: new Date(),
            createdBy,
        });

        const savedStudent = await newStudent.save();

        res.status(201).json({ message: 'Student profile created successfully', student: savedStudent });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create student profile', error: err.message });
    }
}

async function getStudents(req, res) {
    try {
        const students = await Students.find().populate('userId');
        res.status(200).json(students);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get students', error: err.message });
    }
}

async function getStudentById(req, res) {
    try {
        const student = await Students.findById(req.params.id).populate('userId');
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get student', error: err.message });
    }
}

async function updateStudent(req, res) {
    try {
        const userId = req.params.id;  // Get user ID from the request parameters
        const user = await User.findById(userId);  // Find the user by ID to get the username

        if (!user) {
            return res.status(404).json({ message: 'User not found' });  // If the user doesn't exist
        }

        const username = user.username;  // Get the username from the user document

        // Check if student profile exists
        let existingStudent = await Students.findOne({ userId: userId });

        // If the student profile exists, update it (PUT request logic)
        if (existingStudent) {
            const updateData = {};

            if (req.body.university) updateData.university = req.body.university;
            if (req.body.faculty) updateData.faculty = req.body.faculty;
            if (req.body.yearOfStudy) updateData.yearOfStudy = req.body.yearOfStudy;
            if (req.body.index) updateData.index = req.body.index;
            if (req.body.city) updateData.city = req.body.city;
            if (req.body.country) updateData.country = req.body.country;

            updateData.updatedAt = new Date();
            updateData.updatedBy = username;

            // Update existing student profile
            const updatedStudent = await Students.findByIdAndUpdate(existingStudent._id, updateData, { new: true });

            return res.status(200).json({ message: 'Student updated successfully', student: updatedStudent });
        }

        // If the student doesn't exist, create a new one (POST request logic)
        const newStudent = new Students({
            userId: userId,
            university: req.body.university,
            faculty: req.body.faculty,
            yearOfStudy: req.body.yearOfStudy,
            index: req.body.index,
            city: req.body.city,
            country: req.body.country,
            createdAt: new Date(),
            createdBy: username
        });

        await newStudent.save();
        return res.status(201).json({ message: 'Student profile created successfully', student: newStudent });

    } catch (err) {
        return res.status(500).json({ message: 'Failed to update or create student profile', error: err.message });
    }
}



async function deleteStudent(req, res) {
    try {
        const requestingUserId = req.user.userId;
        const targetStudentId = req.params.id;
        const requestingUserRole = req.user.role;

        const existingStudent = await Students.findById(targetStudentId);
        if (!existingStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        if (requestingUserRole !== 'admin' && existingStudent.userId.toString() !== requestingUserId) {
            return res.status(403).json({ message: 'Access denied: You can only delete your own profile' });
        }

        await Students.findByIdAndDelete(targetStudentId);

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete student', error: err.message });
    }
}
async function getStudentByUserId(req, res) {
    try {
        const { userId } = req.query;
        const student = await Students.findOne({ userId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.status(200).json(student);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get student', error: err.message });
    }
}


module.exports = {
    createStudent,
    getStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    getStudentByUserId,
};
