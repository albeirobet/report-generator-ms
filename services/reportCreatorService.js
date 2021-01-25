/* eslint-disable no-restricted-syntax */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-continue */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');
const ApiError = require('../dto/commons/response/apiErrorDTO');
const ServiceException = require('../utils/errors/serviceException');
const commonErrors = require('../utils/constants/commonErrors');
const ReportCreator = require('../models/reportCreatorModel');
const customValidator = require('../utils/validators/validator');
const httpCodes = require('../utils/constants/httpCodes');
const entryMerchandiseAndServicesReportService = require('./entryMerchandiseAndServicesReportService');
const userService = require('./userService');
const ReportDownloader = require('../models/reportDownloaderModel');
const EntryMerchandiseAndServicesReportReport = require('../models/entryMerchandiseAndServicesReportReportModel');

// =========== Function to
exports.generateEntryMerchandiseAndServicesReport = async (req, res) => {
  try {
    entryMerchandiseAndServicesReportService.generateInMemory(req, res);
    return 'El reporte está siendo generado. Por favor validar su estado';
  } catch (error) {
    throw error;
  }
};

// =========== Function to
exports.downloadEntryMerchandiseAndServicesReport = async (req, res) => {
  try {
    entryMerchandiseAndServicesReportService.sendReportCSV(req, res);
    return 'El reporte está siendo generado para enviarlo a su correo electrónico. Por favor validar su estado';
  } catch (error) {
    throw error;
  }
};

exports.deleteEntryMerchandiseAndServicesReport = async (req, res) => {
  try {
    const response = await entryMerchandiseAndServicesReportService.deleteEntryMerchandiseAndServicesReport(
      req,
      res
    );
    return response;
  } catch (error) {
    throw error;
  }
};
// =========== Function to register a new user
exports.createReport = async (req, res) => {
  try {
    customValidator.validateNotNullRequest(req);
    let report = await ReportCreator.insertMany(req.body);
    report = await ReportDownloader.insertMany(req.body);
    return report;
  } catch (error) {
    throw error;
  }
};

// =========== Function to get a specific
exports.getReport = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ServiceException(
      commonErrors.E_COMMON_01,
      new ApiError(
        `${commonErrors.EM_COMMON_10}`,
        `${commonErrors.EM_COMMON_10}`,
        'EM_COMMON_10',
        httpCodes.BAD_REQUEST
      )
    );
  }
  const data = await ReportCreator.findById(req.params.id);
  // CompanyData.findOne({ _id: req.params.id })
  if (!data) {
    throw new ServiceException(
      commonErrors.E_COMMON_01,
      new ApiError(
        `${commonErrors.EM_COMMON_11}`,
        `${commonErrors.EM_COMMON_11}`,
        'EM_COMMON_11',
        httpCodes.BAD_REQUEST
      )
    );
  }
  return data;
};

exports.getAllAllReports = async (req, res) => {
  const userInfo = await userService.getUserInfo(req, res);
  const data = await ReportCreator.find({
    companyId: userInfo.companyId
  });
  return data;
};

exports.deleteReport = async (req, res) => {
  try {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < req.body.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      let deleted = await ReportCreator.deleteMany({
        code: req.body[i].code,
        companyId: req.body[i].companyId
      });
      // eslint-disable-next-line no-await-in-loop
      deleted = await ReportDownloader.deleteMany({
        code: req.body[i].code,
        companyId: req.body[i].companyId
      });
      if (req.body[i].code === 'EMEGR') {
        // eslint-disable-next-line no-await-in-loop
        await EntryMerchandiseAndServicesReportReport.deleteMany({
          companyId: req.body[i].companyId
        });
      }
      console.log(deleted);
    }
    return true;
  } catch (err) {
    throw err;
  }
};
