const http = require('http');
const url = require('url');
const { parse } = require('querystring');
let fs = require('fs')
// Dummy database
// Read data from the JSON file
let data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

// Extract books and users from the data
let books = data.books;
let users = data.users;

// Create HTTP server
const server = http.createServer((req, res) => {
    // Parse request URL
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;
    // console.log(parsedUrl);
    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    
    // Handle different routes
    let pathName = parsedUrl.pathname.split("/")[1]
    console.log(pathName);
    if (pathName === 'books') {
        console.log("welcome books");
        if (req.method === 'GET') {
            // Send books
            res.end(JSON.stringify(books));
        } else if (req.method === 'POST') {
            // Receive new book from request body
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', () => {
                const newBook = JSON.parse(body);
                books.push(newBook);
                // save changes to data.json
                saveDataToFile()
                res.end(JSON.stringify({ message: 'Book added successfully' }));
            });
        } else if (req.method === 'DELETE') {
            // Delete book by ID from query params
            const bookId = parsedUrl.pathname.split('/')[parsedUrl.pathname.split('/').length - 1];
            books = books.filter(book => book.id !== bookId);
            saveDataToFile()
            res.end(JSON.stringify({ message: 'Book deleted successfully' }));
        }else if (req.method === 'PUT') {
            console.log("welcome");
            // Extract object ID from URL
            const bookId = parsedUrl.pathname.split('/')[parsedUrl.pathname.split('/').length - 1];
            console.log('Book ID:', bookId); // Add this line for logging
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                console.log('Request Body:', body); // Add this line for logging
                const updatedBook = JSON.parse(body);
                // Update book by ID
                books = books.map(book => (book.id === bookId ? updatedBook : book));
                console.log('Updated Books:', books); // Add this line for logging
                saveDataToFile();
                res.end(JSON.stringify({ message: 'Book updated successfully' }));
            });
        }
    } else if (pathName === 'users') {
        if (req.method === 'GET') {
            // Send users
            res.end(JSON.stringify(users));
        } else if (req.method === 'POST') {
            // Receive new user from request body
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const newUser = JSON.parse(body);
                users.push(newUser);
                saveDataToFile()
                res.end(JSON.stringify({ message: 'User added successfully' }));
            });
        } else if (req.method === 'DELETE') {
            // Delete user by ID from query params
            const userId = parsedUrl.pathname.split('/')[parsedUrl.pathname.split('/').length - 1];
            users = users.filter(user => user.id !== userId);
            saveDataToFile()
            res.end(JSON.stringify({ message: 'User deleted successfully' }));
        } else if (req.method === 'PUT') {
            // Update user by ID with new data from request body
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                const updatedUser = JSON.parse(body);
                const userId = parsedUrl.pathname.split('/')[parsedUrl.pathname.split('/').length - 1];
                users = users.map(user => (user.id === userId ? updatedUser : user));
                saveDataToFile()
                res.end(JSON.stringify({ message: 'User updated successfully' }));
            });
        }
    } else {
        // Handle invalid routes
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});
// Function to save data to data.json file
function saveDataToFile() {
    const newData = { books, users };
    fs.writeFileSync('data.json', JSON.stringify(newData, null, 2), 'utf-8');
}

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

