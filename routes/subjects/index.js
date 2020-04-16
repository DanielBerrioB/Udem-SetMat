const express = require("express");
const router = express.Router();
const controller = require("./subjects.controller");
const { validateToken } = require("../../utils/auth");

router.post(
  "/subjects/createSubject",
  validateToken,
  controller.createSubjects
);
router.get(
  "/subjects/getAllSubjects",
  validateToken,
  controller.getAllSubjects
);

module.exports = router;
