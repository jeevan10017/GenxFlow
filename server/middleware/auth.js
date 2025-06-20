const jwt = require('jsonwebtoken');
const User = require('../models/userModal');

const JWT_SECRET = process.env.JWT_SECRET;

const authenticator = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(verified.id);  
        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }
        
        req.user = user;
        req.email = user.email; 
        next();
    } catch (err) {
        res.status(400).json({ message: 'Token is not valid.' });
    }
};

module.exports = authenticator;