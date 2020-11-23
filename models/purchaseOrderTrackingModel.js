// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const purchaseOrderTrackingSchema = new mongoose.Schema({
  supplierId: {
    type: String,
    uppercase: true
  },
  supplierName: {
    type: String,
    uppercase: true
  },
  purchaseOrderId: {
    type: String,
    uppercase: true
  },
  purchaseOrderDate: {
    type: Date,
    uppercase: true
  },
  requestedAmount: {
    type: String,
    uppercase: true
  },
  netPriceCompanyCurrency: {
    type: String,
    uppercase: true
  },
  deliveredQuantity: {
    type: String,
    uppercase: true
  },
  deliveredValue: {
    type: String,
    uppercase: true
  },
  deliveredValueCompanyCurrency: {
    type: String,
    uppercase: true
  },
  invoicedAmount: {
    type: String,
    uppercase: true
  },
  invoicedValue: {
    type: String,
    uppercase: true
  },
  invoicedValueCompanyCurrency: {
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

purchaseOrderTrackingSchema.index({ companyId: +1 });
purchaseOrderTrackingSchema.index({ purchaseOrderId: +1 });
const PurchaseOrderTracking = mongoose.model(
  'PurchaseOrderTracking',
  purchaseOrderTrackingSchema
);
module.exports = PurchaseOrderTracking;
