// Created By Eyder Ascuntar
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');

const reportDownloaderSchema = new mongoose.Schema({
  name: {
    type: String,
    uppercase: true,
    required: [
      true,
      'Por favor ingrese el nombre del reporte, es un dato obligatorio. '
    ]
  },
  code: {
    type: String,
    uppercase: true,
    required: [
      true,
      'Por favor ingrese el código del reporte, es un dato obligatorio. '
    ]
  },
  counterRows: {
    type: Number,
    uppercase: true
  },
  state: {
    type: String,
    uppercase: true
  },
  percentageCompletition: {
    type: Number,
    uppercase: true
  },
  message: {
    type: String,
    uppercase: true
  },
  startDate: {
    type: String,
    uppercase: true
  },
  endDate: {
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
  generatorUserId: {
    type: String
  }
});

reportDownloaderSchema.index({ companyId: +1, code: +1 });

const ReportDownloader = mongoose.model(
  'ReportDownloader',
  reportDownloaderSchema
);
ReportDownloader.ensureIndexes(function(err) {
  if (err) console.log(err);
});
module.exports = ReportDownloader;
