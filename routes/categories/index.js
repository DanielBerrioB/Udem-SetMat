const express = require("express");
const router = express.Router();
const controller = require("./categories.controller");
const { validateToken } = require("../../utils/auth");

router.post("/categories/createCategory", controller.createCategories);
router.get("/categories/retrieveCategory/:name", controller.retrieveCategory);
router.get("/categories/retrieveCategories", controller.retrieveCategories);

module.exports = router;
