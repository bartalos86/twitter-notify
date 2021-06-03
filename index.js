const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const axios = require("axios").default;
var Twit = require('twit')
require('dotenv').config();

var T = new Twit({
    consumer_key:         process.env.TWITTER_API,
    consumer_secret:      process.env.TWITTER_SECRET,
    access_token:         process.env.TWITTER_ACCESS_TOKEN,
    access_token_secret:  process.env.TWITTER_ACCESS_SECRET,
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL:            true,     // optional - requires SSL certificates to be valid.
})

const accountFollows = ["binance", "elonmusk", "CoinMarketCap", "ShibaSwap", "dogecoin", "Shibtoken", "coinbase", "CoinbasePro"]
  
function generateFollowsQuery(followAccounts) {
    let query = "(";
    for (let i = 0; i < followAccounts.length; i++){
        let account = followAccounts[i];

        if (i != followAccounts.length - 1) {
            query += "from:" + account + " OR ";
        } else {
            query += "from:" + account + ")"
        }

    }

    console.log(query)

    return query;
}

async function getNews() {

}

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/coins/:coins", (req, res) => {

    let coins = !req.params.coins ? "SHIB,DOGE,ADA" : req.params.coins;


    axios.get(`https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_API}&convert=EUR&per-page=${coins.split(',').length}&page=1&interval=1h,1d,7d&ids=${coins}`).then((response) => {

        if (response.status == 200) {

            let datas = response.data;
            let priceData = [];
    

            for (let i = 0; i < datas.length; i++) {
                let data = datas[i];
                priceData[i] = new Object();
            
                priceData[i].name = data.name;
                priceData[i].icon = data.logo_url;
                priceData[i].price = data.price;

                priceData[i].color1h = data["1h"].market_cap_change_pct > 0 ? "green" : "red";
                priceData[i].color1d = data["1d"].market_cap_change_pct > 0 ? "green" : "red";
                priceData[i].color7d = data["7d"].market_cap_change_pct > 0 ? "green" : "red";

                priceData[i].change1h = (data["1h"].market_cap_change_pct * 100).toFixed(2);
                priceData[i].change1d = (data["1d"].market_cap_change_pct * 100).toFixed(2);
                priceData[i].change7d = (data["7d"].market_cap_change_pct * 100).toFixed(2);


            }


            res.render("index", { priceData });

        }

    });

    //res.render("index");
});

app.get("/news", (req, res) => {

    let tweets = [];
    T.get('search/tweets', { q: `${generateFollowsQuery(accountFollows)} since:2021-05-31 `, result_type: "mixed", count: 10 }, function(err, data, response) {
        //console.log(data)
        for (let i = 0; i < data.statuses.length; i++){
            let dt = data.statuses[i];

            let tweet = {user: dt.user.screen_name, text: dt.text, retweets: dt.retweet_count, favourites: dt.favourite_count};

            if(i == 1)
            console.log(dt.entities)
            
        
            if (dt.entities.media) {
                tweet.imageContent = dt.entities.media[0].media_url;
               // console.log(dt.entities.media)
            }


            tweet.hashtags = dt.entities.hashtags;

            tweets.push(tweet);

        
            

           // console.log(dt.entities.hashtags)
           // console.log(`@${dt.user.screen_name}  ${dt.text} -- Retweets: ${dt.retweet_count}`);
        }

       // console.log(tweets);
        res.setHeader("Access-Control-Allow-Origin","*")
        res.send(tweets);
    })

 })

app.listen(3000, () => { console.log("server started") });