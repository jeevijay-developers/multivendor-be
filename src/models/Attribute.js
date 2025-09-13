const mongoose = require("mongoose");

const AttributeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  values: {
    type: [String], // values is an array of strings
    required: true,
  },
});

const Attribute = mongoose.model("Attribute", AttributeSchema);

module.exports = Attribute;
