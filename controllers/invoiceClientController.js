// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const GeneralResponse = require('../dto/commons/response/generalResponseDTO');
const invoiceClientService = require('../services/invoiceClientService');
const httpCodes = require('../utils/constants/httpCodes');
const generalResp = require('../utils/responses/generalResp');

exports.loadInvoiceClients = async (req, res) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await invoiceClientService.loadInvoiceClients(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    console.log(err);
    generalResponse = generalResp.generalError(err);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  return res.status(codeHttp).json(generalResponse);
};
