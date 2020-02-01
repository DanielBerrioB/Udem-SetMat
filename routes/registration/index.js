const express = require("express");
const router = express.Router();
const controller = require("./registration.controller");

router.get("/", controller.logIn);

module.exports = router;
