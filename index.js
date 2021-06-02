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
  
//TODO: Make this work 
T.get('search/tweets', { q: 'DOGE since:2021-06-01 ', result_type: "popular", count: 5 }, function(err, data, response) {
    console.log(data)
    for (let i = 0; i < data.statuses.length; i++){
        let dt = data.statuses[i];
        console.log("--- " + dt.text + "\n");
    }
})

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/:coins", (req, res) => {

    let coins = !req.params.coins ? "SHIB,DOGE,ADA" : req.params.coins;


    axios.get(`https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_API}&convert=EUR&per-page=${coins.split(',').length}&page=1&interval=1h,1d,7d&ids=${coins}`).then((response) => {

        if (response.status == 200) {

            let datas = response.data;
            let priceData = [];
            console.log(datas)

            for (let i = 0; i < datas.length; i++) {
                let data = datas[i];
                priceData[i] = new Object();
                console.log(data)


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

app.listen(3000, () => { console.log("server started") });