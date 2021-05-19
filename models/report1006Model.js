// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const report1006Schema = new mongoose.Schema({
  seniorAccountantId: {
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
  dv: {
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
  impuestoGenerado: {
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

const Report1006 = mongoose.model('Report1006', report1006Schema);
module.exports = Report1006;
