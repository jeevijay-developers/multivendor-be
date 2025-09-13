const express = require("express");
const router = express.Router();
const Attribute = require("../../controllers/user/attribute");

router.get("/attributes", Attribute.getAttributes);
router.get("/attributes/:id", Attribute.getAttributeById);

module.exports = router;
