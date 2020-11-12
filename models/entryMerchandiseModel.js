// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const entryMerchandiseSchema = new mongoose.Schema({
  state: {
    type: String
  },
  supplier: {
    type: String
  },
  supplierName: {
    type: String
  },
  productId: {
    type: String
  },
  productName: {
    type: String
  },
  entryMerchandiseId: {
    type: String
  },
  positionEntryMerchandiseId: {
    type: String
  },
  purchaseOrderId: {
    type: String
  },
  quantityBaseUnitMeasure: {
    type: String
  },
  quantity: {
    type: String
  },
  netValue: {
    type: String
  },
  netValueCompanyCurrency: {
    type: String
  },
  price: {
    type: String
  },
  priceUnit: {
    type: String
  }
});

const EntryMerchandise = mongoose.model(
  'EntryMerchandise',
  entryMerchandiseSchema
);
module.exports = EntryMerchandise;
