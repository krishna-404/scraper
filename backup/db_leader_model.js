const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leaderSchema = new Schema({
  leaderName: { type: String },
  leaderSector:  {type:String},
  leaderBio: { type: String },
  leaderImgPath: { type: String},
  leaderStoryLink: {type: String},
  twitter: { id: { type: String }, followers: { type: Number } },
  booksRecoId: [String],
},{
  timestamps: true,
  collection: 'dbleaders'
});

module.exports = mongoose.model("dbceolibLeader", leaderSchema);
