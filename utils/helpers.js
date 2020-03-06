const { DBName, client } = require("../config/mongo.config");

/**
 * This function checks if the current route exists, otherwise
 * it shows a message on the screen
 * @param {Object} req
 * @param {Object} res
 * @param {Object} next
 */
function routeDoNotExist(req, res, next) {
  res.status(404).send({
    message: "This route does not exist."
  });
  next();
}

/**
 * This function return true if the client is
 * valid, instead of that it returns false
 * @param {Object} client
 */
function isThereAnyConnection(client) {
  return client.topology
    ? client.topology.s.state === "connected"
      ? true
      : false
    : false;
}

/**
 * This function generates a unique code. Mostly is
 * use to create a room with an id.
 * @param {Int} length
 */
function generateRandomCode(length = 6) {
  let result = "";
  let characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function emitCodes(io) {
  client.connect(err => {
    if (err) throw err;
    const dataBase = client.db(DBName);
    dataBase
      .collection("concepts")
      .find()
      .toArray((err, items) => {
        if (err) throw err;
        items.forEach((el, i) => {
          let value = el;
          setTimeout(() => io.emit("dummy", value), 15000 * (i + 1));
        });
      });
  });
}

/**
 * This function acts like a count down
 * @param {Int} seconds
 */
function timer(seconds = 60) {
  var cont = seconds;
  var timer = setInterval(() => {
    socket.emit("timer", cont);
    socket.broadcast.emit("timer", cont);
    cont--;
  }, 1000);

  setTimeout(() => {
    clearInterval(timer);
  }, 62000);
}

module.exports = {
  routeDoNotExist,
  isThereAnyConnection,
  emitCodes,
  generateRandomCode,
  timer
};
