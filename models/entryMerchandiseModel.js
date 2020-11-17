// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const entryMerchandiseSchema = new mongoose.Schema({
  state: {
    type: String,
    uppercase: true
  },
  supplier: {
    type: String,
    uppercase: true
  },
  supplierName: {
    type: String,
    uppercase: true
  },
  productId: {
    type: String,
    uppercase: true
  },
  productName: {
    type: String,
    uppercase: true
  },
  entryMerchandiseId: {
    type: String,
    uppercase: true
  },
  positionEntryMerchandiseId: {
    type: String,
    uppercase: true
  },
  purchaseOrderId: {
    type: String,
    uppercase: true
  },
  quantityBaseUnitMeasure: {
    type: String,
    uppercase: true
  },
  quantity: {
    type: String,
    uppercase: true
  },
  netValue: {
    type: String,
    uppercase: true
  },
  netValueCompanyCurrency: {
    type: String,
    uppercase: true
  },
  price: {
    type: String,
    uppercase: true
  },
  priceUnit: {
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

const EntryMerchandise = mongoose.model(
  'EntryMerchandise',
  entryMerchandiseSchema
);
module.exports = EntryMerchandise;
