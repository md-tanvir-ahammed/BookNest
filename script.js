let users = JSON.parse(localStorage.getItem('booknest_users') || '[]' );

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach((b,i) => b.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'register' && i === 1)));
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
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    if (!email || !pass) return showMsg('login-msg', 'Please fill in all fields.', 'error');
    
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) showMsg('login-msg', 'Welcome back, ' + user.name + '!', 'success');
    else showMsg('login-msg', 'Invalid email or password.', 'error');
}

function handleRegister() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;
    
    if (!name || !email || !pass || !confirm) return showMsg('register-msg', 'Please fill in all fields.', 'error');
    if (pass.length < 6) return showMsg('register-msg', 'Password must be at least 6 characters.', 'error');
    if (pass !== confirm) return showMsg('register-msg', 'Passwords do not match.', 'error');
    if (users.find(u => u.email === email)) return showMsg('register-msg', 'Email already registered.', 'error');
    
    users.push({ name, email, password: pass });
    localStorage.setItem('booknest_users', JSON.stringify(users));
    showMsg('register-msg', 'Account created! You can now login.', 'success');
    setTimeout(() => switchTab('login'), 1500);
}