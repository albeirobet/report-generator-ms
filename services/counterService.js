// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const AssistantReport = require('../models/assistantReportModel');
const Client = require('../models/clientModel');
const EntryMerchandise = require('../models/entryMerchandiseModel');
const InvoiceClient = require('../models/invoiceClientModel');
const InvoiceSupplier = require('../models/invoiceSupplierModel');
const MasterReport = require('../models/masterReportModel');
const Material = require('../models/materialModel');
const PaymentOriginal = require('../models/paymentOriginalModel');
const PaymentExtra = require('../models/paymentExtraModel');
const PurchaseOrder = require('../models/purchaseOrderModel');
const RetentionSupplier = require('../models/retentionSupplierModel');
const Service = require('../models/serviceModel');
const Supplier = require('../models/supplierModel');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const userService = require('./userService');

// =========== Function to count records of reports
exports.reportRecordCounter = async (req, res) => {
  try {
    const recordCounters = [];
    let summaryLoadedData = new SummaryLoadedData(null, 0, null);
    const userInfo = await userService.getUserInfo(req, res);

    let count = await AssistantReport.countDocuments({
      companyId: userInfo.companyId
    });
    summaryLoadedData = new SummaryLoadedData(null, count, 'DOF');
    recordCounters.push(summaryLoadedData);

    count = await Client.countDocuments({ companyId: userInfo.companyId });
    summaryLoadedData = new SummaryLoadedData(null, count, 'CLI');
    recordCounters.push(summaryLoadedData);

    count = await EntryMerchandise.countDocuments({
      companyId: userInfo.companyId
    });
    summaryLoadedData = new SummaryLoadedData(null, count, 'EDM');
    recordCounters.push(summaryLoadedData);

    count = await InvoiceClient.countDocuments({
      companyId: userInfo.companyId
    });
    summaryLoadedData = new SummaryLoadedData(null, count, 'FDV');
    recordCounters.push(summaryLoadedData);

    count = await InvoiceSupplier.countDocuments({
      companyId: userInfo.companyId
    });
    summaryLoadedData = new SummaryLoadedData(null, count, 'FPR');
    recordCounters.push(summaryLoadedData);

    count = await MasterReport.countDocuments({
      companyId: userInfo.companyId
    });
    summaryLoadedData = new SummaryLoadedData(null, count, 'CCO');
    recordCounters.push(summaryLoadedData);

    count = await Material.countDocuments({ companyId: userInfo.companyId });
    summaryLoadedData = new SummaryLoadedData(null, count, 'MAT');
    recordCounters.push(summaryLoadedData);

    count = await PaymentOriginal.countDocuments({
      companyId: userInfo.companyId
    });
    summaryLoadedData = new SummaryLoadedData(null, count, 'PYD');
    recordCounters.push(summaryLoadedData);

    count = await PaymentExtra.countDocuments({
      companyId: userInfo.companyId
    });
    summaryLoadedData = new SummaryLoadedData(null, count, 'PEX');
    recordCounters.push(summaryLoadedData);

    count = await PurchaseOrder.countDocuments({
      companyId: userInfo.companyId
    });
    summaryLoadedData = new SummaryLoadedData(null, count, 'PDC');
    recordCounters.push(summaryLoadedData);

    count = await RetentionSupplier.countDocuments({
      companyId: userInfo.companyId
    });
    summaryLoadedData = new SummaryLoadedData(null, count, 'RPR');
    recordCounters.push(summaryLoadedData);

    count = await Service.countDocuments({ companyId: userInfo.companyId });
    summaryLoadedData = new SummaryLoadedData(null, count, 'SER');
    recordCounters.push(summaryLoadedData);

    count = await Supplier.countDocuments({ companyId: userInfo.companyId });
    summaryLoadedData = new SummaryLoadedData(null, count, 'PRO');
    recordCounters.push(summaryLoadedData);

    return recordCounters;
  } catch (err) {
    throw err;
  }
};
