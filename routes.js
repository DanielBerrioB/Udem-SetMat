const registration = require("./routes/registration");

module.exports = app => {
  app.use(registration);
};
