// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
class ApiError {
  constructor(messageUser, messageDeveloper, code, codeHTTP) {
    this.messageUser = messageUser;
    this.messageDeveloper = messageDeveloper;
    this.code = code;
    this.codeHTTP = codeHTTP;
  }

  applyData(json) {
    Object.assign(this, json);
  }
}
module.exports = ApiError;
