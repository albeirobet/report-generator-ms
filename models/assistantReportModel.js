// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const assistanReportSchema = new mongoose.Schema({
  invoiceId: {
    type: String,
    uppercase: true
  },
  invoiceDate: {
    type: Date,
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
  // ID de pedido de compra
  purchaseOrderId: {
    type: String,
    uppercase: true
  },
  supplierCoName: {
    type: String,
    uppercase: true
  },
  supplierCoId: {
    type: String,
    uppercase: true
  },
  refundCo: {
    type: String,
    uppercase: true
  },
  // ID de documento externo
  externalDocumentId: {
    type: String,
    uppercase: true
  },
  // Posición de factura
  invoicePosition: {
    type: String,
    uppercase: true
  },
  originalPosition: {
    type: String,
    uppercase: true
  },
  counter: {
    type: String,
    uppercase: true
  },
  //Valor bruto en moneda de empresa en fecha de contabilización
  grossAmountCompanyCurrency: {
    type: String,
    uppercase: true
  },
  //Valor neto en moneda de empresa en fecha de contabilización
  netAmountCompanyCurrency: {
    type: String,
    uppercase: true
  },
  //Importe bruto
  grossValue: {
    type: String,
    uppercase: true
  },
  //Importe bruto en moneda de empresa
  netValue: {
    type: String,
    uppercase: true
  },
  //Cantidad
  quantity: {
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

assistanReportSchema.index({ companyId: +1, entryMerchandiseId: +1 });
assistanReportSchema.index({ companyId: +1 });
assistanReportSchema.index({ entryMerchandiseId: +1 });
assistanReportSchema.index({ invoiceId: +1 });
const AssistantReport = mongoose.model('AssistantReport', assistanReportSchema);
AssistantReport.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = AssistantReport;
