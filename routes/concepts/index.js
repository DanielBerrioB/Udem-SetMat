const express = require("express");
const router = express.Router();
const controller = require("./concepts.controller");
const { validateToken } = require("../../utils/auth");

router.post("/categories/createConcept", controller.createConcept);
router.get("/categories/getSubjects", controller.retrieveSubjects);
router.get("/categories/retrieveConcept/:subject", controller.retrieveConcept);
router.get("/categories/retrieveConcepts", controller.retrieveConcepts);

module.exports = router;
