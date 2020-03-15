const registration = require("./routes/registration");
const categories = require("./routes/categories");
const concepts = require("./routes/concepts");
const room = require("./routes/room");
const teams = require("./routes/teams");

module.exports = app => {
  app.use(registration);
  app.use(categories);
  app.use(concepts);
  app.use(room);
  app.use(teams);
};
