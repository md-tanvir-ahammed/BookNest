const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const authRequired = require('../middleware/auth');

// GET /api/progress - all progress rows for current user (also used for "recently read")
router.get('/', authRequired, async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT book_id, page, total_pages, updated_at
             FROM reading_progress WHERE user_id = ?
             ORDER BY updated_at DESC`,
            [req.user.id]
        );
        res.json({ progress: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load progress.' });
    }
});

// POST /api/progress/:bookId - upsert page position
router.post('/:bookId', authRequired, async (req, res) => {
    try {
        const { page, totalPages } = req.body;
        await db.query(
            `INSERT INTO reading_progress (user_id, book_id, page, total_pages)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE page = VALUES(page), total_pages = VALUES(total_pages), updated_at = CURRENT_TIMESTAMP`,
            [req.user.id, req.params.bookId, page || 1, totalPages || 1]
        );
        res.json({ message: 'Progress saved.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save progress.' });
    }
});

module.exports = router;
