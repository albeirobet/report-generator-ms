// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const GeneralResponse = require('../../dto/commons/response/generalResponseDTO');
const httpCodes = require('../../utils/constants/httpCodes');
const commonErrors = require('../../utils/constants/commonErrors');
const ApiError = require('../../dto/commons/response/apiErrorDTO');

exports.notFound = async (req, res) => {
  let codeHttp;
  const generalResponse = new GeneralResponse();
  generalResponse.success = false;

  try {
    codeHttp = httpCodes.NOT_FOUND;
    generalResponse.message = commonErrors.E_COMMON_01;
    generalResponse.apiError = new ApiError(
      `${commonErrors.EM_COMMON_05} ${req.originalUrl}`,
      `${commonErrors.EM_COMMON_05} ${req.originalUrl}`,
      'EM_COMMON_05'
    );
  } catch (err) {
    codeHttp = httpCodes.INTERNAL_SERVER_ERROR;
    generalResponse.message = err.message;
  }
  return res.status(codeHttp).json(generalResponse);
};
