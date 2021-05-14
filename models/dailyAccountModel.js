// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const dailyAccountSchema = new mongoose.Schema({
  //Asiento contable
  accountingSeat: {
    type: String,
    uppercase: true
  },
  //Cuenta de mayor
  seniorAccountantId: {
    type: String,
    uppercase: true
  },
  //Nombre Cuenta de mayor
  seniorAccountantName: {
    type: String,
    uppercase: true
  },
  //ID socio comercial
  businessPartnerID: {
    type: String,
    uppercase: true
  },
  // Nombre socio comercial
  businessPartnerName: {
    type: String,
    uppercase: true
  },

  //Importe en debe en moneda de empresa
  debtAmountCompanyCurrency: {
    type: String,
    uppercase: true
  },
  // Importe en haber en moneda de empresa
  creditAmountCompanyCurrency: {
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

const DailyAccount = mongoose.model('DailyAccount', dailyAccountSchema);
module.exports = DailyAccount;
