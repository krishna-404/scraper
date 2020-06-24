const request = require('request');
const cheerio = require('cheerio');
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

const LeaderModel = require("./leaders_model");
const BookModel = require("./books_model");

async function start(){
    for(let i=0; i<=132; i+=1){ //loop through all the 132 pages of books listings
        const pageDone = await scrapeBooksList('https://www.theceolibrary.com/books/page/' + i).catch(e => console.error(e));
        console.log('page number done:', i, pageDone)
    }
    return null;
}

function scrapeBooksList(homeURL){ //scrape the books page for listing
    return new Promise((resolve, reject)=> {
        request(homeURL, async function(err, response, body){
            if (err) {
                console.error('scrapeBooksList err: ', err);
                reject(err);
            }

            if(response.statusCode !== 200){
                console.error('response.statusCode, homeURL, response');
                reject(response.statusCode);
            } else {
                let $ = cheerio.load(body);
                const elements = $('.fcl-entry')

                for(let i=0; i<elements.length; i++) {
                        const card = $(elements[i])
                        let book = {};
                                                
                        book.bookStoryLink = card.find('a')
                                            .attr('href');
                        book.bookName = card.find('.book-title')
                                            .text();
                        book.bookImgPath = card .find('.book-cover')
                                                .attr('data-bgset');
                        book.bookAuthor = [];
                        card.find('.book-info a').each((i,e) => {
                            book.bookAuthor.push($(e).text());
                        })
                                            

                        await scrapeBook(book).catch(e => console.error(e));
                        console.log('scrapebookdone: ', i);

                        if (i == elements.length - 1) {
                            resolve(homeURL + ' scrapebooksList done');
                        }
                };
            }
        })
    })
}

function scrapeBook(book){
    return new Promise((resolve, reject) => {
        request(book.bookStoryLink, function(err, response, body){
            if (err) {
                console.error('scrapeBook err: ', err);
                reject(err);
            }
            if(response.statusCode !== 200){
                console.error('response.statusCode, book.bookLink, response');
                reject(response.statusCode);
            } else {
                let $ = cheerio.load(body);

                book.bookTags=[];
                $('.breadcrumb a').each(function(i,e){
                    if(i != 0){
                        book.bookTags.push($(e).text());
                    }
                });

                book.bookDesc = $('.amazon-book-description').contents();
                $('.buy-book a').each((i,e) => {
                    if(i==0){
                        book.amazonLink = $(e).attr('href');
                    }
                })
                book.leadersReco = [];

                BookModel.create(book, async (err, bookDoc) => { 
                    if(err) {
                        console.error(err);
                        reject(err);
                    };
                    const elements =  $('.re-entry');

                    // elements.each(async (count, dat) => { //reading the leaders in async

                    for(let count=0; count<=elements.length-1; count++){

                        // await new Promise(resolve => setTimeout(resolve, count*1000));
                        //console.log(count,elements.length);
                        const card = $(elements[count]);
                        // const card = $(dat);
                        
                        let bookReco = {};
                            
                        bookReco.leaderComment = card.text();
                        
                        let reco = $('.sources-list>li');
                        let recoCard = $(reco[count]);

                        bookReco.whereRecommended = recoCard.find('a')
                                                        .attr('href');
                                                        

                        let leader = {};
                                            
                        leader.leaderStoryLink = "https://www.theceolibrary.com" + card.find('a')
                                            .attr('href').replace(/\<.*?\>/g,"").replace(/\ă/g, "a");
                        
                        let leaderDoc = await LeaderModel.findOne({leaderStoryLink: leader.leaderStoryLink})
                        let leaderDbId;
                            
                        if(!leaderDoc){

                            leader.leaderName = card.find('strong')
                                                .text();
                            leader.leaderSector = card  .find('p')
                                                        .text()
                                                        .match(/\(.*?\)/);
                            if(leader.leaderSector){
                                leader.leaderSector = leader.leaderSector[0].replace("(", "")
                                                            .replace(")", "");
                            } else {
                                console.log("leaderSector not available: ", leader);
                            }
                            leader.booksRecoId = [];
                            leader.booksRecoId.push(bookDoc.id);
                            
                            console.log(count, elements.length, leader.leaderStoryLink, bookDoc.bookStoryLink)
                            leader = await scrapeLeader(leader).catch(e => console.error(e));
                            console.log('scrapeLeader done: ', count, leader.leaderName);
                            
                            leaderDoc = await LeaderModel.create(leader)
                            console.log("leaderDoc: ", leaderDoc);
                            bookReco.leaderDbId = leaderDoc.id;
                            bookDoc.leadersReco.push(bookReco);
                            await bookDoc.save();
                            if (count == elements.length - 1) {
                                resolve('leader done');
                            }
                            
                        } else {

                            leaderDoc.booksRecoId.push(bookDoc.id);
                            await leaderDoc.save();

                            console.log(leaderDoc.id);
                            bookReco.leaderDbId = leaderDoc.id;
                            bookDoc.leadersReco.push(bookReco);
                            await bookDoc.save();
                            if (count == elements.length - 1) {
                                resolve('leader done');
                            }
                        }
                    };
                });
            }
        })
    })
}

function scrapeLeader(leader){
    return new Promise((resolve, reject)=> {
        request(leader.leaderStoryLink, function(err, response, body){
            if (err) {
                resolve(leader);
                console.error('leaderLink err: ', err);
                resolve(leader);
            }
            if(response.statusCode !== 200){
                resolve(leader);
                console.error(response.statusCode, leader.leaderLink, response);
                reject(response.statusCode);
            } else {
                let $ = cheerio.load(body);
                const card =  $('.tag-description');

                leader.leaderImgPath = card .find('img')
                                        .attr('src');
                leader.leaderBio  = card.find('p').contents();
                
                resolve(leader);
            }
        })
    })
}

module.exports = start()
