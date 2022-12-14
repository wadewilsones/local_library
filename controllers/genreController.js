const Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const he = require('he');

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field.
  body("newGenre", "Genre name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new Genre({ name: req.body.newGenre });

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render("genre_form", {
        title: "Create Genre",
        genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      Genre.findOne({ name: req.body.newGenre }).exec((err, found_genre) => {
        if (err) {
          return next(err);
        }

        if (found_genre) {
          // Genre exists, redirect to its detail page.
          res.redirect(found_genre.url);
        } else {
          genre.save((err) => {
            if (err) {
              return next(err);
            }
            // Genre saved. Redirect to genre detail page.
            res.redirect('/');
          });
        }
      });
    }
  },
];


// Display Genre delete form on GET.
exports.genre_delete_get = (req, res) => {

  Genre.find().then((allgenres) => {
    Genre.findById(req.params.id).exec(function (err, result){
      if(err){
        return next(err);
      }
      console.log(result);
      res.render('delete_genre_form', {genre_title:result, genres: allgenres})
  })

 })

};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res) => {
  //find the book and delete it
  Genre.findByIdAndRemove(req.params.id).exec((err, result) => {
    if(err){
      return next(err)
    }
    else{
      return res.redirect('/');
    }
  })
};


exports.genre_getBooks_byGenre = (req, res) => {

  async.parallel({
    genres(callback){
      Genre.find({}).exec(callback)
    },
    currentGenre(callback){
      Genre.findById(req.params.id).exec(callback)
    },
    book(callback){
      Book.find({genre:req.params.id}).populate('author').exec(callback)
    }},
    (err, results) => {
      if(err){
        return next(err)
      }
      //Format output
      const formattedData = [];
      results.book.forEach(element => {

          formattedData.push({
            booktitle: he.decode(element.title),
            summary:he.decode(element.summary),
            author:he.decode(element.author.fullName),
            genre:element.genre,
            picture:element.picture,
            url:element.url
          })
    })
    res.render('genre_detail', {formattedData: formattedData, genres: results.genres, genre:results.currentGenre });
  }
)
}