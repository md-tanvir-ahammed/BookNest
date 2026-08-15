# 📚 BookNest

Your community book review and reading platform — a fully functional web app built with vanilla HTML, CSS, and JavaScript. Read PDF books, rate them, discuss with others, track your progress, and manage your personal library.

## ✨ Features

### 🔐 Authentication & Security
- **Tab-based Login/Register** – Seamless switching between forms.
- **Secure Email Validation** – Uses regex to validate email format.
- **Case-Insensitive Login** – Prevents duplicate accounts (`User@mail.com` vs `user@mail.com`).
- **Persistent Sessions** – User data stored securely in `localStorage`.

### 📚 Book Library & Discovery
- **8 Pre-loaded Sample Books** – Instantly populated with classics like *The Great Gatsby*, *1984*, *The Hobbit*, etc.
- **Real-time Search** – Filter books by title or author as you type.
- **Category Filters** – Browse by genre (Fiction, Fantasy, History, Technology, etc.).
- **Community Sharing** – Every user can see, rate, and comment on all books (both sample and user-uploaded).

### 📖 Immersive Reading Experience
- **PDF Rendering** – Powered by `PDF.js` for high-quality display.
- **Eye-Friendly Controls**:
  - **Zoom** – 75%, 100%, 125%, 150%.
  - **Themes** – Dark, Light, and Sepia modes for reduced eye strain.
- **Reading Progress Bar** – Visual percentage indicator showing completion.
- **Page Tracking** – Automatically remembers the last page you read. Resume reading right where you left off.

### ❤️ Personalization & Community
- **Favorites/Bookmarks** – ❤️ your favorite books and filter them in the "Favorites" tab.
- **Rating System** – Rate any book (1–5 stars). See average ratings from the community.
- **Comment System** – Discuss books with others. Delete your own comments if needed.
- **User Profiles** – Dedicated profile page showing:
  - Books uploaded
  - Comments posted
  - Favorites list
  - Reading progress list (with % completion)
  - Recently read books

### ⬇️ Utility & Management
- **Upload Books** – Add your own PDFs (max **5MB**).
- **Download PDF** – One-click download of any book you are reading.
- **Delete Books** – Remove books you have uploaded (system books are protected).

## 🛠️ Tech Stack

- **HTML5** – Semantic and accessible structure.
- **CSS3** – Modern Glassmorphism UI, gradients, and responsive design.
- **Vanilla JavaScript (ES6)** – DOM manipulation, localStorage persistence, and PDF handling.
- **PDF.js** – Rendering PDF files directly in the browser.

## 📂 Project Structure
# 📚 BookNest

Your community book review and reading platform — a fully functional web app built with vanilla HTML, CSS, and JavaScript. Read PDF books, rate them, discuss with others, track your progress, and manage your personal library.

## ✨ Features

### 🔐 Authentication & Security
- **Tab-based Login/Register** – Seamless switching between forms.
- **Secure Email Validation** – Uses regex to validate email format.
- **Case-Insensitive Login** – Prevents duplicate accounts (`User@mail.com` vs `user@mail.com`).
- **Persistent Sessions** – User data stored securely in `localStorage`.

### 📚 Book Library & Discovery
- **8 Pre-loaded Sample Books** – Instantly populated with classics like *The Great Gatsby*, *1984*, *The Hobbit*, etc.
- **Real-time Search** – Filter books by title or author as you type.
- **Category Filters** – Browse by genre (Fiction, Fantasy, History, Technology, etc.).
- **Community Sharing** – Every user can see, rate, and comment on all books (both sample and user-uploaded).

### 📖 Immersive Reading Experience
- **PDF Rendering** – Powered by `PDF.js` for high-quality display.
- **Eye-Friendly Controls**:
  - **Zoom** – 75%, 100%, 125%, 150%.
  - **Themes** – Dark, Light, and Sepia modes for reduced eye strain.
- **Reading Progress Bar** – Visual percentage indicator showing completion.
- **Page Tracking** – Automatically remembers the last page you read. Resume reading right where you left off.

### ❤️ Personalization & Community
- **Favorites/Bookmarks** – ❤️ your favorite books and filter them in the "Favorites" tab.
- **Rating System** – Rate any book (1–5 stars). See average ratings from the community.
- **Comment System** – Discuss books with others. Delete your own comments if needed.
- **User Profiles** – Dedicated profile page showing:
  - Books uploaded
  - Comments posted
  - Favorites list
  - Reading progress list (with % completion)
  - Recently read books

### ⬇️ Utility & Management
- **Upload Books** – Add your own PDFs (max **5MB**).
- **Download PDF** – One-click download of any book you are reading.
- **Delete Books** – Remove books you have uploaded (system books are protected).

## 🛠️ Tech Stack

- **HTML5** – Semantic and accessible structure.
- **CSS3** – Modern Glassmorphism UI, gradients, and responsive design.
- **Vanilla JavaScript (ES6)** – DOM manipulation, localStorage persistence, and PDF handling.
- **PDF.js** – Rendering PDF files directly in the browser.

## 📂 Project Structure
BookNest/
├── index.html # Login & Registration page
├── style.css # Login page styles
├── script.js # Authentication logic
├── home.html # Main dashboard & reading modal
├── home.css # Home page styles
├── home.js # Book grid, search, filters, reader, comments, favorites, progress
├── profile.html # User profile & activity dashboard
├── profile.css # Profile page styles
├── profile.js # Profile statistics and lists logic
└── README.md # Project documentation


## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/md-tanvir-ahammed/BookNest.git
Open index.html in your browser — no build steps, servers, or dependencies required.

Create an account or login to start exploring the books!

💡 Tip: If you want to reset the app (remove all data and load fresh sample books), clear your browser's localStorage for this domain (via DevTools → Application → Storage).

🌿 Branching Strategy
This project follows a feature-branch workflow:

Branch	Purpose
main	Stable, production-ready code
feature/styling	UI/UX design and CSS
feature/auth-logic	Login/Registration logic
feature/reader	PDF viewer, themes, and zoom
feature/interaction	Comments, ratings, favorites
feature/profile	User dashboard and statistics
🔮 Future Improvements
Backend Integration – Replace localStorage with a real database (MongoDB, Firebase).

Secure Authentication – Implement JWT and password hashing (bcrypt).

Advanced Search – Filter by author, category, and rating combined.

Social Sharing – Share book links or reviews via social media.

Mobile App – Convert to a progressive web app (PWA) or React Native app.

👤 Author
Md Tanvir Ahammed
GitHub: @md-tanvir-ahammed

Made with ❤️ for the reading community.