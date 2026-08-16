const jwt = require('jsonwebtoken');
require('dotenv').config();

function authRequired(req, res, next) {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
        return res.status(401).json({ error: 'Missing or invalid token. Please log in again.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, name, email }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
}

module.exports = authRequired;
