const currentUser = JSON.parse(localStorage.getItem('booknest_current_user'));

if (!currentUser) {
    window.location.href = 'index.html';
} else {
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
}

function logout() {
    localStorage.removeItem('booknest_current_user');
    window.location.href = 'index.html';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function getBooks() {
    return JSON.parse(localStorage.getItem('booknest_books') || '[]');
}

function getAllComments() {
    return JSON.parse(localStorage.getItem('booknest_comments') || '{}');
}

function getFavoritesMap() {
    return JSON.parse(localStorage.getItem('booknest_favorites') || '{}');
}

function getProgressMap() {
    return JSON.parse(localStorage.getItem('booknest_progress') || '{}');
}

function getRecentlyReadMap() {
    return JSON.parse(localStorage.getItem('booknest_recently_read') || '{}');
}

function loadProfileDashboard() {
    const allBooks = getBooks();
    const booksMap = {};
    allBooks.forEach(b => { booksMap[b.id] = b; });

    // 1. Uploaded books count
    const uploadedBooks = allBooks.filter(b => b.addedBy === currentUser.email);
    document.getElementById('stat-uploaded').textContent = uploadedBooks.length;

    // 2. Total comments count
    const allComments = getAllComments();
    let commentCount = 0;
    Object.values(allComments).forEach(bookComments => {
        bookComments.forEach(c => {
            if (c.userEmail === currentUser.email) commentCount++;
        });
    });
    document.getElementById('stat-comments').textContent = commentCount;

    // 3. Favorites list & stat
    const favoritesMap = getFavoritesMap();
    const userFavIds = favoritesMap[currentUser.email] || [];
    document.getElementById('stat-favorites').textContent = userFavIds.length;

    const favListEl = document.getElementById('favorites-list');
    const favBooks = userFavIds.map(id => booksMap[id]).filter(Boolean);

    if (favBooks.length === 0) {
        favListEl.innerHTML = '<p class="empty-msg">You haven\'t added any favorites yet.</p>';
    } else {
        favListEl.innerHTML = favBooks.map(book => `
            <div class="fav-card">
                <div class="fav-card-icon">📖</div>
                <div class="fav-card-info">
                    <h4>${escapeHtml(book.title)}</h4>
                    <p>by ${escapeHtml(book.author)}</p>
                </div>
            </div>
        `).join('');
    }

    // 4. Reading Progress list & stat
    const progressMap = getProgressMap();
    const userProgress = progressMap[currentUser.email] || {};
    const progressListEl = document.getElementById('progress-list');
    const progressEntries = Object.entries(userProgress).filter(([bookId, entry]) => {
        const page = typeof entry === 'object' ? entry.page : entry;
        return page > 0 && booksMap[bookId];
    });

    document.getElementById('stat-reading').textContent = progressEntries.length;

    if (progressEntries.length === 0) {
        progressListEl.innerHTML = '<p class="empty-msg">No reading progress recorded yet.</p>';
    } else {
        progressListEl.innerHTML = progressEntries.map(([bookId, entry]) => {
            const book = booksMap[bookId];
            const page = typeof entry === 'object' ? entry.page : entry;
            const totalPages = typeof entry === 'object' ? (entry.totalPages || 1) : 1;
            const percent = Math.round((page / totalPages) * 100);

            return `
                <div class="list-item">
                    <div class="list-item-header">
                        <span class="list-item-title">${escapeHtml(book.title)}</span>
                        <span class="list-item-subtitle">${percent}% (Page ${page}/${totalPages})</span>
                    </div>
                    <div class="item-progress-wrap">
                        <div class="item-progress-fill" style="width: ${percent}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // 5. Recently Read list
    const recentlyReadMap = getRecentlyReadMap();
    const userRecentIds = recentlyReadMap[currentUser.email] || [];
    const recentListEl = document.getElementById('recently-read-list');
    const recentBooks = userRecentIds.map(id => booksMap[id]).filter(Boolean).slice(0, 5);

    if (recentBooks.length === 0) {
        recentListEl.innerHTML = '<p class="empty-msg">No recently read books found.</p>';
    } else {
        recentListEl.innerHTML = recentBooks.map(book => {
            const entry = userProgress[book.id];
            let statusText = 'Just opened';
            if (entry) {
                const page = typeof entry === 'object' ? entry.page : entry;
                const totalPages = typeof entry === 'object' ? (entry.totalPages || 1) : 1;
                statusText = `Page ${page} of ${totalPages} (${Math.round((page / totalPages) * 100)}%)`;
            }

            return `
                <div class="list-item">
                    <div class="list-item-header">
                        <span class="list-item-title">${escapeHtml(book.title)}</span>
                        <span class="list-item-subtitle">${statusText}</span>
                    </div>
                    <span class="list-item-subtitle">by ${escapeHtml(book.author)}</span>
                </div>
            `;
        }).join('');
    }
}

// Initialize Profile Page
loadProfileDashboard();