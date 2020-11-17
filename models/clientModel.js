// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  state: {
    type: String,
    uppercase: true
  },
  client: {
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
  city: {
    type: String,
    uppercase: true
  },
  email: {
    type: String,
    uppercase: true
  },
  department: {
    type: String,
    uppercase: true
  },
  identificationType: {
    type: String,
    uppercase: true
  },
  identificationNumber: {
    type: String,
    uppercase: true
  },
  country: {
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

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;
