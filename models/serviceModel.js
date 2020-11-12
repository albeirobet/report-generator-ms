// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceId: {
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

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
