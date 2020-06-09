const request = require('request');
const cheerio = require('cheerio');
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

  
scrapeItems();

function scrapeItems(){

    const LeaderModel = require("./leader_model");

    LeaderModel.find({}, (err,doc) => {
        if(err) {console.error(err)};

        doc.forEach(async (data) => {

            data.booksReco = await readPage(data.storyLink, (error, dat) => {
                if(err)  console.error(error);
                console.log(dat);
            });
            //console.log(data.booksReco);
        })
    })


}

function readPage(URL){
    request(URL, async function(err, response, body){
            
        if (err) console.error(err);

        //console.log(err, response, body);
        let $ = cheerio.load(body);
        let booksReco = [];

        
        await $('#page tr').each(async (roll, data) => {
            
            let bookdetail = {};
            const bookImgPath = await $(data)  .find('.kniga')
                                                    .children('a')
                                                    .children('img')
                                                    .attr('src');
            if(bookImgPath){
                bookdetail.bookImgPath = bookImgPath;

                const detail = $(data).find('.opisanie')
                                                    
                bookdetail.bookName = detail.children('a').text().split(/\sby\s/);
                bookdetail.bookAuthor = bookdetail.bookName[1];
                bookdetail.bookName = bookdetail.bookName[0];
                bookdetail.amazonLink = detail.children('a').attr('href');
                bookdetail.leaderComment = detail.children('.quote2').text();

                if(!bookdetail.leaderComment){
                    bookdetail.leaderCommentImg = detail.children('.quote2').children('img').attr('src');
                    bookdetail.whereRecommended = detail.children('.pho').text();
                } else {
                    bookdetail.whereRecommended = detail.children('.recom').text();
                }

                bookdetail.bookDesc = detail.children('.description').text();

                console.log(bookdetail.bookName, bookdetail.bookAuthor);
                booksReco.push(bookdetail);
                console.log(booksReco);
            }
        });
        console.log(booksReco);
        return(booksReco);
        
    })
}




