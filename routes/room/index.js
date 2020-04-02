const express = require("express");
const router = express.Router();
const controller = require("./room.controller");
const { validateToken } = require("../../utils/auth");

router.post("/room/createRoom", controller.createRoom);
router.get("/room/getRoom/:uniqueCode", controller.getRoomInfo);
router.delete("/room/deleteAllRecords", controller.deleteAllRooms);

module.exports = router;
