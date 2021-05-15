// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const taxSaleSchema = new mongoose.Schema({
  identificationType: {
    type: String,
    uppercase: true
  },
  identificationNumber: {
    type: String,
    uppercase: true
  },
  name: {
    type: String,
    uppercase: true
  },
  tax: {
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

const TaxSale = mongoose.model('TaxSale', taxSaleSchema);
module.exports = TaxSale;
