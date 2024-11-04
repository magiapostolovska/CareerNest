const User = require('../scripts/models/users'); 
const PasswordRecovery = require('../scripts/models/recoveries');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'capture.it.cit@gmail.com',
        pass: 'zobo bgxf vdth tihv', 
    },
    tls: {
        rejectUnauthorized: false 
    },
});

async function forgotPassword(req, res) {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const recoveryCode = generateRecoveryCode();
    const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    try {
        await transporter.sendMail({
            from: 'capture.it.cit@gmail.com',
            to: user.email,
            subject: 'Password Recovery Code',
            text: `Your password recovery code is: ${recoveryCode}`,
        });

        await PasswordRecovery.create({
            userId: user._id,
            recoveryCode,
            expirationTime,
        });

        return res.status(200).json({ message: 'Recovery code generated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Error sending recovery code', error: error.message });
    }
}

async function verifyRecoveryCode(req, res) {
    const { email, recoveryCode } = req.body;

    if (!email || !recoveryCode) {
        return res.status(400).json({ message: 'Email or recovery code is missing.' });
    }

    try {
        console.log('Received Email:', email);
        console.log('Received Recovery Code:', recoveryCode);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const passwordRecovery = await PasswordRecovery.findOne({
            userId: user._id,
            recoveryCode,
        });

        if (!passwordRecovery) {
            return res.status(400).json({ message: 'Invalid recovery code.' });
        }

        if (new Date() > passwordRecovery.expirationTime) {
            return res.status(400).json({ message: 'Recovery code has expired.' });
        }

        return res.status(200).json({ userId: user._id });

    } catch (error) {
        console.error('Server error:', error); 
        return res.status(500).json({ message: 'Internal server error.' });
    }
}


async function changePassword(req, res) {
    const { email, recoveryCode, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const passwordRecovery = await PasswordRecovery.findOne({ userId: user._id, recoveryCode });
        if (!passwordRecovery) return res.status(400).json({ message: 'Invalid recovery code' });

        if (new Date() > passwordRecovery.expirationTime) {
            return res.status(400).json({ message: 'Recovery code has expired' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        await User.findByIdAndUpdate(user._id, { password: hashedPassword });

        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Failed to change password', error: error.message });
    }
}

function generateRecoveryCode() {
    const minCode = 10000000; 
    const maxCode = 99999999;
    return Math.floor(Math.random() * (maxCode - minCode + 1)) + minCode;
}

module.exports = {
    forgotPassword,
    verifyRecoveryCode,
    changePassword,
};
