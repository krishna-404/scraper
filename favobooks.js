
var counter = 1, counter2 = 0;

// start();
// scrapeItems();


async function start(){
    for(let i=0; i<=75; i+=15){
        await scrapeHome('http://favobooks.com/index.php?start=' + i)
    }
}

function scrapeHome(){

    const LeaderModel = require("./leaders_model");

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

function scrapeItems(){

    const LeaderModel = require("./leader_model");

    LeaderModel.find({},async (err,doc) => {
        if(err) {console.error(err)};
       
       for(let i=0; i<doc.length-1; i++){
            // let data={};
            // data.storyLink = "http://favobooks.com/investors/59-jamie-dimon.html"
            
            data= doc[i];
            console.log('Timeout......1');
            // await sleep(9000);
            //await new Promise(resolve => setTimeout(resolve, 5000));
            console.log('Timeout.....2');

            data.booksReco = await readPage(data);

           
                
              
            //console.log(data.storyLink, data.booksReco);
            //data.save();
            
        }
    })


}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   

function readPage(data){
    return new Promise((resolve, reject)=>{

    request(data.storyLink, async function(err, response, body){
        if (err) console.error(err);

        // while(response.statusCode !== 200){
        //     console.log(counter2, data.storyLink, response.toJSON());

        //         request(data.storyLink, await function(err, response_new, body_new){
        //             return new Promise((resolve, reject)=> {
        //             if (err) reject(err);

        //             response = response_new;
        //             body = body_new;
        //             console.log(counter2, data.storyLink, response.toJSON());
        //             resolve(null);
        //         });
        //         })
        //     }

        //console.log(err, response, body,);
        let $ = cheerio.load(body);
        let booksReco = [];

        const elements = $('#page>table>tbody>tr');
        counter2++;
        console.log(counter2, data.storyLink, elements, response.toJSON());
        
        
            
        
        
        elements.each((roll, page) => {
            
            let bookdetail = {};
            const bookImgPath = $(page)  .find('.kniga')
                                                    .children('a')
                                                    .children('img')
                                                    .attr('src');
            //(console.log(counter2,data.storyLink, bookImgPath));
            if(bookImgPath){ //so that only the table with the books is read & not anyother table(tr)
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
                 console.log(counter++, counter2, data.storyLink, booksReco);
                resolve(booksReco);
            }
        });
        
    })
})
}
