"use strict";

import { Router } from "express";
import { getnew, getnews_list } from "../controllers/newsController";
const router = Router();
import Model from "../models/News_Subscribed";

//Data retrieval routes:
const user = {
  account_id: 371138,
  subscribe_stocks: [
    {
      ticker_symbol: "TSLA",
      name: "Tesla",
    },

    {
      ticker_symbol: "AAPL",
      name: "Apple",
    },
    {
      ticker_symbol: "GOOG",
      name: "Alphabet",
    },
    {
      ticker_symbol: "AFRM",
      name: "Affirm Holdings",
    },
  ],
};
const newsexample = [
  {
    source: {
      id: "engadget",
      name: "Engadget",
    },
    author: "Kris Holt",
    title: "NHTSA opens Tesla probe over Model Y steering wheel detachments",
    description:
      "The National Highway Traffic Safety Administration (NHTSA\r\n) has opened an investigation into Tesla\r\n following reports of steering wheels falling off while on the road. The agency said it's aware of two reports of the wheel completely detaching from the stee…",
    url: "https://www.engadget.com/nhtsa-opens-tesla-probe-over-model-y-steering-wheel-detachments-153153318.html",
    urlToImage:
      "https://s.yimg.com/uu/api/res/1.2/96unDkR3YHD8w5teLTzxbw--~B/Zmk9ZmlsbDtoPTYzMDtweW9mZj0wO3c9MTIwMDthcHBpZD15dGFjaHlvbg--/https://media-mbst-pub-ue1.s3.amazonaws.com/creatr-uploaded-images/2023-03/b5fb2c10-bdc4-11ed-a7ef-769dcf2914b6.cf.jpg",
    publishedAt: "2023-03-08T15:31:53Z",
    content:
      "The National Highway Traffic Safety Administration (NHTSA\r\n) has opened an investigation into Tesla\r\n following reports of steering wheels falling off while on the road. The agency said it's aware of… [+2005 chars]",
    ticker_symbol: "TSLA",
  },
  {
    source: {
      id: "engadget",
      name: "Engadget",
    },
    author: "Jon Fingas",
    title: "8BitDo controllers now work with Apple devices",
    description:
      "You no longer need to pass on 8BitDo's gamepads if you use Apple products. 8BitDo has confirmed that its controllers now officially support iPhones, iPads and Macs thanks to both firmware upgrades and Apple's recent iOS 16.3, iPadOS 16.3, tvOS 16.3 and macOS …",
    url: "https://www.engadget.com/8bitdo-controllers-now-work-with-apple-devices-163657954.html",
    urlToImage:
      "https://s.yimg.com/uu/api/res/1.2/ekLqo_VW4Z9CPYD1CjRT2A--~B/Zmk9ZmlsbDtoPTYzMDtweW9mZj0wO3c9MTIwMDthcHBpZD15dGFjaHlvbg--/https://media-mbst-pub-ue1.s3.amazonaws.com/creatr-uploaded-images/2023-03/b7e1d4c0-c738-11ed-bbf0-5c28c6d322eb.cf.jpg",
    publishedAt: "2023-03-20T16:36:57Z",
    content:
      "You no longer need to pass on 8BitDo's gamepads if you use Apple products. 8BitDo has confirmed that its controllers now officially support iPhones, iPads and Macs thanks to both firmware upgrades an… [+1007 chars]",
    ticker_symbol: "AAPL",
  },
];
//Route to get nasdaq data for 4
router.get("/", async function (req, res) {
  await getnew("Nasdaq", 4)
    .then((docs) => {
      res.send(docs);
    })
    .catch((err) => {
      console.error(err);
    });
});
//Route to get user subscribed news list
router.get("/user/:id", async function (req, res) {
  try {
    const subscribes = await Model.findOne({ account_id: req.params.id });
    var list = subscribes.subscribe_stocks;
    await getnews_list(list.slice(0, 4))
      .then((docs) => {
        var subscription = docs;
        for (var i = 0; i < subscription.length; i++) {
          subscription[i].ticker_symbol = list[i].ticker_symbol;
        }
        res.send(subscription);
      })
      .catch((err) => {
        res.send(newsexample);
      });
    
  } catch (error) {
    console.log(error);
  }
});
// router.get("/deatil/:id", async function (req, res) {

// });

export default router;