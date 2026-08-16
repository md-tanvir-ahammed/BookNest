// Change this if your backend runs somewhere else (e.g. your Render.com URL after deployment)
const API_BASE_URL = 'http://localhost:5000/api';

function authHeaders() {
    const token = localStorage.getItem('booknest_token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
}
