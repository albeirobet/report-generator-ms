// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const GeneralResponse = require('../../dto/commons/response/generalResponseDTO');
const authService = require('../../services/common/authService');
const httpCodes = require('../../utils/constants/httpCodes');
const generalResp = require('../../utils/responses/generalResp');

exports.protectPath = async (req, res, next) => {
  let codeHttp = httpCodes.OK;
  let generalResponse = new GeneralResponse();
  generalResponse.success = true;
  try {
    const data = await authService.protectPath(req, res);
    generalResponse = generalResp.generalSuccess(data);
  } catch (err) {
    generalResponse = generalResp.generalError(err);
    codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    generalResponse.apiError.codeHTTP = undefined;
  }
  if (codeHttp === httpCodes.OK) {
    next();
  } else {
    return res.status(codeHttp).json(generalResponse);
  }
};

exports.protectPathWithRoles = (...roles) => {
  return async (req, res, next) => {
    let codeHttp = httpCodes.OK;
    let generalResponse = new GeneralResponse();
    generalResponse.success = true;
    try {
      const data = await authService.protectPathWithRoles(req, res, roles);
      generalResponse = generalResp.generalSuccess(data);
    } catch (err) {
      generalResponse = generalResp.generalError(err);
      codeHttp = generalResponse.apiError.codeHTTP || httpCodes.BAD_REQUEST;
      generalResponse.apiError.codeHTTP = undefined;
    }
    if (codeHttp === httpCodes.OK) {
      next();
    } else {
      return res.status(codeHttp).json(generalResponse);
    }
  };
};
