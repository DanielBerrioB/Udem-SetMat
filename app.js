const express = require("express");
const app = express();

const setUpRoutes = require("./routes");
const setUpExpress = require("./config/express.config");
const { routeDoNotExist } = require("./helpers");

setUpExpress(app);
setUpRoutes(app);
app.use(routeDoNotExist);

module.exports = app;
