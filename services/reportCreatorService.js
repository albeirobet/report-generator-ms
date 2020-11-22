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
const Iva = require('../models/ivaModel');
const EntryMerchandiseExtra = require('../models/entryMerchandiseExtraModel');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const userService = require('./userService');
const { count } = require('../models/assistantReportModel');

// =========== Function to count records of reports
exports.generateIvaReport = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    //console.log(new Date());

    const masterReportData = await MasterReport.find({
      companyId: userInfo.companyId,
      seniorAccountantName: 'CAJA GENERAL PESOS'
    })
      .select({
        originalDocumentId: 1,
        externalReferenceId: 1,
        companyId: 1
      })

      .lean();
    let counter = 0;
    masterReportData.forEach(elementMRD => {
      counter += 1;
    });
    return counter;
  } catch (err) {
    throw err;
  }
};
