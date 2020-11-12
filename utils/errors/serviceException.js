// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
class ServiceException {
  constructor(message, apiError) {
    this.message = message;
    this.apiError = apiError;
  }

  applyData(json) {
    Object.assign(this, json);
  }
}
module.exports = ServiceException;
