// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceId: {
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

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
