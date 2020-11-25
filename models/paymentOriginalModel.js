// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const pyamentOriginalSchema = new mongoose.Schema({
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
    type: Date,
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
  companyIdFile: {
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

pyamentOriginalSchema.index({ companyId: +1, documentId: +1 });
pyamentOriginalSchema.index({ companyId: +1 });
pyamentOriginalSchema.index({ documentId: +1 });

const PaymentOriginal = mongoose.model(
  'PaymentOriginal',
  pyamentOriginalSchema
);

PaymentOriginal.ensureIndexes(function(err) {
  if (err) console.log(err);
});

module.exports = PaymentOriginal;
