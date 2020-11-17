const axios = require('axios');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const ServiceException = require('../utils/errors/serviceException');
const commonErrors = require('../utils/constants/commonErrors');
const ApiError = require('../dto/commons/response/apiErrorDTO');
const reportGeneratorMessages = require('../utils/constants/reportGeneratorMessages');
const httpCodes = require('../utils/constants/httpCodes');

/**
 * Función encargada de consultar la informacion del Usuario en Sesion
 */
exports.getUserInfo = async (req, res) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization;
  }
  if (!token) {
    throw new ServiceException(
      commonErrors.E_COMMON_01,
      new ApiError(
        `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_05}`,
        `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_05}`,
        'E_REPORT_GENERATOR_MS_05',
        httpCodes.UNAUTHORIZED
      )
    );
  }

  const decoded = await promisify(jwt.verify)(
    token.split(' ')[1],
    process.env.JWT_SECRET
  );

  const response = await axios.get(
    `https://access-control-ms.herokuapp.com/api/v1/users/getUser/${decoded.id}`,
    {
      headers: {
        Authorization: token
      }
    }
  );

  return response.data.data;
};
