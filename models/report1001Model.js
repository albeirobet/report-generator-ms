// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const report1001Schema = new mongoose.Schema({
  seniorAccountantId: {
    type: String,
    uppercase: true
  },
  invoiceIdGenerated: {
    type: String,
    uppercase: true
  },
  externalReferenceId: {
    type: String,
    uppercase: true
  },
  concepto: {
    type: String,
    uppercase: true
  },
  tipoDocumento: {
    type: Date,
    uppercase: true
  },
  nroIdentificacion: {
    type: String,
    uppercase: true
  },
  primerApellido: {
    type: String,
    uppercase: true
  },
  segundoApellido: {
    type: String,
    uppercase: true
  },
  primerNombre: {
    type: String,
    uppercase: true
  },
  segundoNombre: {
    type: String,
    uppercase: true
  },
  razonSocial: {
    type: String,
    uppercase: true
  },
  direccion: {
    type: String,
    uppercase: true
  },

  codigoDepto: {
    type: String,
    uppercase: true
  },
  codigoMpo: {
    type: String,
    uppercase: true
  },
  paisResidencia: {
    type: String,
    uppercase: true
  },
  pagoDeducible: {
    type: String,
    uppercase: true
  },
  pagoNoDeducible: {
    type: String,
    uppercase: true
  },
  ivaDeducible: {
    type: String,
    uppercase: true
  },
  ivaNoDeducible: {
    type: String,
    uppercase: true
  },
  retencionFuentePracticada: {
    type: String,
    uppercase: true
  },
  retencionFuenteAsumida: {
    type: String,
    uppercase: true
  },
  retencionFuenteIvaRegimenComun: {
    type: String,
    uppercase: true
  },
  retencionFuenteIvaNoDomiciliados: {
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

const Report1001 = mongoose.model('Report1001', report1001Schema);
module.exports = Report1001;
