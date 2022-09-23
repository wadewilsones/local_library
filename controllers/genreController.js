const Genre = require("../models/genre");
const Book = require("../models/book");
const async = require("async");
const mongoose = require("mongoose");



// Display list of all Genre.
exports.genre_list = (req, res, next) => {
  //here get data from the model and render it
  Genre.find() // find all data
  .sort() // sort the data
  .exec (function (err, genre_list){
    if(err){
      return next(err)
    }
    else{
      res.render("genres", {"title":'Genre List', "genre_list": genre_list});
    }

  }) 

};

// Display detail page for a specific Genre.
exports.genre_detail = (req, res, next) => {

  const id = mongoose.Types.ObjectId(req.params.id);
  async.parallel(
    {
      genre(callback) {
        Genre.findById(id).exec(callback);
      },

      genre_books(callback) {
        Book.find({ genre: id }).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err.message);
      }
      if (results.genre == null) {
        // No results.
        const err = new Error("No idea...");
        err.status = 404;
        return next(err.message);
      }
      // Successful, so render
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: results.genre,
        genre_books: results.genre_books,
      });
    }
  );
};

// Display Genre create form on GET.
exports.genre_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre create GET");
};

// Handle Genre create on POST.
exports.genre_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre create POST");
};

// Display Genre delete form on GET.
exports.genre_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete GET");
};

// Handle Genre delete on POST.
exports.genre_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete POST");
};

// Display Genre update form on GET.
exports.genre_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
};

// Handle Genre update on POST.
exports.genre_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
};
