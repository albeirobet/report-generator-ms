// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const reportEnableSchema = new mongoose.Schema({
  name: {
    type: String,
    uppercase: true,
    required: [
      true,
      'Por favor ingrese el nombre del reporte, es un dato obligatorio. '
    ],
    unique: true
  },
  code: {
    type: String,
    uppercase: true,
    required: [
      true,
      'Por favor ingrese el código del reporte, es un dato obligatorio. '
    ],
    unique: true
  },
  state: {
    type: String,
    enum: ['ENABLED', 'DISABLED'],
    default: 'ENABLED',
    uppercase: true
  },
  message: {
    type: String,
    uppercase: true
  },
  instructions: {
    type: String,
    uppercase: true
  },
  type: {
    type: String,
    uppercase: true,
    enum: ['TEMPLATE', 'GENERATED_REPORT'],
    required: [
      true,
      'Por favor ingrese el tipo de reporte, es un dato obligatorio. [template, generated_report]'
    ]
  }
});

reportEnableSchema.index({ type: +1, code: +1 });

const ReportEnable = mongoose.model('ReportEnable', reportEnableSchema);
ReportEnable.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = ReportEnable;
