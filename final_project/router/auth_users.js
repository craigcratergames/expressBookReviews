const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const secretKey = 'your_secret_key'; // Declare the secret key

const isValid = (username) => {
    // Check if any user has the same username
    return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
    // Check if any user has the same username and password
    return users.some((user) => user.username === username && user.password === password);
};

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    // Check if username and password are provided
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
  
    // Validate the username and password
    if (authenticatedUser(username, password)) {
      // Generate a JWT token
      const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });
  
      return res.status(200).json({
        message: "Login successful!",
        token,
      });
    } else {
      return res.status(401).json({ message: "Invalid username or password." });
    }
  });

// Add or modify a book review route
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params; // Get ISBN from the route parameter
    const { review } = req.body; // Get the review content from the request body
  
    // Check if the JWT token is provided
    const token = req.header('Authorization')?.split(' ')[1]; // Extract the token from the Authorization header
  
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
  
    try {
      // Verify the token and get the user data
      const decoded = jwt.verify(token, secretKey);
      const username = decoded.username;
  
      // Find the book by ISBN
      const book = books.find(b => b.isbn === isbn);
      if (!book) {
        return res.status(404).json({ message: "Book not found." });
      }
  
      // Check if the user has already posted a review for this ISBN
      const existingReviewIndex = book.reviews.findIndex(r => r.username === username);
      
      if (existingReviewIndex !== -1) {
        // Modify the existing review if found
        book.reviews[existingReviewIndex].review = review;
        book.reviews[existingReviewIndex].date = new Date(); // Update the review date
        return res.status(200).json({
          message: "Review updated successfully!",
          book: book,
        });
      } else {
        // Add the new review to the reviews array
        const newReview = {
          username,
          review,
          date: new Date(),
        };
        book.reviews.push(newReview);
        return res.status(200).json({
          message: "Review added successfully!",
          book: book,
        });
      }
  
    } catch (error) {
      return res.status(400).json({ message: "Invalid token." });
    }
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
