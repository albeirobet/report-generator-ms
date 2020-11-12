// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const masterReportSchema = new mongoose.Schema({
  //Cuenta de mayor
  seniorAccountantId: {
    type: String
  },
  seniorAccountantName: {
    type: String
  },
  postingDate: {
    type: String
  },
  //Asiento contable
  accountingSeat: {
    type: String
  },
  externalReferenceId: {
    type: String
  },
  //Tipo de Asiento contable
  accountingSeatType: {
    type: String
  },
  //Asiento contable anulado
  accountingSeatAnnulled: {
    type: String
  },
  originalDocumentId: {
    type: String
  },
  //Asiento contable de anulación
  accountingSeatAnnulment: {
    type: String
  },
  extraOriginalDocumentId: {
    type: String
  },
  //Importe en debe en moneda de empresa
  debtAmountCompanyCurrency: {
    type: String
  },
  // Importe en haber en moneda de empresa
  creditAmountCompanyCurrency: {
    type: String
  }
});

const MasterReport = mongoose.model('MasterReport', masterReportSchema);
module.exports = MasterReport;
