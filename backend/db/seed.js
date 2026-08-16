// Seeds the database with 8 sample "system" books.
// Run once after creating the schema: node db/seed.js
const fs = require('fs');
const path = require('path');
const db = require('./connection');

const SAMPLE_PDF_BASE64 = 'JVBERi0xLjQKJSDi483NCjEgMCBvYmoKPDwvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwvVHlwZSAvUGFnZXMgL0NvdW50IDEgL0tpZHMgWyAzIDAgUiBdID4+CmVuZG9iago3IDAgb2JqCjw8L1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvUmVzb3VyY2VzIDw8L0ZvbnQgPDwvRjEgNCAwIFIgPj4gPj4gL01lZGlhQm94IFswIDAgNjEyIDc5Ml0gL0NvbnRlbnRzIDUgMCBSID4+CmVuZG9iago0IDAgb2JqCjw8L1R5cGUgL0ZvbnQgL1N1YnR5cGUgL1R5cGUxIC9CYXNlRm9udCAvSGVsdmV0aWNhID4+CmVuZG9iago1IDAgb2JqCjw8L0xlbmd0aCA0ND4+CnN0cmVhbQpCVCAvRjEgMjQgVGYgMTAwIDcwMCBUZCAoU2FtcGxlIEJvb2spIEVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTIgMDAwMDAgbiAKMDAwMDAwMDEwMSAwMDAwMCBuIAowMDAwMDAwMjIzIDAwMDAwIG4gCjAwMDAwMDAyOTAgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDYvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgozODQKJSVFT0Y=';

const SAMPLE_BOOKS = [
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction' },
    { title: '1984', author: 'George Orwell', category: 'Fiction' },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', category: 'Fiction' },
    { title: 'Pride and Prejudice', author: 'Jane Austen', category: 'Fiction' },
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', category: 'Fantasy' },
    { title: 'Moby-Dick', author: 'Herman Melville', category: 'Fiction' },
    { title: 'The Catcher in the Rye', author: 'J.D. Salinger', category: 'Fiction' },
    { title: 'War and Peace', author: 'Leo Tolstoy', category: 'History' }
];

async function seed() {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const [existing] = await db.query('SELECT COUNT(*) AS c FROM books WHERE is_system = 1');
    if (existing[0].c > 0) {
        console.log('Sample books already seeded. Skipping.');
        process.exit(0);
    }

    for (const book of SAMPLE_BOOKS) {
        const filename = 'sample_' + book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.pdf';
        fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(SAMPLE_PDF_BASE64, 'base64'));

        await db.query(
            'INSERT INTO books (title, author, category, pdf_path, added_by, is_system) VALUES (?, ?, ?, ?, NULL, 1)',
            [book.title, book.author, book.category, filename]
        );
        console.log('Seeded:', book.title);
    }

    console.log('Done seeding sample books.');
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
