const express = require("express");
const router = express.Router();
const controller = require("./room.controller");
const { validateToken } = require("../../utils/auth");

router.post("/room/createRoom", controller.createRoom);

module.exports = router;
