require('dotenv').config();
const mongoose = require("mongoose");


mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  });
  mongoose.Promise = global.Promise;
  let db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));

const dbLeaderModel = require("./db_leader_model");
const dbBookModel = require("./db_book_model");
const LeaderModel = require("../leaders_model");
const BookModel = require("../books_model")

// start();
countUpdate();

async function start(){
  let leaders = await dbLeaderModel.find().lean()
  for(let i=0; i<leaders.length; i++) {
      let dbLeader = leaders[i];

      let data = {
            _id: dbLeader._id,
            leaderName: dbLeader.leaderName,
            leaderSector:  dbLeader.leaderSector,
            leaderBio: dbLeader.leaderBio,
            leaderImgPath: dbLeader.leaderImgPath,
            leaderStoryLink: dbLeader.leaderStoryLink,
            booksReco: []
          }
      
      for(let j=0; j<dbLeader.booksRecoId.length; j++){
        data.booksReco.push({id : dbLeader.booksRecoId[j]});
      }    

      await LeaderModel.create(data);  
  }
  console.log('done');

  let books = await dbBookModel.find().lean()
  for (let j=0; j<books.length; j++){
    // console.log(dbBook);
    dbBook = books[j];
    await BookModel.create(dbBook);
  };
      
  console.log('done');
  return null;
};

async function countUpdate(){
  let leaders = await LeaderModel.find();
  for (let j=0; j<leaders.length; j++){
    // console.log(dbBook);
    let dbLeader = leaders[j];
    dbLeader.sortCount = dbLeader.booksReco.length;
    await dbLeader.save();
  };
  console.log('done');
}



/*
const mongo = require('mongodb');


mongo.connect(process.env.DB, (err, client) => {
  if (err) {
    console.log("Database error: " + err);
    reject("Database error: " + err)
  } else {
    //var db = client.db('scraper');
    
    // db.getCollection('books').aggregate([{$out: "dbBooks"}]);
    // db.getCollecction('ceolibleaders').aggregate([{$oout: "dbLeaders"}]);

    client.db('books').copyTo("dbBooks");
    console.log('done');
    client.db('ceolibleaders').copyTo("dbLeaders")
    console.log('done');
    return null;
  }
});
*/