// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const invoiceSupplierSchema = new mongoose.Schema({
  state: {
    type: String
  },
  documentId: {
    type: String
  },
  externalDocumentId: {
    type: String
  },
  documentDate: {
    type: String
  },
  expirationDate: {
    type: String
  },
  invoiceAmount: {
    type: String
  },
  netAmount: {
    type: String
  },
  taxAmount: {
    type: String
  },
  grossAmount: {
    type: String
  }
});

const InvoiceSupplier = mongoose.model(
  'InvoiceSupplier',
  invoiceSupplierSchema
);
module.exports = InvoiceSupplier;
