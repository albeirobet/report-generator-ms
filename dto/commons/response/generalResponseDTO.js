// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
class GeneralResponse {
  constructor(data, success, message, apiError) {
    this.data = data;
    this.success = success;
    this.message = message;
    this.apiError = apiError;
  }

  applyData(json) {
    Object.assign(this, json);
  }
}
module.exports = GeneralResponse;
