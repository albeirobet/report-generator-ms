// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const withholdingNotesSchema = new mongoose.Schema({
  invoiceID: {
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
  //ID de posición de entrega entrante confirmada
  confirmedInboundDeliveryID: {
    type: String,
    uppercase: true
  },
  //ID de pedido de compra
  purchaseOrderID: {
    type: String,
    uppercase: true
  },
  //Reembolso
  refund: {
    type: String,
    uppercase: true
  },
  //Proveedor
  extraSupplierID: {
    type: String,
    uppercase: true
  },
  //Nombre del proveedor
  extraSupplierName: {
    type: String,
    uppercase: true
  },
  //ID de documento externo
  externalDocumentID: {
    type: String,
    uppercase: true
  },
  //Posición Factura
  invoicePosition: {
    type: String,
    uppercase: true
  },
  //Contador
  counter: {
    type: String,
    uppercase: true
  },
  //Importe bruto en moneda de empresa
  grossAmountCompanyCurrency: {
    type: String,
    uppercase: true
  },
  //Importe neto en moneda de empresa
  netAmountCompanyCurrency: {
    type: String,
    uppercase: true
  },
  //Importe bruto
  grossValue: {
    type: String,
    uppercase: true
  },
  //Importe neto
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

const WithholdingNotes = mongoose.model(
  'WithholdingNotes',
  withholdingNotesSchema
);
module.exports = WithholdingNotes;
