const MongoClient = require("mongodb").MongoClient;
require("./dotenv.config");

module.exports = {
  client: MongoClient(process.env.MONGO_CONF, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }),
  DBName: process.env.DB_NAME
};
