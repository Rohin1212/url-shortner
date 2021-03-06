const shortid = require("shortid");
const isURL = require("isurl");
const catchAsync = require("express-async-handler");
const Url = require("./../models/url");

exports.redirectToLongUrl = catchAsync(async (req, res, next) => {
  const urlId = req.params.id;
  const url = (await Url.findOne({ where: { urlId } })).dataValues;
  if (!url) {
    res.status(404);
    return next(new Error("No short URL found for this long URL"));
  }
  res.redirect(url.longUrl);
  await Url.increment("clickCount", { where: { urlId } });
});

exports.getUrl = catchAsync(async (req, res, next) => {
  const url = (await Url.findOne({ where: { urlId: req.params.id } }))
    .dataValues;
  if (!url) {
    res.status(404);
    return next(new Error("No short URL found for this long URL"));
  }
  res.status(200).json({
    status: "success",
    data: {
      url,
    },
  });
});

exports.createShortUrl = catchAsync(async (req, res, next) => {
  const { longUrl } = req.body;
  console.log(req.body);
  try {
    const _ = new URL(longUrl);
  } catch (error) {
    res.status(400);
    return next(new Error("Invalid URL, Please enter another one."));
  }

  const url = (
    await Url.findOrCreate({
      where: {
        longUrl,
      },
      defaults: {
        urlId: shortid.generate(),
      },
    })
  )[0].dataValues;

  res.status(201).json({
    message: "success",
    shortUrl: `${req.get("host")}${req.originalUrl}${url.urlId}`,
  });
});
