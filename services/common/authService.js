// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const ApiError = require('../../dto/commons/response/apiErrorDTO');
const ServiceException = require('../../utils/errors/serviceException');
const commonErrors = require('../../utils/constants/commonErrors');
const accessControlMessages = require('../../utils/constants/accessControlMessages');
const httpCodes = require('../../utils/constants/httpCodes');

// =========== Function to Protect Path with a valid JWT Token
exports.protectPath = async (req, res) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    throw new ServiceException(
      commonErrors.E_COMMON_01,
      new ApiError(
        `${accessControlMessages.E_ACCESS_CONTROL_MS_02}`,
        `${accessControlMessages.E_ACCESS_CONTROL_MS_02}`,
        'E_ACCESS_CONTROL_MS_02',
        httpCodes.UNAUTHORIZED
      )
    );
  }
  // 2) Verification token
  await promisify(jwt.verify)(token, process.env.JWT_SECRET);
};

// =========== Function to Protect Path with a valid JWT Token and Role Specific
exports.protectPathWithRoles = async (req, res, roles) => {
  // 5) Check if user have needed roles to perform this operation
  if (roles.length > 0) {
    // 1) Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      throw new ServiceException(
        commonErrors.E_COMMON_01,
        new ApiError(
          `${accessControlMessages.E_ACCESS_CONTROL_MS_02}`,
          `${accessControlMessages.E_ACCESS_CONTROL_MS_02}`,
          'E_ACCESS_CONTROL_MS_02',
          httpCodes.UNAUTHORIZED
        )
      );
    }
    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    let authorized = false;
    decoded.authorities.forEach(authority => {
      if (roles.includes(authority)) {
        authorized = true;
      }
    });
    if (!authorized) {
      throw new ServiceException(
        commonErrors.E_COMMON_01,
        new ApiError(
          `${accessControlMessages.E_ACCESS_CONTROL_MS_05}`,
          `${accessControlMessages.E_ACCESS_CONTROL_MS_05}`,
          'E_ACCESS_CONTROL_MS_02',
          httpCodes.FORBIDDEN
        )
      );
    }
  }
};
