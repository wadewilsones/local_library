const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  fullName: { type: String, required: true, maxLength: 100 },
});

// Virtual for author's name
AuthorSchema.virtual("name").get(function () {
  // We don't use an arrow function as we'll need the this object
  let author_name = '';
  if(this.fullName){
      author_name = this.fullName;
  }
  else{
    author_name = 'Unknown author';
  }
  return author_name;
});


// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/author/${this._id}`;
});

// Export model
module.exports = mongoose.model("Author", AuthorSchema);
