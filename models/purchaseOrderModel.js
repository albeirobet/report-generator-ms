// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  state: {
    type: String,
    uppercase: true
  },
  purchaseOrderId: {
    type: String,
    uppercase: true
  },
  documentId: {
    type: String,
    uppercase: true
  },
  documentType: {
    type: String,
    uppercase: true
  },
  invoiceDate: {
    type: String,
    uppercase: true
  },
  orderDate: {
    type: String,
    uppercase: true
  },
  requestedQuantity: {
    type: String,
    uppercase: true
  },
  deliveredQuantity: {
    type: String,
    uppercase: true
  },
  invoicedValue: {
    type: String,
    uppercase: true
  }
});

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
module.exports = PurchaseOrder;
