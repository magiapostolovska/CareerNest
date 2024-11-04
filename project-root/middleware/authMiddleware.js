const jwt = require('jsonwebtoken');

const JWT_SECRET = 'neznamkojkeydagopostavamblabla'; 

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided, access denied' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token, access denied' });
        }

        req.user = user; 
        next(); 
    });
}

function authorizeRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }
        next();
    };
}

module.exports = {
    authenticateToken,
    authorizeRole
};
