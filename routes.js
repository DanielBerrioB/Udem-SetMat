const registration = require("./routes/registration");
const categories = require("./routes/categories");
const concepts = require("./routes/concepts");

module.exports = app => {
  app.use(registration);
  app.use(categories);
  app.use(concepts);
};
