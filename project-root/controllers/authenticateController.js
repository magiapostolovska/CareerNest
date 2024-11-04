const User = require('../scripts/models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'neznamkojkeydagopostavamblabla';
const JWT_EXPIRATION = '1h'; 

async function register(req, res) {
    try {
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        const userRole = req.body.isStudent ? 'student' : 'user'; 

        const newUser = new User({
            username: req.body.email, 
            email: req.body.email,
            password: hashedPassword,
            createdAt: new Date(),
            createdBy: req.body.createdBy || 'admin',
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phoneNumber: req.body.phoneNumber,
            role: userRole 
        });

        const savedUser = await newUser.save();
        res.status(201).json({ message: 'User created successfully', userId: savedUser._id });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create user', error: err.message });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRATION }
        );

        return res.status(200).json({
            message: 'Login successful',
            token: token,
            user: {
                userId: user._id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {s
        res.status(500).json({ message: 'Error occurred during login', error: error.message });
    }
}

module.exports = {
    register,
    login
};