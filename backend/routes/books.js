const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const db = require('../db/connection');
const authRequired = require('../middleware/auth');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const unique = Date.now() + '_' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed.'));
        }
        cb(null, true);
    }
});

// GET /api/books - list all books with average rating + rating count
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT b.id, b.title, b.author, b.category, b.added_by, b.is_system,
                   u.name AS added_by_name,
                   ROUND(AVG(r.value), 1) AS avg_rating,
                   COUNT(r.id) AS rating_count
            FROM books b
            LEFT JOIN users u ON u.id = b.added_by
            LEFT JOIN ratings r ON r.book_id = b.id
            GROUP BY b.id
            ORDER BY b.created_at DESC
        `);
        res.json({ books: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load books.' });
    }
});

// POST /api/books - upload a new book (protected)
router.post('/', authRequired, upload.single('pdf'), async (req, res) => {
    try {
        const { title, author, category } = req.body;
        if (!title || !author || !req.file) {
            return res.status(400).json({ error: 'Please fill all fields and select a PDF.' });
        }

        const [result] = await db.query(
            'INSERT INTO books (title, author, category, pdf_path, added_by) VALUES (?, ?, ?, ?, ?)',
            [title.trim(), author.trim(), category || 'Other', req.file.filename, req.user.id]
        );

        res.status(201).json({ id: result.insertId, message: 'Book added successfully!' });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Failed to upload book.' });
    }
});

// DELETE /api/books/:id - only the uploader can delete, system books are protected
router.delete('/:id', authRequired, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Book not found.' });

        const book = rows[0];
        if (book.is_system) {
            return res.status(403).json({ error: 'System books cannot be deleted.' });
        }
        if (book.added_by !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete books you uploaded.' });
        }

        await db.query('DELETE FROM books WHERE id = ?', [req.params.id]);

        const filePath = path.join(UPLOAD_DIR, book.pdf_path);
        fs.unlink(filePath, () => {}); // best-effort cleanup

        res.json({ message: 'Book deleted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete book.' });
    }
});

// GET /api/books/:id/pdf - stream the PDF file
router.get('/:id/pdf', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT pdf_path, title FROM books WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send('Not found');

        const filePath = path.join(UPLOAD_DIR, rows[0].pdf_path);
        if (!fs.existsSync(filePath)) return res.status(404).send('File missing');

        res.sendFile(filePath);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
