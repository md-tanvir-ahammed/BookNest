let users = JSON.parse(localStorage.getItem('booknest_users') || '[]');

/**
 * Validates email format using a regular expression.
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

function handleLogin() {
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pass = document.getElementById('login-password').value;

    if (!email || !pass) {
        return showMsg('login-msg', 'Please fill in all fields.', 'error');
    }

    if (!isValidEmail(email)) {
        return showMsg('login-msg', 'Please enter a valid email address.', 'error');
    }

    const user = users.find(u => (u.email && u.email.toLowerCase() === email) && u.password === pass);
    if (user) {
        showMsg('login-msg', 'Welcome back, ' + user.name + '!', 'success');
        localStorage.setItem('booknest_current_user', JSON.stringify(user));
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
    } else {
        showMsg('login-msg', 'Invalid email or password.', 'error');
    }
}

function handleRegister() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const pass = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (!name || !email || !pass || !confirm) {
        return showMsg('register-msg', 'Please fill in all fields.', 'error');
    }

    if (!isValidEmail(email)) {
        return showMsg('register-msg', 'Please enter a valid email address.', 'error');
    }

    if (pass.length < 6) {
        return showMsg('register-msg', 'Password must be at least 6 characters.', 'error');
    }

    if (pass !== confirm) {
        return showMsg('register-msg', 'Passwords do not match.', 'error');
    }

    if (users.find(u => u.email && u.email.toLowerCase() === email)) {
        return showMsg('register-msg', 'Email already registered.', 'error');
    }

    const newUser = { name, email, password: pass };
    users.push(newUser);
    localStorage.setItem('booknest_users', JSON.stringify(users));
    localStorage.setItem('booknest_current_user', JSON.stringify(newUser));

    showMsg('register-msg', 'Account created! Redirecting...', 'success');
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 1000);
}