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
const ReportEnable = require('../models/reportEnableModel');
const customValidator = require('../utils/validators/validator');
const httpCodes = require('../utils/constants/httpCodes');

// =========== Function to register a new user
exports.createReport = async (req, res) => {
  try {
    // Validate request
    customValidator.validateNotNullRequest(req);
    const report = await ReportEnable.create(req.body);
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
  const data = await ReportEnable.findById(req.params.id);
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

exports.getReportByCode = async (req, res) => {
  //customValidator.validateNotNullRequest(req);
  customValidator.validateNotNullParameter(req.params.code);
  const data = await ReportEnable.findOne({ code: req.params.code });
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
  const data = await ReportEnable.find();
  return data;
};

exports.getAllAllReportsByType = async (req, res) => {
  const data = await ReportEnable.findById(req.params.type);
  return data;
};
