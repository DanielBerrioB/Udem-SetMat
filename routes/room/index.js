const express = require("express");
const router = express.Router();
const controller = require("./room.controller");
const { validateToken } = require("../../utils/auth");

router.post("/room/createRoom", validateToken, controller.createRoom);
router.get("/room/getRoom/:uniqueCode", validateToken, controller.getRoomInfo);
router.delete(
  "/room/deleteAllRecords",
  validateToken,
  controller.deleteAllRooms
);

module.exports = router;
