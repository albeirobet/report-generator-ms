// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const retentionSupplierSchema = new mongoose.Schema({
  company: {
    type: String,
    uppercase: true
  },
  supplierId: {
    type: String,
    uppercase: true
  },
  supplierName: {
    type: String,
    uppercase: true
  },
  postingDate: {
    type: Date,
    uppercase: true
  },
  invoiceId: {
    type: String,
    uppercase: true
  },
  invoicePosition: {
    type: String,
    uppercase: true
  },
  amountCompanyCurrency: {
    type: String,
    uppercase: true
  },
  reteFuentePercentage: {
    type: String,
    uppercase: true
  },
  reteFuenteValue: {
    type: String,
    uppercase: true
  },
  reteIcaPercentage: {
    type: String,
    uppercase: true
  },
  reteIcaValue: {
    type: String,
    uppercase: true
  },
  reteIvaPercentage: {
    type: String,
    uppercase: true
  },
  reteIvaValue: {
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

const RetentionSupplier = mongoose.model(
  'RetentionSupplier',
  retentionSupplierSchema
);
module.exports = RetentionSupplier;
