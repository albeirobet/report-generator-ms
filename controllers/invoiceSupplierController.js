// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const GeneralResponse = require('../dto/commons/response/generalResponseDTO');
const invoiceSupplier = require('../services/invoiceSupplierService');
const httpCodes = require('../utils/constants/httpCodes');
const generalResp = require('../utils/responses/generalResp');

exports.loadInvoiceSupplier = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await invoiceSupplier.loadInvoiceSupplier(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    console.log(err);
    generalResponse = generalResp.generalError(err);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.deleteInvoiceSupplier = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await invoiceSupplier.deleteInvoiceSupplier(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    console.log(err);
    generalResponse = generalResp.generalError(err);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.countInvoiceSupplier = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await invoiceSupplier.countInvoiceSupplier(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    console.log(err);
    generalResponse = generalResp.generalError(err);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.getInvoiceSupplier = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await invoiceSupplier.getInvoiceSupplier(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    console.log(err);
    generalResponse = generalResp.generalError(err);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};

exports.getAllInvoiceSuppliers = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await invoiceSupplier.getAllInvoiceSuppliers(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    console.log(err);
    generalResponse = generalResp.generalError(err);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};
