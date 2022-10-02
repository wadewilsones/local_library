const Author = require("../models/author");
const async = require("async");
const Book = require("../models/book");
const { body, validationResult } = require("express-validator");



// Display books for a selected author

exports.author_detail = function (req, res, next) {
    async.parallel(
      {
        author(callback) {
          Author.findById(req.params.id).exec(callback);
        },
        authors_books(callback) {
          Book.find({ author: req.params.id }, "title summary").exec(callback);
        },
      },
      (err, results) => {
        if (err) {
          // Error in API usage.
          return next(err);
        }
        if (results.author == null) {
          // No results.
          const err = new Error("Author not found");
          err.status = 404;
          return next(err);
        }
        // Successful, so render.
        res.render("author_detail", {
          title: "Author Detail",
          author: results.author,
          author_books: results.authors_books,
        });
      }
    );

  }