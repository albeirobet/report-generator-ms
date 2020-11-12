// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const invoiceClientSchema = new mongoose.Schema({
  clientName: {
    type: String
  },
  clientId: {
    type: String
  },
  invoiceId: {
    type: String
  },
  invoiceDate: {
    type: String
  },
  grossValueInvoice: {
    type: String
  },
  netValueInvoice: {
    type: String
  },
  tax: {
    type: String
  },
  netInvoicedValue: {
    type: String
  }
});

const InvoiceClient = mongoose.model('InvoiceClient', invoiceClientSchema);
module.exports = InvoiceClient;
