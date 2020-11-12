// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const assistanReportSchema = new mongoose.Schema({
  // ID de entrada de mercancías y servicios
  entryMerchandiseId: {
    type: String
  },
  //ID de entrega entrante confirmada
  inboundDeliveryConfirmedId: {
    type: String
  },
  invoiceId: {
    type: String
  },
  // ID de pedido de compra
  purchaseOrderId: {
    type: String
  },
  supplierId: {
    type: String
  },
  supplierName: {
    type: String
  },
  counter: {
    type: String
  },
  //Valor bruto en moneda de empresa en fecha de contabilización
  grossValueCompanyCurrencyPostingDate: {
    type: String
  },
  //Valor neto en moneda de empresa en fecha de contabilización
  netValueCompanyCurrencyPostingDate: {
    type: String
  },
  //Importe bruto
  grossValue: {
    type: String
  },
  //Importe bruto en moneda de empresa
  grossValueCompanyCurrency: {
    type: String
  },
  // Importe neto en moneda de empresa
  netValueCompanyCurrency: {
    type: String
  },
  // Importe neto
  netValue: {
    type: String
  }
});

const AssistantReport = mongoose.model('AssistantReport', assistanReportSchema);
module.exports = AssistantReport;
