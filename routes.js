const registration = require("./routes/registration");
const subjects = require("./routes/subjects");
const concepts = require("./routes/concepts");
const room = require("./routes/room");
const teams = require("./routes/teams");

module.exports = app => {
  app.use(registration);
  app.use(subjects);
  app.use(concepts);
  app.use(room);
  app.use(teams);
};
