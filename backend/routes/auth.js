const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../db/connection');
const authRequired = require('../middleware/auth');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const cleanEmail = (email || '').trim().toLowerCase();

        if (!name || !cleanEmail || !password) {
            return res.status(400).json({ error: 'Please fill in all fields.' });
        }
        if (!EMAIL_REGEX.test(cleanEmail)) {
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
        if (existing.length > 0) {
            return res.status(409).json({ error: 'Email already registered.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
            [name.trim(), cleanEmail, passwordHash]
        );

        const user = { id: result.insertId, name: name.trim(), email: cleanEmail };
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const cleanEmail = (email || '').trim().toLowerCase();

        if (!cleanEmail || !password) {
            return res.status(400).json({ error: 'Please fill in all fields.' });
        }

        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const dbUser = rows[0];
        const match = await bcrypt.compare(password, dbUser.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email };
        const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

router.get('/me', authRequired, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
