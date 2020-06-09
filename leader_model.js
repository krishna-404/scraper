const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leaderSchema = new Schema({
  leaderName: { type: String },
  leaderSector:  {type:String},
  leaderBio: { type: String },
  imagePath: { type: String},
  storyLink: {type: String},
  booksReco: [
    {
      bookName: { type: String },
      book_desc: { type: String },
      amazonLink: { type: String },
      bookImgPath: { type: String },
      whereRecommended: { type: String },
      leaderComment: {type: String},
      leaderCommentImg:{type: String}
    }
  ],
});

module.exports = mongoose.model("Leader", leaderSchema);
