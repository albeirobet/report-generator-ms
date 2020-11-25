// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const GeneralResponse = require('../dto/commons/response/generalResponseDTO');
const reportEnableService = require('../services/reportEnableService');
const httpCodes = require('../utils/constants/httpCodes');
const generalResp = require('../utils/responses/generalResp');

exports.createReport = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await reportEnableService.createReport(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.getReport = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await reportEnableService.getReport(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.getReportByCode = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await reportEnableService.getReportByCode(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.getAllAllReports = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await reportEnableService.getAllAllReports(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.getAllAllReportsByType = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await reportEnableService.getAllAllReportsByType(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};
