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
  },
  companyId: {
    type: String,
    required: [
      true,
      'Por favor ingrese el ID de la compania, es un dato obligatorio. '
    ]
  },
  userId: {
    type: String,
    required: [
      true,
      'Por favor ingrese el ID del Usuario, es un dato obligatorio. '
    ]
  }
});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
