const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const authRequired = require('../middleware/auth');

// GET /api/books/:bookId/comments
router.get('/books/:bookId/comments', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.id, c.body, c.created_at, u.id AS user_id, u.name AS user_name
            FROM comments c
            JOIN users u ON u.id = c.user_id
            WHERE c.book_id = ?
            ORDER BY c.created_at DESC
        `, [req.params.bookId]);
        res.json({ comments: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load comments.' });
    }
});

// POST /api/books/:bookId/comments (protected)
router.post('/books/:bookId/comments', authRequired, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Please enter a comment before submitting.' });
        }

        const [result] = await db.query(
            'INSERT INTO comments (book_id, user_id, body) VALUES (?, ?, ?)',
            [req.params.bookId, req.user.id, text.trim()]
        );

        res.status(201).json({ id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to post comment.' });
    }
});

// DELETE /api/comments/:id (protected, owner only)
router.delete('/comments/:id', authRequired, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Comment not found.' });
        if (rows[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own comments.' });
        }

        await db.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
        res.json({ message: 'Comment deleted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete comment.' });
    }
});

module.exports = router;
