// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const invoiceClientSchema = new mongoose.Schema({
  clientName: {
    type: String,
    uppercase: true
  },
  clientId: {
    type: String,
    uppercase: true
  },
  invoiceId: {
    type: String,
    uppercase: true
  },
  invoiceDate: {
    type: String,
    uppercase: true
  },
  grossValueInvoice: {
    type: String,
    uppercase: true
  },
  netValueInvoice: {
    type: String,
    uppercase: true
  },
  tax: {
    type: String,
    uppercase: true
  },
  netInvoicedValue: {
    type: String,
    uppercase: true
  }
});

const InvoiceClient = mongoose.model('InvoiceClient', invoiceClientSchema);
module.exports = InvoiceClient;
