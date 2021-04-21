// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const chartAccountSchema = new mongoose.Schema({
  accountID: {
    type: String,
    uppercase: true
  },
  accountDescription: {
    type: Date,
    uppercase: true
  },
  accountType: {
    type: String,
    uppercase: true
  },
  format: {
    type: String,
    uppercase: true
  },
  concept: {
    type: String,
    uppercase: true
  },
  extraFormat: {
    type: String,
    uppercase: true
  },
  extraConcept: {
    type: String,
    uppercase: true
  },
  deductible: {
    type: String,
    uppercase: true
  },
  noDeductible: {
    type: String,
    uppercase: true
  },
  ivaDeductible: {
    type: String,
    uppercase: true
  },
  ivaNoDeductible: {
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

const ChartAccount = mongoose.model('ChartAccount', chartAccountSchema);
module.exports = ChartAccount;
