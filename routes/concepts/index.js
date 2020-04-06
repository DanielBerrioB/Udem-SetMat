const express = require("express");
const router = express.Router();
const controller = require("./concepts.controller");
const { validateToken } = require("../../utils/auth");

router.post(
  "/categories/createConcept",
  validateToken,
  controller.createConcept
);
router.get(
  "/categories/getSubjects",
  validateToken,
  controller.retrieveSubjects
);
router.get(
  "/categories/retrieveConcept/:subject",
  validateToken,
  controller.retrieveConcept
);
router.get(
  "/categories/retrieveConcepts",
  validateToken,
  controller.retrieveConcepts
);

module.exports = router;
