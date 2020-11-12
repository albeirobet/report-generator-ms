// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  state: {
    type: String
  },
  purchaseOrderId: {
    type: String
  },
  documentId: {
    type: String
  },
  documentType: {
    type: String
  },
  invoiceDate: {
    type: String
  },
  orderDate: {
    type: String
  },
  requestedQuantity: {
    type: String
  },
  deliveredQuantity: {
    type: String
  },
  invoicedValue: {
    type: String
  }
});

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
module.exports = PurchaseOrder;
