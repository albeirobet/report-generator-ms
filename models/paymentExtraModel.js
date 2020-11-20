// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const paymentExtraSchema = new mongoose.Schema({
  businessPartnerId: {
    type: String,
    uppercase: true
  },
  businessPartnerName: {
    type: String,
    uppercase: true
  },
  documentId: {
    type: String,
    uppercase: true
  },
  documentDate: {
    type: String,
    uppercase: true
  },
  documentType: {
    type: String,
    uppercase: true
  },
  originalDocumentId: {
    type: String,
    uppercase: true
  },
  originalDocumentType: {
    type: String,
    uppercase: true
  },
  postingDate: {
    type: String,
    uppercase: true
  },
  accountingSeatId: {
    type: String,
    uppercase: true
  },
  // Importe en moneda de empresa
  amountCompanyCurrency: {
    type: String,
    uppercase: true
  },
  // Importe en moneda de transacción
  amountTransactionCurrency: {
    type: String,
    uppercase: true
  },
  counter: {
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

const PaymentExtra = mongoose.model('PaymentExtra', paymentExtraSchema);
module.exports = PaymentExtra;
