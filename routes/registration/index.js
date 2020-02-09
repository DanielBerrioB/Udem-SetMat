const express = require("express");
const router = express.Router();
const controller = require("./registration.controller");

router.post("/user/logIn", controller.logIn);
router.post("/user/createUser", controller.createUser);

module.exports = router;
