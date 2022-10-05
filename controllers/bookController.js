const Book = require("../models/book");
const Author = require("../models/author");
const Genre = require("../models/genre");
const async = require("async");
const { body, validationResult } = require("express-validator");
const path = require('path');
const fs = require('fs-extra');
const he = require('he');

//Display genres and available books
exports.index = function (req, res, next) {

  async.parallel({
    genre(callback){
      Genre.find({})
      .exec(callback)
    },
    books(callback){
      Book.find({}).populate('author').populate('genre').exec(callback)
    },

  }, (err, result)=>{
      if(err){
        return next(err)
      }
      else
      {
        //Create a new object with encoding
        const formattedData = [];

        (result.books.forEach(element => {

          formattedData.push({

            title: he.decode(element.title),
            summary:he.decode(element.summary),
            author:he.decode(element.author.fullName),
            genre:element.genre,
            picture:element.picture,
            url:element.url
          })
        
        }))
        res.render('index', {title:'Local Library', genres:result.genre, formattedData:formattedData})
      }   
      })
};


// Display detail page for a specific book.
exports.book_detail = (req, res, next) => {
  async.parallel(
    {
      book(callback) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      genre(callback){
        Genre.find({})
        .exec(callback)
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.book == null) {
        // No results.
        const err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }

      let title = he.decode(results.book.title);
      let summary = he.decode(results.book.summary);
        console.log(title)
      // Successful, so render.
      res.render("book_detail", {
        title: title,
        summary:summary,
        author:results.book.author,
        book: results.book,
        genres:results.genre
      });
    }
  );
};

// Display book create form on GET.

exports.book_create_get = (req, res, next) => {
  // Get all authors and genres, which we can use for adding to our book.
  async.parallel(
    {
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("book_form", {
        title: "Create Book",
        book: undefined,
        genres: results.genres,
      });
    }
  );
};


// Handle book create on POST.
exports.book_create_post = [

  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },
  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    // Create a Book object with escaped and trimmed data.
    if (!errors.isEmpty()) {
      Genre.find((err, results) => {
        if (err) {
          return next(err);
        }
         // Mark our selected genres as checked.
         for (const genre of results.genres) {
          if (book.genre.includes(genre._id)) {
            genre.checked = "true";
          }
        }
        res.render("book_form", {
          title: "Create Book",
          authors: results.authors,
          genres: results.genres,
          errors: errors.array(),
        });
      }
    );
    return;

    }

    //Add author and books

    const author = new Author({ fullName: req.body.author});
    author.save().then(() => {

      Author.find({ fullName: req.body.author }, function (err, authorData) {
        if(err){
          return next(err)
        }

        let imageData = null;
        if(req.body.imageUpload){
          imageData = fs.readFileSync(path.join(__dirname, '..', 'uploads/' + req.file.filename));
        }
        else{
          imageData = null;
        }
            //Fill out a new book 
        const book = new Book({
          title: req.body.title,
          author: authorData[0].id,
          summary: req.body.summary,
          isbn: req.body.isbn,
          genre: req.body.genre,
          picture: {
              data: imageData,
              contentType: 'image/png'
          }
  });


        book.save((err) => {
          if (err) {
            return next(err);
          }

          //Delete image from the upload folder

          fs.unlink((path.join(__dirname, '..', 'uploads/' + req.file.filename)), (err) => {
            if(err){
              throw err
            }
            else{
              console.log('Uploaded file was deleted')
            }
          })

          // Successful: redirect to new book record.

          res.redirect('/');
        });
      })
      });
  }];

// Display book delete form on GET.
exports.book_delete_get = (req, res) => {
 // find required book from database and remove it from it.
 async.parallel({
  genre(callback){
    Genre.find({}).exec(callback)
  },
  book(callback){
    Book.findById(req.params.id).populate('author').exec(callback)
  }
 }, (err, result) => {
  if(err){
    return next(err);
  }
  res.render('delete_book_form', {book_title:result.book.title, book: result.book, genres:result.genre})
 })
    
};

// Handle book delete on POST.
exports.book_delete_post = (req, res) => {

  //find the book and delete it
  Book.findByIdAndRemove(req.params.id).exec((err, result) => {
    if(err){
      return next(err)
    }
    else{
      return res.redirect('/');
    }
  })

 
};

// Display book update form on GET.
exports.book_update_get = (req, res, next) => {
  // Get book, authors and genres for form.
  async.parallel(
    {
      book(callback) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      genres(callback) {
        Genre.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.book == null) {
        // No results.
        const err = new Error("Book not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      // Mark our selected genres as checked.
      for (const genre of results.genres) {
        for (const bookGenre of results.book.genre) {
          if (genre._id.toString() === bookGenre._id.toString()) {
            genre.checked = "true";
          }
        }
      }

      let formatted_title = he.decode(results.book.title);
      let formatted_author = he.decode(results.book.author.fullName);
      let formatted_summary = he.decode(results.book.summary);
  
      res.render("book_form", {
        title: "Update Book",
        book_title:formatted_title,
        book_summary:formatted_summary,
        book_author:formatted_author,
        genres: results.genres,
        book: results.book,
      });
    }
  );
};


// Handle book update on POST.
exports.book_update_post = [
  // Convert the genre to an array
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === "undefined" ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }).escape(),
  body("genre.*").escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    let imageData;

    if(req.file != null){
      imageData = fs.readFileSync(path.join(__dirname, '..', 'uploads/' + req.file.filename));
    }
    else{
      imageData = null;
    }
    console.log(req.file);    
    // Create a Book object with escaped/trimmed data and old id.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === "undefined" ? [] : req.body.genre,
      picture: {
        data: imageData,
        contentType: 'image/png'
    },
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      async.parallel(
        {
          authors(callback) {
            Author.find(callback);
          },
          genres(callback) {
            Genre.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          // Mark our selected genres as checked.
          for (const genre of results.genres) {
            if (book.genre.includes(genre._id)) {
              genre.checked = "true";
            }
          }
          res.render("book_form", {
            title: "Update Book",
            authors: results.authors,
            genres: results.genres,
            book,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Book.findByIdAndUpdate(req.params.id, book, {

    }, (err, thebook) => {
      if (err) {
        return next(err);
      }

      if(imageData != null){
        fs.unlink((path.join(__dirname, '..', 'uploads/' + req.file.filename)), (err) => {
          if(err){
            throw err
          }
          else{
            console.log('Uploaded file was deleted')
          }
        })
      }
      

      // Successful: redirect to book detail page.
      res.redirect('/');
    });
  },
];
