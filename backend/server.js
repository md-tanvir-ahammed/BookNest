const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const ratingRoutes = require('./routes/ratings');
const commentRoutes = require('./routes/comments');
const favoriteRoutes = require('./routes/favorites');
const progressRoutes = require('./routes/progress');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);   // GET/POST /, DELETE /:id, GET /:id/pdf
app.use('/api/books', ratingRoutes); // GET/POST /:bookId/rating
app.use('/api', commentRoutes);      // /books/:bookId/comments, /comments/:id
app.use('/api/favorites', favoriteRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/profile', profileRoutes);

app.get('/', (req, res) => res.send('BookNest API is running.'));

app.listen(PORT, () => {
    console.log(`BookNest API listening on http://localhost:${PORT}`);
});
