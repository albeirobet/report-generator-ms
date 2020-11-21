// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const entryMerchandiseExtraSchema = new mongoose.Schema({
  entryMerchandiseState: {
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
  entryMerchandiseId: {
    type: String,
    uppercase: true
  },
  purchaseOrderId: {
    type: String,
    uppercase: true
  },
  quantity: {
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

const EntryMerchandiseExtra = mongoose.model(
  'EntryMerchandiseExtra',
  entryMerchandiseExtraSchema
);
module.exports = EntryMerchandiseExtra;
