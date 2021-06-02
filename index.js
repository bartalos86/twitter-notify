const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const axios = require("axios").default;
require('dotenv').config();




const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {


    axios.get(`https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_API}&convert=EUR&per-page=1&page=1&interval=1h,1d,7d&ids=SHIB`).then((response) => {
    if(response.status == 200){

        let data= response.data[0];

        let priceData = new Object();

        priceData.color1h= data["1h"].market_cap_change_pct > 0 ? "green": "red";
        priceData.color1d= data["1d"].market_cap_change_pct > 0 ? "green": "red";
        priceData.color7d= data["7d"].market_cap_change_pct > 0 ? "green": "red";

        priceData.change1h = data["1h"].market_cap_change_pct * 100;
        priceData.change1d = data["1d"].market_cap_change_pct * 100;
        priceData.change7d = data["7d"].market_cap_change_pct * 100;
        console.log(data)
        res.render("index",{name: data.name, price: data.price, icon: data.logo_url, priceData});

    }

    });

//res.render("index");
});

app.listen(3000, () => { console.log("server started") });