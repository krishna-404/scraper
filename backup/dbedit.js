require('dotenv').config();
const mongoose = require("mongoose");
const cheerio = require('cheerio');


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

start();

async function start(){

  let books= await BookModel.find();

  for (let i=0; i<books.length; i++){
    console.log(books[i].id);
    if(!books[i].bookRBLink){
      books[i].bookRBLink =  encodeURI((`/books/${books[i].ISBN13 || books[i].ISBN10 || books[i].ASIN || books[i].id}/${books[i].bookAuthor[0]+" "+books[i].bookName}`).replace(/\s/g, "-"));
      console.log(books[i].bookRBLink)
      await books[i].save();
    }
  }
  console.log("done");
}

async function old(){

  // let bookOld = await BookModel.find({createdBy: {$exists: false}});
  // console.log("Length: ", bookOld.length);

  let leader = await LeaderModel.find();

  for (let j=0; j<leader.length; j++){
    console.log(leader[j].id);

    if(leader[j].leaderBio){
      let $ = cheerio.load(leader[j].leaderBio);

      let elements = $('a')

      for (let i=0; i<elements.length; i++){
        
        let findLink =  $(elements[i]).attr('href');
        console.log(findLink);

        let book = await BookModel.findOne({bookStoryLink: findLink});
        if(book){
          console.log(book.id);
          let newLink = book.bookRBLink || encodeURI((`/books/${book.ISBN13 || book.ISBN10 || book.ASIN || book.id}/${book.bookAuthor[0]+" "+book.bookName}`).replace(/\s/g, "-"));
          if(!book.bookRBLink){
            book.bookRBLink = newLink;
            await book.save();
          }
          console.log(newLink);
          $(elements[i]).attr('href', newLink);
          console.log($('body'));
          leader[j].leaderBio = $('body');
          leader[j].leaderBio = leader[j].leaderBio.replace("<body>", "").replace("</body>", "");
          console.log(leader[j].leaderBio);
        } else {
          let leaderFindLink = await LeaderModel.findOne({leaderStoryLink: findLink});

          if(leaderFindLink){
            console.log(leaderFindLink.id);
            newLink = leaderFindLink.leaderRBLink || encodeURI((`/${leaderFindLink.twitter.id || leaderFindLink.id}`));
            if(!leaderFindLink.leaderRBLink){
              leaderFindLink.leaderRBLink = newLink;
              await leaderFindLink.save();
            }
            console.log(newLink);
            $(elements[i]).attr('href', newLink);
            console.log($('body'));
            leader[j].leaderBio = $('body');
            leader[j].leaderBio = leader[j].leaderBio.replace("<body>", "").replace("</body>", "");
            console.log(leader[j].leaderBio);
          }
        }
      }
    }

    if(!leader[j].leaderRBLink){
      leader[j].leaderRBLink = encodeURI((`/${leader[j].twitter.id || leader[j].id}`));
      console.log(leader[j].leaderRBLink);
      leader[j].save();
    }
  } 
};




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