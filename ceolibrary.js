const LeaderModel = require("./leader_model");

async function start(){
    for(let i=1; i<=132; i+=1){ //loop through all the 132 pages of books listings
        const pageDone = await scrapeBooksList('https://www.theceolibrary.com/books/page/' + i);
        console.log('page no done:', i, pageDone)
    }
}

function scrapeBooksList(){ //scrape the books page for listing

    return new Promise((resolve, reject)=> {

    request(homeURL, function(err, response, body){
        if (err) {
            console.error('scrapeBooksList err: ', err);
            reject(err);
        }

        if(response.statusCode !== 200){

            console.error('response.statusCode, homeURL, response');
            reject(response.StatusCode);
        
        } else {
            let $ = cheerio.load(body);

            const elements = $('.fcl-entry')

            elements.each(async function(i,e) {
                    
                    const card = $(e)

                    let book = {};
                                            
                    book.bookLink = card.find('a')
                                        .attr('href');
                                            
                    book.bookName = card.find('.book-title')
                                        .text();
                    
                    book.bookImgPath = card .find('.book-cover')
                                            .attr('data-bgset');

                    book.bookAuthor = card.find('.book-info')
                                        .children('a')
                                        .text();

                    await scrapeBook(book);
                    console.log('scrapebookdone: ', i);

                    if (i == elements.length - 1) {
                        resolve(homeURL + ' scrapebooksList done');
                    }

            })
        }
    })
})
}

function scrapeBook(book){
    return new Promise((resolve, reject) => {
    
        request(book.bookLink, function(err, response, body){
            if (err) {
                console.error('scrapeBook err: ', err);
                reject(err);
            }
    
            if(response.statusCode !== 200){
    
                console.error('response.statusCode, book.bookLink, response');
                reject(response.StatusCode);
            
            } else {
                let $ = cheerio.load(body);

                const elements =  $('.re-entry');

                elements.each(async function(i,e){

                    const card = $(e);

                    let leader = {};
                                        
                    leader.leaderLink = card.find('a')
                                        .attr('href');

                    leader.leaderName = card.find('strong')
                                        .text();
                                            
                    leader.leaderSector = card  .find('p')
                                                .text()
                                                .replace(/^[" (]/,"")
                                                .replace(/[)"]$/,"");

                    book.quote = card.text();

                    let reco = $('.sources-list>li');

                    let recoCard = $(reco[i]);

                    book.whereRecommended = recoCard.find('a')
                                                    .attr('href')
                                            
                    leader = await scrapeLeader(leader);
                    console.log('scrapeLeader done: ', i);

                    leader.booksReco= [];
                    leader.booksReco.push(book);

                    if (i == elements.length - 1) {
                        resolve(book.bookLink + ' scrapeBook done');
                    }
                })
            }
        })
    })
}

function scrapeLeader(){
    new Promise((resolve, reject)=> {

        request(leader.leaderLink, function(err, response, body){
            if (err) {
                console.error('leaderLink err: ', err);
                reject(err);
            }
    
            if(response.statusCode !== 200){
    
                console.error('response.statusCode, leader.leaderLink, response');
                reject(response.StatusCode);
            
            } else {
                let $ = cheerio.load(body);

                const card =  $('.tag-description');

                leader.imagepath = card .find('img')
                                        .attr('src');

                leader.leaderBio  = card;
                
                resolve(leader);
                
            }
        })

})
} 

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0"> <!-- displays site properly based on user's device -->
  <meta name="description" content="This is a project for Frontend Mentor Project. This is called as fylo data storage template.">
  <meta name="author" content="Balkrishna Agarwal">
  <meta name="keywords" content="Data Storage Template, Fylo, Frontend Mentor">
  <meta name="application-name" content="Fylo Data Storage">
  <!-- <meta name="generator" content="node.js"> -->

  <link rel="icon" type="image/png" sizes="32x32" href="./images/favicon-32x32.png">
  
  <title>Frontend Mentor | Fylo data storage component</title>

  <!-- Feel free to remove these styles or customise in your own stylesheet 👍 -->
  <link rel="stylesheet" type="text/css" href="style.css?v=1.0">
  
  <!-- <base>Defines the base URL for all linked objects on a page. -->
  
</head>
<body>

  

  You’ve used 815 GB of your storage

  185 GB Left
  
  0 GB
  1000 GB
  
  <div class="attribution">
    Challenge by <a href="https://www.frontendmentor.io?ref=challenge" target="_blank">Frontend Mentor</a>. 
    Coded by <a href="#">Your Name Here</a>.
  </div>
</body>

  <!-- <script src="js/scripts.js" type="text/javascript"></script> -->
</html>

<!--  <article>	Defines an article.</article>
      <aside>Defines some content loosely related to the page content.</aside>
      <details>	Represents a widget from which the user can obtain additional information or controls on-demand.</details>
      <summary>Defines a summary for the <details> element.</summary>
      <hgroup>Defines a group of headings.</hgroup>
      <nav>Defines a section of navigation links.</nav>
      <section>Defines a section of a document, such as header, footer etc.</section>
      <span>Defines an inline styleless section in a document.</span>
      <code>Specifies text as computer code.</code>
      <cite>Indicates a citation or reference to another source.</cite>
      <dfn>Specifies a definition.</dfn>
      <em>Specifies emphasized text.</em>
      <mark>Represents text highlighted for reference purposes.</mark>
      <output>Represents the result of a calculation.</output>
      <progress>Represents the completion progress of a task.</progress>
      <blockquote>Defines a long quotation.
      <q>Defines a short inline quotation.</q>
      <figcaption>Defines a caption or legend for a figure.</figcaption>
      <source>Defines alternative media resources for the media elements like <audio> or <video>.
      <time>Represents a time and/or date.</time>
      <address>Specifies the author's contact information.
      <acronym>Defines an acronym.
      <abbr>Defines an abbreviated form of a longer word or phrase. --></abbr>