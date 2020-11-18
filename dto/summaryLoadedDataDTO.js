class SummaryLoadedData {
  constructor(message, counter, code) {
    this.message = message;
    this.counter = counter;
    this.code = code;
  }

  applyData(json) {
    Object.assign(this, json);
  }
}
module.exports = SummaryLoadedData;
