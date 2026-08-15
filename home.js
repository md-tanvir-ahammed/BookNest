const currentUser = JSON.parse(localStorage.getItem('booknest_current_user'));

if (!currentUser) {
    window.location.href = 'index.html';
} else {
    const greetingEl = document.getElementById('user-greeting');
    if (greetingEl) greetingEl.textContent = '👤 ' + currentUser.name;
    const welcomeEl = document.getElementById('welcome-heading');
    if (welcomeEl) welcomeEl.textContent = 'Welcome, ' + currentUser.name + ' 👋';
}

function logout() {
    localStorage.removeItem('booknest_current_user');
    window.location.href = 'index.html';
}

// Minimal valid 1-page PDF encoded in Base64 ("Sample Book")
const SAMPLE_PDF_BASE64 = 'data:application/pdf;base64,JVBERi0xLjQKJSDi483NCjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwvVHlwZSAvUGFnZXMgL0NvdW50IDEgL0tpZHMgWyAzIDAgUiBdID4+CmVuZG9iago3IDAgb2JqCjw8L1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvUmVzb3VyY2VzIDw8L0ZvbnQgPDwvRjEgNCAwIFIgPj4gPj4gL01lZGlhQm94IFswIDAgNjEyIDc5Ml0gL0NvbnRlbnRzIDUgMCBSID4+CmVuZG9iago0IDAgb2JqCjw8L1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iago1IDAgb2JqCjw8L0xlbmd0aCA0ND4+CnN0cmVhbQpCVCAvRjEgMjQgVGYgMTAwIDcwMCBUZCAoU2FtcGxlIEJvb2spIEVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTIgMDAwMDAgbiAKMDAwMDAwMDEwMSAwMDAwMCBuIAowMDAwMDAwMjIzIDAwMDAwIG4gCjAwMDAwMDAyOTAgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDYvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgozODQKJSVFT0Y=';

function getSampleBooks() {
    return [
        { id: 'book_sample_1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', pdfData: SAMPLE_PDF_BASE64, addedBy: 'System' },
        { id: 'book_sample_2', title: '1984', author: 'George Orwell', category: 'Fiction', pdfData: SAMPLE_PDF_BASE64, addedBy: 'System' },
        { id: 'book_sample_3', title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction', pdfData: SAMPLE_PDF_BASE64, addedBy: 'System' },
        { id: 'book_sample_4', title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Fiction', pdfData: SAMPLE_PDF_BASE64, addedBy: 'System' },
        { id: 'book_sample_5', title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Fantasy', pdfData: SAMPLE_PDF_BASE64, addedBy: 'System' },
        { id: 'book_sample_6', title: 'Moby-Dick', author: 'Herman Melville', category: 'Fiction', pdfData: SAMPLE_PDF_BASE64, addedBy: 'System' },
        { id: 'book_sample_7', title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'Fiction', pdfData: SAMPLE_PDF_BASE64, addedBy: 'System' },
        { id: 'book_sample_8', title: 'War and Peace', author: 'Leo Tolstoy', category: 'History', pdfData: SAMPLE_PDF_BASE64, addedBy: 'System' }
    ];
}

// ---------- Filter & Search State ----------
let currentCategory = 'All';
let searchQuery = '';

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

// ---------- Book & Comment Storage ----------
function getBooks() {
    const storedBooks = localStorage.getItem('booknest_books');
    if (!storedBooks) {
        const sampleBooks = getSampleBooks();
        saveBooks(sampleBooks);
        return sampleBooks;
    }
    return JSON.parse(storedBooks);
}

function saveBooks(books) {
    localStorage.setItem('booknest_books', JSON.stringify(books));
}

function getAllRatings() {
    return JSON.parse(localStorage.getItem('booknest_ratings') || '{}');
}

function getAllComments() {
    return JSON.parse(localStorage.getItem('booknest_comments') || '{}');
}

function saveAllComments(comments) {
    localStorage.setItem('booknest_comments', JSON.stringify(comments));
}

// ---------- Favorites Storage ----------
function getFavoritesMap() {
    return JSON.parse(localStorage.getItem('booknest_favorites') || '{}');
}

function getUserFavorites() {
    const map = getFavoritesMap();
    return map[currentUser.email] || [];
}

function isFavorite(bookId) {
    return getUserFavorites().includes(bookId);
}

function toggleFavorite(event, bookId) {
    event.stopPropagation();
    const map = getFavoritesMap();
    let userFavs = map[currentUser.email] || [];

    if (userFavs.includes(bookId)) {
        userFavs = userFavs.filter(id => id !== bookId);
    } else {
        userFavs.push(bookId);
    }

    map[currentUser.email] = userFavs;
    localStorage.setItem('booknest_favorites', JSON.stringify(map));
    renderBooks();
}

// ---------- Reading Progress Tracking ----------
function getProgressMap() {
    return JSON.parse(localStorage.getItem('booknest_progress') || '{}');
}

function getUserBookPage(bookId) {
    const map = getProgressMap();
    const userMap = map[currentUser.email] || {};
    const entry = userMap[bookId];
    if (typeof entry === 'object' && entry !== null) {
        return entry.page || 1;
    }
    return typeof entry === 'number' ? entry : 1;
}

function saveUserBookPage(bookId, page, totalPages) {
    const map = getProgressMap();
    if (!map[currentUser.email]) map[currentUser.email] = {};
    map[currentUser.email][bookId] = { page: page, totalPages: totalPages || 1 };
    localStorage.setItem('booknest_progress', JSON.stringify(map));
}

// ---------- Recently Read Tracking ----------
function trackRecentlyRead(bookId) {
    const map = JSON.parse(localStorage.getItem('booknest_recently_read') || '{}');
    let userList = map[currentUser.email] || [];
    userList = userList.filter(id => id !== bookId);
    userList.unshift(bookId); // Place at front
    if (userList.length > 10) userList.pop(); // Keep top 10
    map[currentUser.email] = userList;
    localStorage.setItem('booknest_recently_read', JSON.stringify(map));
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

function addBook() {
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

    const reader = new FileReader();
    reader.onload = function (e) {
        const books = getBooks();
        const newBook = {
            id: 'book_' + Date.now(),
            title,
            author,
            category,
            pdfData: e.target.result,
            addedBy: currentUser.email
        };
        books.push(newBook);
        saveBooks(books);
        msgEl.textContent = 'Book added successfully!';
        msgEl.className = 'add-msg';
        renderBooks();
        setTimeout(closeAddBook, 1000);
    };
    reader.onerror = function () {
        msgEl.textContent = 'Failed to read PDF file.';
        msgEl.className = 'add-msg error';
    };
    reader.readAsDataURL(file);
}

// ---------- Delete Book ----------
function deleteBook(event, bookId) {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this book?')) return;

    const books = getBooks().filter(b => b.id !== bookId);
    saveBooks(books);
    renderBooks();
}

// ---------- Render Book Grid ----------
function renderBooks() {
    const books = getBooks();
    const grid = document.getElementById('book-grid');
    if (!grid) return;

    const ratings = getAllRatings();

    const filteredBooks = books.filter(book => {
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
        const bookRatings = ratings[book.id] || {};
        const values = Object.values(bookRatings);
        const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : null;
        const fav = isFavorite(book.id);

        return `
            <div class="book-card" onclick="openBook('${book.id}')">
                <button class="fav-btn ${fav ? 'active' : ''}" onclick="toggleFavorite(event, '${book.id}')" title="${fav ? 'Remove from Favorites' : 'Add to Favorites'}">${fav ? '❤️' : '🤍'}</button>
                <button class="delete-btn" onclick="deleteBook(event, '${book.id}')" title="Delete book">🗑</button>
                <div class="book-cover">📖</div>
                <h3>${escapeHtml(book.title)}</h3>
                <p>by ${escapeHtml(book.author)}</p>
                <span class="category-badge">${escapeHtml(book.category || 'Other')}</span>
                <div class="card-rating">${avg ? '⭐ ' + avg + ' (' + values.length + ')' : 'No ratings yet'}</div>
            </div>
        `;
    }).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
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

    if (pdfDoc) {
        renderPage(currentPage);
    }
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

function openBook(bookId) {
    const books = getBooks();
    currentBook = books.find(b => b.id === bookId);
    if (!currentBook) return;

    trackRecentlyRead(bookId);

    document.getElementById('modal-title').textContent = currentBook.title;
    document.getElementById('modal-author').textContent = 'by ' + currentBook.author;
    document.getElementById('read-modal').classList.add('show');

    document.getElementById('comment-input').value = '';
    document.getElementById('comment-msg').textContent = '';

    setTheme(currentTheme);
    setZoom(currentScale);
    loadUserRating();
    renderComments();
    loadPdf(currentBook.pdfData);
}

function closeBook() {
    document.getElementById('read-modal').classList.remove('show');
    pdfDoc = null;
    currentBook = null;
}

function loadPdf(base64Data) {
    const loadingTask = pdfjsLib.getDocument(base64Data);
    loadingTask.promise.then(pdf => {
        pdfDoc = pdf;
        
        const savedPage = getUserBookPage(currentBook.id);
        if (savedPage && savedPage >= 1 && savedPage <= pdf.numPages) {
            currentPage = savedPage;
        } else {
            currentPage = 1;
        }

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
            saveUserBookPage(currentBook.id, num, pdfDoc.numPages);
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
    if (!currentBook || !currentBook.pdfData) return;

    const link = document.createElement('a');
    link.href = currentBook.pdfData;
    const fileName = (currentBook.title || 'book').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ---------- Rating ----------
function saveRating(value) {
    const ratings = getAllRatings();
    if (!ratings[currentBook.id]) ratings[currentBook.id] = {};
    ratings[currentBook.id][currentUser.email] = value;
    localStorage.setItem('booknest_ratings', JSON.stringify(ratings));
    renderStars(value);
    document.getElementById('rating-msg').textContent = 'Thanks for rating this book!';
    renderBooks();
}

function loadUserRating() {
    const ratings = getAllRatings();
    const userRating = ratings[currentBook.id] ? ratings[currentBook.id][currentUser.email] : 0;
    renderStars(userRating || 0);
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
function addComment() {
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    const msgEl = document.getElementById('comment-msg');

    if (!text) {
        msgEl.textContent = 'Please enter a comment before submitting.';
        return;
    }

    const allComments = getAllComments();
    if (!allComments[currentBook.id]) {
        allComments[currentBook.id] = [];
    }

    const newComment = {
        id: 'comment_' + Date.now(),
        userEmail: currentUser.email,
        userName: currentUser.name,
        text: text,
        timestamp: Date.now()
    };

    allComments[currentBook.id].unshift(newComment);
    saveAllComments(allComments);

    input.value = '';
    msgEl.textContent = '';
    renderComments();
}

function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete your comment?')) return;

    const allComments = getAllComments();
    if (allComments[currentBook.id]) {
        allComments[currentBook.id] = allComments[currentBook.id].filter(c => c.id !== commentId);
        saveAllComments(allComments);
        renderComments();
    }
}

function renderComments() {
    const container = document.getElementById('comments-list');
    if (!currentBook || !container) return;

    const allComments = getAllComments();
    const bookComments = allComments[currentBook.id] || [];

    if (bookComments.length === 0) {
        container.innerHTML = '<p class="no-comments">No comments yet. Be the first to share your thoughts!</p>';
        return;
    }

    container.innerHTML = bookComments.map(comment => {
        const isOwner = comment.userEmail === currentUser.email;
        const formattedDate = new Date(comment.timestamp).toLocaleString();

        return `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(comment.userName)}</span>
                    <span class="comment-date">${formattedDate}</span>
                </div>
                <p class="comment-body">${escapeHtml(comment.text)}</p>
                ${isOwner ? `<button class="comment-delete-btn" onclick="deleteComment('${comment.id}')" title="Delete comment">🗑</button>` : ''}
            </div>
        `;
    }).join('');
}

// ---------- Init ----------
renderBooks();