const express = require('express');
const connectDb = require('./config/db'); 
const app = express();
const cookieParser = require('cookie-parser');
const usersRoutes = require('./routes/usersRoute');
const recoveryRoutes = require('./routes/recoveryRoute');
const studentsRoutes = require('./routes/studentsRoute');
const internshipsRoutes = require('./routes/internshipsRoute');
const companiesRoutes = require('./routes/companiesRoute');
const applicationsRoutes = require('./routes/applicationsRoute');

const path = require('path');
const PORT = 3000;
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', usersRoutes);
app.use('/api', recoveryRoutes);
app.use('/api', studentsRoutes);
app.use('/api', companiesRoutes);
app.use('/api', internshipsRoutes);
app.use('/api', applicationsRoutes);


app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/auth/register.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/auth/login.html'));
});

app.get('/homepage', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/homepage.html'));
});
app.get('/companies', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/companies.html'));
});
app.get('/internships', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/internships.html'));
});

app.get('/userProfile/:userId', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/userProfile.html'));
});
app.get('/companyForMe/:companyId', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/companyForMe.html'));
});
app.get('/companyProfile/:companyId', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/companyProfile.html'));
});
app.get('/users/:userId', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/users.html'));
});

app.get('/contactus', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/contactus.html'));
});

connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to the database:', err);
    });

app.use((err, req, res, next) => {
    console.error('Global error handler:', err); 
    res.status(500).json({ message: 'Internal Server Error' });
});
