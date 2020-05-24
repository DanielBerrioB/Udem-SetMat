const express = require("express");
const router = express.Router();
const controller = require("./registration.controller");
const { validateToken } = require("../../utils/auth");

router.post("/user/logIn", controller.logIn);
router.post("/user/createUser", controller.createUser);
router.post("/user/restorePassword", controller.restorePassword);
router.get("/user/getInfo/:id", validateToken, controller.getUserInfo);

module.exports = router;
