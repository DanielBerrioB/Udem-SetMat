const express = require("express");
const router = express.Router();
const controller = require("./concepts.controller");
const { validateToken } = require("../../utils/auth");

router.post("/categories/createConcept", controller.createConcept);
router.get("/categories/retrieveConcept/:concept", controller.retrieveConcept);
router.get("/categories/retrieveConcepts", controller.retrieveConcepts);

module.exports = router;
