require('dotenv').config();
const request = require('request');
const cheerio = require('cheerio');
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

var counter = 0;

scrapeItems();

function scrapeItems(){

    const LeaderModel = require("./leader_model");

    LeaderModel.find({}, (err,doc) => {
        if(err) {console.error(err)};
       
        doc.forEach(async (data) => {
            
            data.booksReco = await readPage(data);
            //console.log(data.storyLink, data.booksReco);
        })
    })


}

function readPage(data){
    return new Promise((resolve, reject)=>{
    request(data.storyLink, async function(err, response, body){
            
        if (err) console.error(err);

        //console.log(err, response, body);
        let $ = cheerio.load(body);
        let booksReco = [];

        const elements = $('#page tr');

        elements.each(async (roll, page) => {
            
            let bookdetail = {};
            const bookImgPath = await $(page)  .find('.kniga')
                                                    .children('a')
                                                    .children('img')
                                                    .attr('src');
            if(bookImgPath){
                bookdetail.bookImgPath = bookImgPath;

                const detail = $(page).find('.opisanie')
                                                    
                bookdetail.bookName = detail.children('a').text().split(/\sby\s/i);
                bookdetail.bookAuthor = bookdetail.bookName[1];
                bookdetail.bookName = bookdetail.bookName[0].replace('"', '');
                bookdetail.amazonLink = detail.children('a').attr('href');
                
                bookdetail.leaderComment = detail.children('.quote2').text().replace(/^s+/,'') || 
                                           detail.children('.quote').text().replace(/^s+/,'');

                bookdetail.textRecom = detail.children('.recom').text();
                bookdetail.leaderCommentImg = detail.find('img').attr('src');
                bookdetail.phoRecom = detail.find('.pho').text();


                bookdetail.bookDesc = detail.children('.description').text();

                //console.log(bookdetail.bookName, bookdetail.bookAuthor);
                booksReco.push(bookdetail);
                //console.log(booksReco);
            }
            if (roll == elements.length - 1) {
                console.log(counter++, data.storyLink, booksReco);
                resolve(booksReco);
            }
        });
        
    })
})
}

async function start(){
    for(let i=0; i<=75; i+=15){
        await scrapeHome('http://favobooks.com/index.php?start=' + i)
    }
}

function scrapeHome(){

    const LeaderModel = require("./leader_model");

    

    request(homeURL, function(err, response, body){
        if (err) console.error(err);

        let $ = cheerio.load(body);

        $('.article_row').each(async function(i,e) {

            for(let j=1; j<=3; j++) {
                
                const card = $(e).find('.column' + j)

                let leader = {};
                                        
                leader.storyLink = "http://favobooks.com" + card.find('a')
                                       .attr('href')
                                        
                leader.leaderSector = card  .find('a').attr('href')
                                            .match(/^\/[a-z]+/i);
                                        
                leader.leaderSector = leader.leaderSector[0].replace("/", "");
                
                leader.imagepath = "http://favobooks.com" + card .find('img')
                                        .attr('src');

                leader.leaderName = card.find('b')
                                        .text();

                leader.leaderBio  = card.find('p')
                                        .text();

                LeaderModel.create(leader);

                
                
                // console.log(leader);
            }
        })
    })

} 