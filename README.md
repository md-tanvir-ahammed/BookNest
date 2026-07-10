# 📚 BookNest

Your community book review platform — a clean, modern login and registration system built with vanilla HTML, CSS, and JavaScript.

## ✨ Features

- **Tab-based Login/Register UI** — switch seamlessly between login and registration forms
- **Client-side Form Validation**
  - Required field checks
  - Minimum password length (6 characters)
  - Password confirmation matching
  - Duplicate email detection
- **Persistent User Storage** using `localStorage`
- **Remember Me** checkbox and **Forgot Password** link (UI)
- **Responsive, Glassmorphism-style UI** with smooth transitions and hover effects
- Real-time success/error feedback messages

## 🛠️ Tech Stack

- **HTML5** — semantic structure
- **CSS3** — custom properties-free glassmorphism design, gradients, transitions
- **Vanilla JavaScript (ES6)** — DOM manipulation, form handling, localStorage-based auth simulation

## 📂 Project Structure

```
BookNest/
├── index.html      # Main markup for login & register forms
├── style.css        # Styling and layout
├── script.js        # Form logic, validation, and localStorage handling
└── README.md
```

## 🚀 Getting Started

1. Clone the repository
   ```bash
   git clone https://github.com/md-tanvir-ahammed/BookNest.git
   ```
2. Open `index.html` in your browser — no build steps or dependencies required.

## 🌿 Branching Strategy

This project follows a feature-branch workflow:

| Branch | Purpose |
|---|---|
| `main` | Stable, production-ready code |
| `feature/styling` | CSS styling and UI design |
| `feature/auth-logic` | Login/registration logic and validation |

Each feature was developed in isolation and merged into `main` with meaningful, descriptive commit messages.

## 🔮 Future Improvements

- Backend integration with a real database (e.g., MongoDB, Firebase)
- Password hashing and secure authentication (JWT/sessions)
- Book review and rating functionality
- User profile pages

## 👤 Author

**Md Tanvir Ahammed**
GitHub: [@md-tanvir-ahammed](https://github.com/md-tanvir-ahammed)
