// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  state: {
    type: String
  },
  client: {
    type: String
  },
  name: {
    type: String
  },
  address: {
    type: String
  },
  city: {
    type: String
  },
  email: {
    type: String
  },
  department: {
    type: String
  },
  identificationType: {
    type: String
  },
  identificationNumber: {
    type: String
  },
  country: {
    type: String
  }
});

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;
