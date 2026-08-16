const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const authRequired = require('../middleware/auth');

// GET /api/profile/stats - aggregated dashboard data for current user
router.get('/stats', authRequired, async (req, res) => {
    try {
        const userId = req.user.id;

        const [[{ uploaded }]] = await db.query(
            'SELECT COUNT(*) AS uploaded FROM books WHERE added_by = ?', [userId]
        );
        const [[{ commentCount }]] = await db.query(
            'SELECT COUNT(*) AS commentCount FROM comments WHERE user_id = ?', [userId]
        );
        const [favorites] = await db.query(`
            SELECT b.id, b.title, b.author FROM favorites f
            JOIN books b ON b.id = f.book_id
            WHERE f.user_id = ?
        `, [userId]);
        const [progress] = await db.query(`
            SELECT b.id, b.title, b.author, p.page, p.total_pages, p.updated_at
            FROM reading_progress p
            JOIN books b ON b.id = p.book_id
            WHERE p.user_id = ? AND p.page > 0
            ORDER BY p.updated_at DESC
        `, [userId]);

        res.json({
            uploaded,
            commentCount,
            favorites,
            progress,
            recentlyRead: progress.slice(0, 5)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load profile stats.' });
    }
});

module.exports = router;
