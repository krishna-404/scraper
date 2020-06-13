require('dotenv').config();
const mongoose = require("mongoose");

//console.log('env: ', process.env.DB);

mongoose.connect(DB="mongodb+srv://krishna:krishna123@gladiator-kris-t7sjb.mongodb.net/scraper?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  });
  mongoose.Promise = global.Promise;
  let db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));

//   const favobooks = require("./favobooks.js");
//   favobooks();

const ceolibrary = require("./ceolibrary.js");
ceolibrary();
