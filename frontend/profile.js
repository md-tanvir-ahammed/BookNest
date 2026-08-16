const currentUser = JSON.parse(localStorage.getItem('booknest_current_user') || 'null');
const token = localStorage.getItem('booknest_token');

if (!currentUser || !token) {
    window.location.href = 'index.html';
} else {
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
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

async function loadProfileDashboard() {
    try {
        const res = await fetch(`${API_BASE_URL}/profile/stats`, { headers: authHeaders() });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load profile.');

        document.getElementById('stat-uploaded').textContent = data.uploaded;
        document.getElementById('stat-comments').textContent = data.commentCount;
        document.getElementById('stat-favorites').textContent = data.favorites.length;
        document.getElementById('stat-reading').textContent = data.progress.length;

        // Favorites
        const favListEl = document.getElementById('favorites-list');
        if (data.favorites.length === 0) {
            favListEl.innerHTML = '<p class="empty-msg">You haven\'t added any favorites yet.</p>';
        } else {
            favListEl.innerHTML = data.favorites.map(book => `
                <div class="fav-card">
                    <div class="fav-card-icon">📖</div>
                    <div class="fav-card-info">
                        <h4>${escapeHtml(book.title)}</h4>
                        <p>by ${escapeHtml(book.author)}</p>
                    </div>
                </div>
            `).join('');
        }

        // Reading Progress
        const progressListEl = document.getElementById('progress-list');
        if (data.progress.length === 0) {
            progressListEl.innerHTML = '<p class="empty-msg">No reading progress recorded yet.</p>';
        } else {
            progressListEl.innerHTML = data.progress.map(entry => {
                const percent = Math.round((entry.page / (entry.total_pages || 1)) * 100);
                return `
                    <div class="list-item">
                        <div class="list-item-header">
                            <span class="list-item-title">${escapeHtml(entry.title)}</span>
                            <span class="list-item-subtitle">${percent}% (Page ${entry.page}/${entry.total_pages})</span>
                        </div>
                        <div class="item-progress-wrap">
                            <div class="item-progress-fill" style="width: ${percent}%;"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Recently Read
        const recentListEl = document.getElementById('recently-read-list');
        if (data.recentlyRead.length === 0) {
            recentListEl.innerHTML = '<p class="empty-msg">No recently read books found.</p>';
        } else {
            recentListEl.innerHTML = data.recentlyRead.map(entry => {
                const percent = Math.round((entry.page / (entry.total_pages || 1)) * 100);
                return `
                    <div class="list-item">
                        <div class="list-item-header">
                            <span class="list-item-title">${escapeHtml(entry.title)}</span>
                            <span class="list-item-subtitle">Page ${entry.page} of ${entry.total_pages} (${percent}%)</span>
                        </div>
                        <span class="list-item-subtitle">by ${escapeHtml(entry.author)}</span>
                    </div>
                `;
            }).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

// Initialize Profile Page
if (currentUser && token) {
    loadProfileDashboard();
}
