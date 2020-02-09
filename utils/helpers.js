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

module.exports = { routeDoNotExist, isThereAnyConnection };
