class CommonLst {
  constructor(total, dataLst) {
    this.total = total;
    this.dataLst = dataLst;
  }

  applyData(json) {
    Object.assign(this, json);
  }
}
module.exports = CommonLst;
