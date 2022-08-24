const { TwitterApi } = require("twitter-api-v2");

var express = require("express");
var router = express.Router();

const userClient = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_API_KEY,
  appSecret: process.env.TWITTER_CONSUMER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

/* GET twitter trending topics */
router.get("/trends", async (req, res, next) => {
  const id = 1;
  const trends = await userClient.v1.trendsByPlace(id);
  res.send(trends);
});

/* GET twitter nearest WOEID given lat and long. */
router.get("/nearMe", async (req, res, next) => {
  const lat = Number(req.query.lat);
  const long = Number(req.query.lng);
  console.log(`${lat} ${long}`);
  const nearMe = await userClient.v1.trendsClosest(lat, long);
  res.send(nearMe);
});

/* GET twitter nearest WOEID given lat and long, then get trends topics. */
router.get("/trendsNearMe", async (req, res, next) => {
  const lat = Number(req.query.lat);
  const long = Number(req.query.lng);
  let nearMe, trends;
  let woied;
  try {
    nearMe = await userClient.v1.trendsClosest(lat, long);
    woeid = nearMe[0].woeid;

    trends = await userClient.v1.trendsByPlace(woeid);
    trends[0].trends = trends[0].trends.filter((trend) => {
      if (trend.tweet_volume === null) {
        return false;
      }
      return true;
    });
    trends[0].trends.sort((a, b) => (a.tweet_volume > b.tweet_volume ? -1 : 1));
    res.send({ nearMe, trends });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
