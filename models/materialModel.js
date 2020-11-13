// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  materialId: {
    type: String,
    uppercase: true
  },
  name: {
    type: String,
    uppercase: true
  },
  baseUnitMeasure: {
    type: String,
    uppercase: true
  },
  productCategory: {
    type: String,
    uppercase: true
  },
  type: {
    type: String,
    uppercase: true
  },
  createdAt: {
    type: String,
    uppercase: true
  },
  modifiedAt: {
    type: String,
    uppercase: true
  }
});

const Material = mongoose.model('Material', materialSchema);
module.exports = Material;
