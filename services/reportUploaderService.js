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
const ReportUploader = require('../models/reportUploaderModel');
const customValidator = require('../utils/validators/validator');
const httpCodes = require('../utils/constants/httpCodes');
const userService = require('./userService');

// =========== Function to register a new user
exports.createReport = async (req, res) => {
  try {
    // Validate request
    customValidator.validateNotNullRequest(req);
    const report = await ReportUploader.insertMany(req.body);
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
  const data = await ReportUploader.findById(req.params.id);
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

// =========== Function to get all Invoice Clients with filters to the table
exports.getAllAllReports = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    const data = await ReportUploader.find({
      companyId: userInfo.companyId
    });
    return data;
  } catch (err) {
    throw err;
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await ReportUploader.deleteMany(req.body);
    return true;
  } catch (err) {
    throw err;
  }
};
