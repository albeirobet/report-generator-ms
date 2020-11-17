// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const masterReportSchema = new mongoose.Schema({
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
  originalDocumentId: {
    type: String,
    uppercase: true
  },
  //Asiento contable de anulación
  accountingSeatAnnulment: {
    type: String,
    uppercase: true
  },
  extraOriginalDocumentId: {
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

const MasterReport = mongoose.model('MasterReport', masterReportSchema);
module.exports = MasterReport;
