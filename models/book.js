const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
  summary: { type: String, required: true },
  isbn: { type: String, required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: "Genres" }],
  picture: {
    type: String, 
    default: ''
  }
});

// Virtual for book's URL
BookSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return "/catalog/book/" + this._id;
});

// Virtual for book's URL
BookSchema.virtual("noImage").get(function () {
  // We don't use an arrow function as we'll need the this object
  const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019";
  return url
});

// Export model
module.exports = mongoose.model("Book", BookSchema);
