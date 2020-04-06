const express = require("express");
const router = express.Router();
const controller = require("./teams.controller");
const { validateToken } = require("../../utils/auth");

router.get("/teams/getTeam/:code&:teamId", validateToken, controller.getTeam);

module.exports = router;
