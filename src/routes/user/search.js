const express = require("express");
const router = express.Router();
const search = require("../../controllers/user/search");

router.post("/search", search.Search);
router.get("/search-filters", search.getFilters);

module.exports = router;
