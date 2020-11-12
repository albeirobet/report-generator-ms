// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const pyamentSupplierSchema = new mongoose.Schema({
  state: {
    type: String
  },
  documentId: {
    type: String
  },
  externalReferenceId: {
    type: String
  },
  createdAt: {
    type: String
  },
  pyamentMethod: {
    type: String
  },
  businessPartnerName: {
    type: String
  },
  bankAccountId: {
    type: String
  },
  minorExpensesId: {
    type: String
  },
  paymentAmount: {
    type: String
  },
  companyId: {
    type: String
  }
});

const PaymentSupplier = mongoose.model(
  'PaymentSupplier',
  pyamentSupplierSchema
);
module.exports = PaymentSupplier;
