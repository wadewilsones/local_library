const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const GenreSchema = new Schema({
    name: { type: String, required: true, maxLength: 100, minLength: 3 }
})

// Virtual for author's URL
GenreSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/catalog/genres/${this._id}`;
  });

module.exports = mongoose.model("Genres", GenreSchema);