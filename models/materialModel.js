// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  materialId: {
    type: String
  },
  name: {
    type: String
  },
  baseUnitMeasure: {
    type: String
  },
  productCategory: {
    type: String
  },
  type: {
    type: String
  },
  createdAt: {
    type: String
  },
  modifiedAt: {
    type: String
  }
});

const Material = mongoose.model('Material', materialSchema);
module.exports = Material;
