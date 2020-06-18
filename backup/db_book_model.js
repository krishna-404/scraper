const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  bookName: { type: String, required: true },
  bookAuthor: [String],
  ISBN13: { type: String },
  ISBN10: { type: String},
  ASIN: {type: String},
  bookDesc: { type: String },
  bookTags: [String],
  bookImgPath: { type: String },
  amazonLink: { type: String },
  bookStoryLink: {type: String},
  leadersReco: [
    {
      leaderDbId: {type: String},
      twitterId: {type: String},
      whereRecommended: { type: String },
      whenRecommended: { type: Date },
      leaderComment: {type: String}
    }
  ]
},{
  timestamps: true,
  collection: 'dbBooks'
});

module.exports = mongoose.model("dbBook", bookSchema)