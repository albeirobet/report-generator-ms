// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  state: {
    type: String
  },
  supplier: {
    type: String
  },
  name: {
    type: String
  },
  address: {
    type: String
  },
  paymentConditions: {
    type: String
  },
  city: {
    type: String
  },
  email: {
    type: String
  },
  department: {
    type: String
  },
  bankName: {
    type: String
  },
  bankAccountNumber: {
    type: String
  },
  identificationType: {
    type: String
  },
  identificationNumber: {
    type: String
  },
  country: {
    type: String
  },
  counter: {
    type: String
  }
});

const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;
