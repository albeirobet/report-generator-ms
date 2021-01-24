// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const GeneralResponse = require('../dto/commons/response/generalResponseDTO');
const reportCreatorService = require('../services/reportCreatorService');
const httpCodes = require('../utils/constants/httpCodes');
const generalResp = require('../utils/responses/generalResp');

exports.generateEntryMerchandiseAndServicesReport = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await reportCreatorService.generateEntryMerchandiseAndServicesReport(
      req,
      res
    );
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.downloadEntryMerchandiseAndServicesReport = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    return await reportCreatorService.downloadEntryMerchandiseAndServicesReport(
      req,
      res
    );
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
    return res.status(codeHttp).json(generalResponse);
  }
};

exports.createReport = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await reportCreatorService.createReport(req, res);
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
    const data = await reportCreatorService.getReport(req, res);
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
    const data = await reportCreatorService.getAllAllReports(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.deleteReport = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await reportCreatorService.deleteReport(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    console.error(generalResponse.apiError.messageUser);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};
