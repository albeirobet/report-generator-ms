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
    type: Date,
    uppercase: true
  },
  expirationDate: {
    type: Date,
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

const InvoiceSupplier = mongoose.model(
  'InvoiceSupplier',
  invoiceSupplierSchema
);
module.exports = InvoiceSupplier;
