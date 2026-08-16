const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// If already logged in, skip straight to the dashboard
if (localStorage.getItem('booknest_token')) {
    window.location.href = 'home.html';
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach((b, i) => {
        b.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1));
    });
    document.getElementById('login-section').classList.toggle('active', tab === 'login');
    document.getElementById('register-section').classList.toggle('active', tab === 'register');
    hideMessages();
}

function showMsg(id, text, type) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'msg ' + type;
    el.style.display = 'block';
}

function hideMessages() {
    document.querySelectorAll('.msg').forEach(m => m.style.display = 'none');
}

function saveSession(token, user) {
    localStorage.setItem('booknest_token', token);
    localStorage.setItem('booknest_current_user', JSON.stringify(user));
}

async function handleLogin() {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    if (!email || !password) return showMsg('login-msg', 'Please fill in all fields.', 'error');
    if (!EMAIL_REGEX.test(email)) return showMsg('login-msg', 'Please enter a valid email address.', 'error');

    try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) return showMsg('login-msg', data.error || 'Login failed.', 'error');

        showMsg('login-msg', 'Welcome back, ' + data.user.name + '!', 'success');
        saveSession(data.token, data.user);
        setTimeout(() => { window.location.href = 'home.html'; }, 800);
    } catch (err) {
        showMsg('login-msg', 'Could not reach the server. Is the backend running?', 'error');
    }
}

async function handleRegister() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (!name || !email || !password || !confirm) return showMsg('register-msg', 'Please fill in all fields.', 'error');
    if (!EMAIL_REGEX.test(email)) return showMsg('register-msg', 'Please enter a valid email address.', 'error');
    if (password.length < 6) return showMsg('register-msg', 'Password must be at least 6 characters.', 'error');
    if (password !== confirm) return showMsg('register-msg', 'Passwords do not match.', 'error');

    try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (!res.ok) return showMsg('register-msg', data.error || 'Registration failed.', 'error');

        showMsg('register-msg', 'Account created! Redirecting...', 'success');
        saveSession(data.token, data.user);
        setTimeout(() => { window.location.href = 'home.html'; }, 800);
    } catch (err) {
        showMsg('register-msg', 'Could not reach the server. Is the backend running?', 'error');
    }
}
