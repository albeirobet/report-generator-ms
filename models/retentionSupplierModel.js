// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const retentionSupplierSchema = new mongoose.Schema({
  company: {
    type: String
  },
  supplierId: {
    type: String
  },
  supplierName: {
    type: String
  },
  postingDate: {
    type: String
  },
  invoiceId: {
    type: String
  },
  invoicePosition: {
    type: String
  },
  amountCompanyCurrency: {
    type: String
  },
  reteFuentePercentage: {
    type: String
  },
  reteFuenteValue: {
    type: String
  },
  reteIcaPercentage: {
    type: String
  },
  reteIcaValue: {
    type: String
  },
  reteIvaPercentage: {
    type: String
  },
  reteIvaValue: {
    type: String
  }
});

const RetentionSupplier = mongoose.model(
  'RetentionSupplier',
  retentionSupplierSchema
);
module.exports = RetentionSupplier;
