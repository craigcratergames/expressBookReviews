const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    // Check if the username already exists
    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    // Add the new user to the users array
    users.push({ username, password });
    return res.status(201).json({ message: "User successfully registered. Now you can login." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  // Send a JSON response containing the books array, formatted with an indentation of 4 spaces for readability
  res.send(JSON.stringify({books}, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
      res.send(books[isbn]);
    } else {
      res.status(404).send({ error: "Book not found for the given ISBN" });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = Object.values(books).filter((book) => book.author === author);
    if (booksByAuthor.length > 0) {
      res.send(booksByAuthor);
    } else {
      res.status(404).send({ error: "Book not found for the given author" });
    }
  });
  

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const booksByTitle = Object.values(books).filter((book) => book.title === title);
  if (booksByTitle.length > 0) {
    res.send(booksByTitle);
  } else {
    res.status(404).send({ error: "Book not found for the given title"});
  }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
      const bookReviews = books[isbn].reviews;
      res.json(bookReviews);
    } else {
      res.status(404).send({ error: "Book not found for the given ISBN" });
    }
  });
  

module.exports.general = public_users;
