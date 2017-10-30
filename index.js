var Nightmare = require('nightmare');
var vo = require('vo');
var fs = require('fs');

const agent = "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36";
const regex = new RegExp('http:\/\/www.imdb.com\/title\/([^\/]*).*');
const item_selector = [
  '#main > div > div > div.lister-list > div',
  'div.lister-item-content > h3 > a',
  'div.lister-item-content > h3 > span.lister-item-year.text-muted.unbold'
];
const next_page_selector = '#main > div > div > div:nth-child(4) > div > a.lister-page-next.next-page'
const count = 1;

vo(run)((err,result) => {
  if(err) throw err;
});

function* run(){
  var nightmare = new Nightmare(),
      next_exists = true,
      data = [];

  //entry point of the nightmare
  yield nightmare
  .viewport(1000, 1000)
  .useragent(agent)
  .goto('http://www.imdb.com/search/title?genres=animation&sort=user_rating,desc&title_type=feature&num_votes=25000,&pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=2406822102&pf_rd_r=0V9HJ787DNY08SVCJ7M9&pf_rd_s=right-6&pf_rd_t=15506&pf_rd_i=top&ref_=chttp_gnr_3')
  .wait(item_selector[0]);

  do {
        //push items into a temp list
        var temp = []
        temp.push(yield nightmare
            .evaluate(function(item_selector) {
                return Array.from(document.querySelectorAll(item_selector[0])).map(div => [div.querySelector(item_selector[1]).href, div.querySelector(item_selector[1]).text, div.querySelector(item_selector[2]).firstChild.nodeValue]);
            }, item_selector)
            .then((data) => {
                data = Array.from(data).map(item => [regex.exec(item[0])[1], item[1], item[2]])
                return Array.from(data);
            })
        );

        for (var i = 0; i < temp[0].length; i++) {
          data.push(temp[0][i]);
        }

        //go to next page
        yield nightmare
            .click(next_page_selector)
            .wait(item_selector[0]);

        //check if next_page_selector exists
        next_exists = yield nightmare.visible(next_page_selector);
    }while (next_exists);
    //print data
    console.log(data);
    save(data, 'animation1.txt');
    //end of the nightmare
    yield nightmare.end();
}

function save(data, filename){
  var file = fs.createWriteStream(filename);
  data.forEach((item) => {
    file.write(item.join('\t') + '\n')
  }, (error) => {
    file.end();
    console.log("File saved!");
  });
}


// var nightmare = new Nightmare()
//     .viewport(1000, 1000)
//     .useragent(agent)
//     .goto('http://www.imdb.com/search/title?genres=animation&sort=user_rating,desc&title_type=feature&num_votes=25000,&pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=2406822102&pf_rd_r=0V9HJ787DNY08SVCJ7M9&pf_rd_s=right-6&pf_rd_t=15506&pf_rd_i=top&ref_=chttp_gnr_3')
//     .wait(selector)
//     .evaluate((selector) => {
//       return Array.from(document.querySelectorAll(selector[0])).map(div => [div.querySelector(selector[1]).href, div.querySelector(selector[1]).text]);
//     }, selector)
//     .end()
//     .then((data) => {
//       data = Array.from(data).map(item => [regex.exec(item[0])[1], item[1]])
//       console.log(Array.from(data));
//     })
//     .catch((error) => {
//       console.error('Search failed:', error);
//     });
