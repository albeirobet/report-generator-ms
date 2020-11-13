// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const invoiceSupplierSchema = new mongoose.Schema({
  state: {
    type: String,
    uppercase: true
  },
  documentId: {
    type: String,
    uppercase: true
  },
  externalDocumentId: {
    type: String,
    uppercase: true
  },
  documentDate: {
    type: String,
    uppercase: true
  },
  expirationDate: {
    type: String,
    uppercase: true
  },
  invoiceAmount: {
    type: String,
    uppercase: true
  },
  netAmount: {
    type: String,
    uppercase: true
  },
  taxAmount: {
    type: String,
    uppercase: true
  },
  grossAmount: {
    type: String,
    uppercase: true
  }
});

const InvoiceSupplier = mongoose.model(
  'InvoiceSupplier',
  invoiceSupplierSchema
);
module.exports = InvoiceSupplier;
