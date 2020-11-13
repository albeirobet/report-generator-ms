// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const pyamentSupplierSchema = new mongoose.Schema({
  state: {
    type: String,
    uppercase: true
  },
  documentId: {
    type: String,
    uppercase: true
  },
  externalReferenceId: {
    type: String,
    uppercase: true
  },
  createdAt: {
    type: String,
    uppercase: true
  },
  pyamentMethod: {
    type: String,
    uppercase: true
  },
  businessPartnerName: {
    type: String,
    uppercase: true
  },
  bankAccountId: {
    type: String,
    uppercase: true
  },
  minorExpensesId: {
    type: String,
    uppercase: true
  },
  paymentAmount: {
    type: String,
    uppercase: true
  },
  companyId: {
    type: String,
    uppercase: true
  }
});

const PaymentSupplier = mongoose.model(
  'PaymentSupplier',
  pyamentSupplierSchema
);
module.exports = PaymentSupplier;
