// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const assistanReportSchema = new mongoose.Schema({
  // ID de entrada de mercancías y servicios
  entryMerchandiseId: {
    type: String,
    uppercase: true
  },
  //ID de entrega entrante confirmada
  inboundDeliveryConfirmedId: {
    type: String,
    uppercase: true
  },
  invoiceId: {
    type: String,
    uppercase: true
  },
  // ID de pedido de compra
  purchaseOrderId: {
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
  counter: {
    type: String,
    uppercase: true
  },
  //Valor bruto en moneda de empresa en fecha de contabilización
  grossValueCompanyCurrencyPostingDate: {
    type: String,
    uppercase: true
  },
  //Valor neto en moneda de empresa en fecha de contabilización
  netValueCompanyCurrencyPostingDate: {
    type: String,
    uppercase: true
  },
  //Importe bruto
  grossValue: {
    type: String,
    uppercase: true
  },
  //Importe bruto en moneda de empresa
  grossValueCompanyCurrency: {
    type: String,
    uppercase: true
  },
  // Importe neto en moneda de empresa
  netValueCompanyCurrency: {
    type: String,
    uppercase: true
  },
  // Importe neto
  netValue: {
    type: String,
    uppercase: true
  }
});

const AssistantReport = mongoose.model('AssistantReport', assistanReportSchema);
module.exports = AssistantReport;
