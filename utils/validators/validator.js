/* eslint-disable radix */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const ApiError = require('../../dto/commons/response/apiErrorDTO');
const ServiceException = require('../errors/serviceException');
const commonErrors = require('../constants/commonErrors');

exports.validateNotNullRequest = req => {
  if (Object.keys(req.body).length === 0) {
    throw new ServiceException(
      commonErrors.ET_COMMON_02,
      new ApiError(
        commonErrors.ET_COMMON_02,
        commonErrors.EM_COMMON_02,
        'EM_COMMON_02'
      )
    );
  }
};

exports.validateNotNullParameter = parameter => {
  if (typeof parameter !== 'undefined' && parameter) {
    console.log('validateNotNullParameter');
  } else {
    throw new ServiceException(
      commonErrors.ET_COMMON_02,
      new ApiError(
        commonErrors.ET_COMMON_02,
        commonErrors.EM_COMMON_03,
        'EM_COMMON_03'
      )
    );
  }
};

function stringToDate(_date, _format, _delimiter) {
  if (_date) {
    const formatedD = new Date(_date);
    if (formatedD.getDate()) {
      return formatedD;
    }
    const formatLowerCase = _format.toLowerCase();
    const formatItems = formatLowerCase.split(_delimiter);
    const dateItems = _date.split(_delimiter);
    const monthIndex = formatItems.indexOf('mm');
    const dayIndex = formatItems.indexOf('dd');
    const yearIndex = formatItems.indexOf('yyyy');
    let month = parseInt(dateItems[monthIndex]);
    month -= 1;

    const formatedDate = new Date(
      dateItems[yearIndex],
      month,
      dateItems[dayIndex]
    );
    if (formatedDate.getDate()) {
      return formatedDate;
    }
    return null;
  }
  return null;
}

exports.dateFromString = date => {
  if (date) {
    const pointDate = stringToDate(date, 'dd.MM.yyyy', '.');
    if (pointDate != null) {
      return pointDate;
    }
    const slashDate = stringToDate(date, 'dd/MM/yyyy', '/');
    if (slashDate != null) {
      return slashDate;
    }

    return null;
  }
  return null;
};

exports.stringFromDate = date => {
  const currentDatetime = new Date(date);
  if (currentDatetime.getDate()) {
    if (currentDatetime.getDate()) {
      const formattedDate = `${currentDatetime.getDate()}/${currentDatetime.getMonth() +
        1}/${currentDatetime.getFullYear()}`;
      console.log(formattedDate);
      return formattedDate;
    }
  }
  return null;
};
