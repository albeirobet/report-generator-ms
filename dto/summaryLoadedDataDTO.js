class SummaryLoadedData {
  constructor(message, counter) {
    this.message = message;
    this.counter = counter;
  }

  applyData(json) {
    Object.assign(this, json);
  }
}
module.exports = SummaryLoadedData;
