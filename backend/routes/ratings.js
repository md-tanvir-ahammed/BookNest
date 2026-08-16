const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const authRequired = require('../middleware/auth');

// GET /api/books/:bookId/rating - current user's rating for a book
router.get('/:bookId/rating', authRequired, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT value FROM ratings WHERE book_id = ? AND user_id = ?',
            [req.params.bookId, req.user.id]
        );
        res.json({ value: rows.length ? rows[0].value : 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load rating.' });
    }
});

// POST /api/books/:bookId/rating - upsert current user's rating
router.post('/:bookId/rating', authRequired, async (req, res) => {
    try {
        const { value } = req.body;
        if (!value || value < 1 || value > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
        }

        await db.query(
            `INSERT INTO ratings (book_id, user_id, value) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE value = VALUES(value)`,
            [req.params.bookId, req.user.id, value]
        );

        res.json({ message: 'Thanks for rating this book!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save rating.' });
    }
});

module.exports = router;
