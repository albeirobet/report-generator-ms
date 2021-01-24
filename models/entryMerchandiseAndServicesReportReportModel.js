// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const entryMerchandiseAndServiceReportSchema = new mongoose.Schema({
  //Cuenta de mayor
  seniorAccountantId: {
    type: String,
    uppercase: true
  },
  seniorAccountantName: {
    type: String,
    uppercase: true
  },
  postingDate: {
    type: String,
    uppercase: true
  },
  //Asiento contable
  accountingSeat: {
    type: String,
    uppercase: true
  },
  externalReferenceId: {
    type: String,
    uppercase: true
  },
  originalDocumentId: {
    type: String,
    uppercase: true
  },
  //Tipo de Asiento contable
  accountingSeatType: {
    type: String,
    uppercase: true
  },
  //Asiento contable anulado
  accountingSeatAnnulled: {
    type: String,
    uppercase: true
  },
  originalDocumentAnnulledId: {
    type: String,
    uppercase: true
  },
  //Asiento contable de anulación
  accountingSeatAnnulment: {
    type: String,
    uppercase: true
  },
  extraOriginalDocumentAnulledId: {
    type: String,
    uppercase: true
  },
  extraOriginalDocumentId: {
    type: String,
    uppercase: true
  },
  originalDocumentPosition: {
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

  // ========DESDE ESTE PUNTO LOS GENERADOS

  purchaseOrderIdGenerated: {
    type: String,
    uppercase: true
  },
  entryMerchandiseStateGenerated: {
    type: String,
    uppercase: true
  },
  requestedAmountGenerated: {
    type: String,
    uppercase: true
  },
  netPriceCompanyCurrencyGenerated: {
    type: String,
    uppercase: true
  },
  deliveredQuantityGenerated: {
    type: String,
    uppercase: true
  },
  deliveredValueGenerated: {
    type: String,
    uppercase: true
  },
  deliveredValueCompanyCurrencyGenerated: {
    type: String,
    uppercase: true
  },
  invoicedAmountGenerated: {
    type: String,
    uppercase: true
  },
  invoicedValueGenerated: {
    type: String,
    uppercase: true
  },
  invoicedValueCompanyCurrencyGenerated: {
    type: String,
    uppercase: true
  },
  balanceQuantityEntryMerchandiseQuantitiesGenerated: {
    type: String,
    uppercase: true
  },
  balanceQuantityEntryMerchandiseCurrenciesGenerated: {
    type: String,
    uppercase: true
  },

  invoiceIdGenerated: {
    type: String,
    uppercase: true
  },
  supplierIdGenerated: {
    type: String,
    uppercase: true
  },
  supplierNameGenerated: {
    type: String,
    uppercase: true
  },
  externalDocumentIdGenerated: {
    type: String,
    uppercase: true
  },
  entryMerchandiseIdGenerated: {
    type: String,
    uppercase: true
  },
  grossAmountCompanyCurrencyGenerated: {
    type: String,
    uppercase: true
  },
  netAmountCompanyCurrencyGenerated: {
    type: String,
    uppercase: true
  },
  quantityGenerated: {
    type: String,
    uppercase: true
  },
  documentIdGenerated: {
    type: String,
    uppercase: true
  },

  createdAtGenerated: {
    type: String,
    uppercase: true
  },

  pyamentMethodGenerated: {
    type: String,
    uppercase: true
  },

  businessPartnerNameGenerated: {
    type: String,
    uppercase: true
  },

  paymentAmountGenerated: {
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

entryMerchandiseAndServiceReportSchema.index({ companyId: +1 });
const EntryMerchandiseAndServiceReport = mongoose.model(
  'EntryMerchandiseAndServiceReport',
  entryMerchandiseAndServiceReportSchema
);
module.exports = EntryMerchandiseAndServiceReport;
