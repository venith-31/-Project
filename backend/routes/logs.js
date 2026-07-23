const express = require("express");
const router = express.Router();
const { bulkUpload, getLogs, getFacets } = require("../controllers/logController");

router.post("/bulk", bulkUpload);
router.get("/facets", getFacets);
router.get("/", getLogs);

module.exports = router;
