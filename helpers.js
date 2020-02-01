function routeDoNotExist(req, res, next) {
  res.status(404).send({
    message: "This route does not exist."
  });
  next();
}

module.exports = { routeDoNotExist };
