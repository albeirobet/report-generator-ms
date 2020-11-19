// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const ivaSchema = new mongoose.Schema({
  //Cuenta de mayor (neta)
  mayorAccountNetId: {
    type: String,
    uppercase: true
  },
  //Nombre Cuenta de mayor (neta)
  mayorAccountNetName: {
    type: String,
    uppercase: true
  },
  //ID de asiento contable
  accountingSeatId: {
    type: String,
    uppercase: true
  },
  //ID de documento original
  originalDocumentId: {
    type: String,
    uppercase: true
  },
  //Tipo de documento original
  originalDocumentType: {
    type: String,
    uppercase: true
  },
  //Código de impuesto
  taxCode: {
    type: String,
    uppercase: true
  },
  //Tasa de impuesto
  taxRate: {
    type: String,
    uppercase: true
  },
  //Tipo de impuesto
  taxType: {
    type: String,
    uppercase: true
  },
  //Importe neto (moneda de empresa)
  netAmountCompanyCurrency: {
    type: String,
    uppercase: true
  },
  //Importe deducible (moneda de transacción)
  deductibleAmountTransactionCurrency: {
    type: String,
    uppercase: true
  },
  //Importe de impuesto interno (moneda de transacción)
  internalTaxAmountTransactionCurrency: {
    type: String,
    uppercase: true
  },
  //Importe neto (moneda de transacción)
  netAmountTransactionCurrency: {
    type: String,
    uppercase: true
  },
  //Importe de impuesto (moneda de transacción)
  taxAmountTransactionCurrency: {
    type: String,
    uppercase: true
  },
  //Importe base de impuesto (moneda de transacción)
  taxBaseAmountTransactionCurrency: {
    type: String,
    uppercase: true
  },
  //Importe de impuesto interno (moneda de declaración de impues
  internalTaxAmountTaxDlecarationCurrency: {
    type: String,
    uppercase: true
  },
  //Importe no deducible (moneda de transacción)
  noDeductibleAmountTransactionCurrency: {
    type: String,
    uppercase: true
  },
  //Contador
  counter: {
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

const Iva = mongoose.model('Iva', ivaSchema);
module.exports = Iva;
