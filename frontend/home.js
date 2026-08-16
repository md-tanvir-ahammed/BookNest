const currentUser = JSON.parse(localStorage.getItem('booknest_current_user') || 'null');
const token = localStorage.getItem('booknest_token');

if (!currentUser || !token) {
    window.location.href = 'index.html';
} else {
    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) greetingEl.textContent = '👤 ' + currentUser.name;
    const welcomeEl = document.getElementById('welcome-heading');
    if (welcomeEl) welcomeEl.textContent = 'Welcome, ' + currentUser.name + ' 👋';
}

function logout() {
    localStorage.removeItem('booknest_token');
    localStorage.removeItem('booknest_current_user');
    window.location.href = 'index.html';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: { ...(options.headers || {}), ...authHeaders() }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed.');
    return data;
}

// ---------- Filter & Search State ----------
let currentCategory = 'All';
let searchQuery = '';
let allBooks = [];
let userFavoriteIds = [];

function handleSearch() {
    searchQuery = document.getElementById('search-input').value.trim();
    renderBooks();
}

function setCategoryFilter(category) {
    currentCategory = category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    renderBooks();
}

function isFavorite(bookId) {
    return userFavoriteIds.includes(bookId);
}

async function toggleFavorite(event, bookId) {
    event.stopPropagation();
    try {
        const data = await apiFetch(`/favorites/${bookId}`, { method: 'POST' });
        if (data.favorited) {
            userFavoriteIds.push(bookId);
        } else {
            userFavoriteIds = userFavoriteIds.filter(id => id !== bookId);
        }
        renderBooks();
    } catch (err) {
        alert(err.message);
    }
}

// ---------- Add Book Modal ----------
function openAddBook() {
    document.getElementById('add-modal').classList.add('show');
    document.getElementById('add-msg').textContent = '';
}

function closeAddBook() {
    document.getElementById('add-modal').classList.remove('show');
    document.getElementById('new-title').value = '';
    document.getElementById('new-author').value = '';
    document.getElementById('new-category').value = 'Fiction';
    document.getElementById('new-pdf').value = '';
}

async function addBook() {
    const title = document.getElementById('new-title').value.trim();
    const author = document.getElementById('new-author').value.trim();
    const category = document.getElementById('new-category').value;
    const fileInput = document.getElementById('new-pdf');
    const file = fileInput.files[0];
    const msgEl = document.getElementById('add-msg');

    if (!title || !author || !file) {
        msgEl.textContent = 'Please fill all fields and select a PDF.';
        msgEl.className = 'add-msg error';
        return;
    }
    if (file.type !== 'application/pdf') {
        msgEl.textContent = 'Only PDF files are allowed.';
        msgEl.className = 'add-msg error';
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        msgEl.textContent = 'File too large. Please use a PDF under 5MB.';
        msgEl.className = 'add-msg error';
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('author', author);
    formData.append('category', category);
    formData.append('pdf', file);

    try {
        const res = await fetch(`${API_BASE_URL}/books`, {
            method: 'POST',
            headers: { ...authHeaders() }, // don't set Content-Type, browser sets multipart boundary
            body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add book.');

        msgEl.textContent = 'Book added successfully!';
        msgEl.className = 'add-msg';
        await loadBooks();
        setTimeout(closeAddBook, 1000);
    } catch (err) {
        msgEl.textContent = err.message;
        msgEl.className = 'add-msg error';
    }
}

// ---------- Delete Book ----------
async function deleteBook(event, bookId) {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        await apiFetch(`/books/${bookId}`, { method: 'DELETE' });
        await loadBooks();
    } catch (err) {
        alert(err.message);
    }
}

// ---------- Load & Render Book Grid ----------
async function loadBooks() {
    try {
        const [booksData, favData] = await Promise.all([
            apiFetch('/books'),
            apiFetch('/favorites')
        ]);
        allBooks = booksData.books;
        userFavoriteIds = favData.bookIds;
        renderBooks();
    } catch (err) {
        console.error(err);
    }
}

function renderBooks() {
    const grid = document.getElementById('book-grid');
    if (!grid) return;

    const filteredBooks = allBooks.filter(book => {
        let matchesCategory = false;
        if (currentCategory === 'All') {
            matchesCategory = true;
        } else if (currentCategory === 'Favorites') {
            matchesCategory = isFavorite(book.id);
        } else {
            matchesCategory = (book.category || 'Other') === currentCategory;
        }

        const query = searchQuery.toLowerCase();
        const matchesSearch = !query ||
            (book.title && book.title.toLowerCase().includes(query)) ||
            (book.author && book.author.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
    });

    if (filteredBooks.length === 0) {
        grid.innerHTML = '<div class="empty-state">🔍 No books found matching your filter or search criteria.</div>';
        return;
    }

    grid.innerHTML = filteredBooks.map(book => {
        const fav = isFavorite(book.id);
        const ratingText = book.avg_rating ? `⭐ ${book.avg_rating} (${book.rating_count})` : 'No ratings yet';
        const canDelete = !book.is_system && book.added_by === currentUser.id;

        return `
            <div class="book-card" onclick="openBook(${book.id})">
                <button class="fav-btn ${fav ? 'active' : ''}" onclick="toggleFavorite(event, ${book.id})" title="${fav ? 'Remove from Favorites' : 'Add to Favorites'}">${fav ? '❤️' : '🤍'}</button>
                ${canDelete ? `<button class="delete-btn" onclick="deleteBook(event, ${book.id})" title="Delete book">🗑</button>` : ''}
                <div class="book-cover">📖</div>
                <h3>${escapeHtml(book.title)}</h3>
                <p>by ${escapeHtml(book.author)}</p>
                <span class="category-badge">${escapeHtml(book.category || 'Other')}</span>
                <div class="card-rating">${ratingText}</div>
            </div>
        `;
    }).join('');
}

// ---------- PDF Reading & Eye-Friendly Controls ----------
let currentBook = null;
let pdfDoc = null;
let currentPage = 1;
let currentScale = 1.0;
let currentTheme = 'dark';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

function setZoom(scale) {
    currentScale = scale;
    document.querySelectorAll('.zoom-btn').forEach(btn => btn.classList.remove('active'));

    const scaleBtnMap = { 0.75: 'zoom-75', 1.0: 'zoom-100', 1.25: 'zoom-125', 1.5: 'zoom-150' };
    const activeBtn = document.getElementById(scaleBtnMap[scale]);
    if (activeBtn) activeBtn.classList.add('active');

    if (pdfDoc) renderPage(currentPage);
}

function setTheme(themeName) {
    currentTheme = themeName;
    const modalBox = document.querySelector('#read-modal .modal-box');
    modalBox.classList.remove('theme-dark', 'theme-light', 'theme-sepia');
    modalBox.classList.add('theme-' + themeName);

    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`theme-${themeName}-btn`);
    if (activeBtn) activeBtn.classList.add('active');
}

async function openBook(bookId) {
    currentBook = allBooks.find(b => b.id === bookId);
    if (!currentBook) return;

    document.getElementById('modal-title').textContent = currentBook.title;
    document.getElementById('modal-author').textContent = 'by ' + currentBook.author;
    document.getElementById('read-modal').classList.add('show');

    document.getElementById('comment-input').value = '';
    document.getElementById('comment-msg').textContent = '';

    setTheme(currentTheme);
    setZoom(currentScale);
    await loadUserRating();
    await renderComments();

    // Resume from saved page if available
    let savedPage = 1;
    try {
        const progressData = await apiFetch('/progress');
        const entry = progressData.progress.find(p => p.book_id === bookId);
        if (entry) savedPage = entry.page;
    } catch (err) { /* ignore, default to page 1 */ }

    loadPdf(`${API_BASE_URL}/books/${bookId}/pdf`, savedPage);
}

function closeBook() {
    document.getElementById('read-modal').classList.remove('show');
    pdfDoc = null;
    currentBook = null;
}

function loadPdf(url, savedPage) {
    const loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(pdf => {
        pdfDoc = pdf;
        currentPage = (savedPage && savedPage >= 1 && savedPage <= pdf.numPages) ? savedPage : 1;
        renderPage(currentPage);
    }).catch(err => {
        document.getElementById('page-info').textContent = 'Failed to load PDF';
        console.error(err);
    });
}

function renderPage(num) {
    pdfDoc.getPage(num).then(page => {
        const canvas = document.getElementById('pdf-canvas');
        const ctx = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: currentScale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        page.render({ canvasContext: ctx, viewport: viewport });
        document.getElementById('page-info').textContent = `Page ${num} / ${pdfDoc.numPages}`;

        if (currentBook) {
            apiFetch(`/progress/${currentBook.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page: num, totalPages: pdfDoc.numPages })
            }).catch(() => {});
        }
        updateProgressBar();
    });
}

function updateProgressBar() {
    if (!pdfDoc) return;
    const percent = Math.round((currentPage / pdfDoc.numPages) * 100);
    const fillEl = document.getElementById('progress-bar-fill');
    const textEl = document.getElementById('progress-text');

    if (fillEl) fillEl.style.width = percent + '%';
    if (textEl) textEl.textContent = percent + '% completed';
}

function prevPage() {
    if (!pdfDoc || currentPage <= 1) return;
    currentPage--;
    renderPage(currentPage);
}

function nextPage() {
    if (!pdfDoc || currentPage >= pdfDoc.numPages) return;
    currentPage++;
    renderPage(currentPage);
}

// ---------- Download PDF ----------
function downloadPdf() {
    if (!currentBook) return;
    const link = document.createElement('a');
    link.href = `${API_BASE_URL}/books/${currentBook.id}/pdf`;
    const fileName = (currentBook.title || 'book').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ---------- Rating ----------
async function saveRating(value) {
    try {
        await apiFetch(`/books/${currentBook.id}/rating`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value })
        });
        renderStars(value);
        document.getElementById('rating-msg').textContent = 'Thanks for rating this book!';
        await loadBooks();
    } catch (err) {
        document.getElementById('rating-msg').textContent = err.message;
    }
}

async function loadUserRating() {
    try {
        const data = await apiFetch(`/books/${currentBook.id}/rating`);
        renderStars(data.value || 0);
    } catch (err) {
        renderStars(0);
    }
    document.getElementById('rating-msg').textContent = '';
}

function renderStars(value) {
    document.querySelectorAll('#rating-stars span').forEach(star => {
        const starValue = parseInt(star.dataset.value);
        star.textContent = starValue <= value ? '★' : '☆';
        star.classList.toggle('selected', starValue <= value);
    });
}

document.querySelectorAll('#rating-stars span').forEach(star => {
    star.addEventListener('click', () => saveRating(parseInt(star.dataset.value)));
    star.addEventListener('mouseenter', () => {
        const hoverValue = parseInt(star.dataset.value);
        document.querySelectorAll('#rating-stars span').forEach(s =>
            s.classList.toggle('hovered', parseInt(s.dataset.value) <= hoverValue)
        );
    });
    star.addEventListener('mouseleave', () => {
        document.querySelectorAll('#rating-stars span').forEach(s => s.classList.remove('hovered'));
    });
});

// ---------- Comment System ----------
async function addComment() {
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    const msgEl = document.getElementById('comment-msg');

    if (!text) {
        msgEl.textContent = 'Please enter a comment before submitting.';
        return;
    }

    try {
        await apiFetch(`/books/${currentBook.id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        input.value = '';
        msgEl.textContent = '';
        await renderComments();
    } catch (err) {
        msgEl.textContent = err.message;
    }
}

async function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete your comment?')) return;
    try {
        await apiFetch(`/comments/${commentId}`, { method: 'DELETE' });
        await renderComments();
    } catch (err) {
        alert(err.message);
    }
}

async function renderComments() {
    const container = document.getElementById('comments-list');
    if (!currentBook || !container) return;

    try {
        const data = await apiFetch(`/books/${currentBook.id}/comments`);
        const bookComments = data.comments;

        if (bookComments.length === 0) {
            container.innerHTML = '<p class="no-comments">No comments yet. Be the first to share your thoughts!</p>';
            return;
        }

        container.innerHTML = bookComments.map(comment => {
            const isOwner = comment.user_id === currentUser.id;
            const formattedDate = new Date(comment.created_at).toLocaleString();

            return `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${escapeHtml(comment.user_name)}</span>
                        <span class="comment-date">${formattedDate}</span>
                    </div>
                    <p class="comment-body">${escapeHtml(comment.body)}</p>
                    ${isOwner ? `<button class="comment-delete-btn" onclick="deleteComment(${comment.id})" title="Delete comment">🗑</button>` : ''}
                </div>
            `;
        }).join('');
    } catch (err) {
        container.innerHTML = '<p class="no-comments">Failed to load comments.</p>';
    }
}

// ---------- Init ----------
if (currentUser && token) {
    loadBooks();
}
