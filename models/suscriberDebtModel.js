// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const suscriberDebtSchema = new mongoose.Schema({
  zone: {
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
  address: {
    type: String,
    uppercase: true
  },
  value: {
    type: String,
    uppercase: true
  },
  concept: {
    type: String,
    uppercase: true
  },
  format: {
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

const SuscriberDebt = mongoose.model('SuscriberDebt', suscriberDebtSchema);
module.exports = SuscriberDebt;
