// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const GeneralResponse = require('../../dto/commons/response/generalResponseDTO');
const ApiError = require('../../dto/commons/response/apiErrorDTO');
const commonErrors = require('../constants/commonErrors');
const commonMessages = require('../../utils/constants/commonMessages');
const accessControlMessages = require('../constants/accessControlMessages');
const httpCodes = require('../constants/httpCodes');
const ServiceException = require('../errors/serviceException');

const generalResponse = new GeneralResponse();

// =====================================================================
// Function to create a common response from APIs when the process is successful
exports.generalSuccess = data => {
  generalResponse.apiError = undefined;
  generalResponse.success = true;
  generalResponse.data = data;
  generalResponse.message = commonMessages.SUCCESS_PROCESS;
  return generalResponse;
};

// =====================================================================
// Function to create a common response from APIs when the process fails
exports.generalError = error => {
  generalResponse.data = undefined;
  generalResponse.success = false;
  generalResponse.message = commonErrors.E_COMMON_01;

  // Catch ServiceException Errors
  if (error instanceof ServiceException) {
    generalResponse.message = commonErrors.E_COMMON_01;
    generalResponse.apiError = error.apiError;
    generalResponse.apiError.codeHTTP =
      error.apiError.codeHTTP || httpCodes.BAD_REQUEST;
    return generalResponse;
  }

  // ========== Catch JWT Errors
  if (error.name === 'JsonWebTokenError') {
    generalResponse.apiError = new ApiError(
      `${accessControlMessages.E_ACCESS_CONTROL_MS_08}`,
      `${accessControlMessages.E_ACCESS_CONTROL_MS_08}`,
      'E_ACCESS_CONTROL_MS_08',
      httpCodes.UNAUTHORIZED
    );
    return generalResponse;
  }

  // ========== Catch Mongo Duplicate Fields Errors
  if (error.code === 11000) {
    let value = '';
    if (Array.isArray(error.errmsg)) {
      value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    } else {
      value = error.errmsg;
    }

    generalResponse.apiError = new ApiError(
      `${commonErrors.EM_COMMON_07} ${value} ${commonErrors.EM_COMMON_08}`,
      `${commonErrors.EM_COMMON_07}`,
      'EM_COMMON_07',
      httpCodes.BAD_REQUEST
    );
    return generalResponse;
  }

  // ========== Catch Mongo Validation Errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(el => el.message);
    const message = `${commonErrors.EM_COMMON_09}: ${errors.join('')}`;
    generalResponse.apiError = new ApiError(
      `${message}`,
      `${commonErrors.EM_COMMON_09}`,
      'EM_COMMON_09',
      httpCodes.BAD_REQUEST
    );
    return generalResponse;
  }

  // ========== Catch Error By Default
  let userMessage;
  let developerMessage;
  if (error.name) {
    developerMessage = error.name;
  } else {
    developerMessage = commonErrors.EM_COMMON_06;
  }
  if (error.message) {
    userMessage = error.message;
  } else {
    developerMessage = commonErrors.EM_COMMON_06;
  }
  generalResponse.apiError = new ApiError(
    `${userMessage}`,
    `${developerMessage}`,
    'E_COMMON_00',
    httpCodes.BAD_REQUEST
  );
  return generalResponse;
};
