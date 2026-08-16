const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const authRequired = require('../middleware/auth');

// GET /api/favorites - current user's favorite book ids
router.get('/', authRequired, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT book_id FROM favorites WHERE user_id = ?', [req.user.id]);
        res.json({ bookIds: rows.map(r => r.book_id) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load favorites.' });
    }
});

// POST /api/favorites/:bookId - toggle favorite
router.post('/:bookId', authRequired, async (req, res) => {
    try {
        const [existing] = await db.query(
            'SELECT id FROM favorites WHERE user_id = ? AND book_id = ?',
            [req.user.id, req.params.bookId]
        );

        if (existing.length > 0) {
            await db.query('DELETE FROM favorites WHERE id = ?', [existing[0].id]);
            return res.json({ favorited: false });
        } else {
            await db.query('INSERT INTO favorites (user_id, book_id) VALUES (?, ?)', [req.user.id, req.params.bookId]);
            return res.json({ favorited: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update favorite.' });
    }
});

module.exports = router;
