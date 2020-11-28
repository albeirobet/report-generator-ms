/* eslint-disable no-restricted-syntax */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-continue */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');
const ApiError = require('../dto/commons/response/apiErrorDTO');
const ServiceException = require('../utils/errors/serviceException');
const commonErrors = require('../utils/constants/commonErrors');
const ReportUploader = require('../models/reportUploaderModel');
const AssistantReport = require('../models/assistantReportModel');
const Client = require('../models/clientModel');
const EntryMerchandiseExtra = require('../models/entryMerchandiseExtraModel');
const EntryMerchandise = require('../models/entryMerchandiseExtraModel');
const InvoiceClient = require('../models/invoiceClientModel');
const InvoiceSupplier = require('../models/invoiceSupplierModel');
const Iva = require('../models/ivaModel');
const MasterReport = require('../models/masterReportModel');
const Material = require('../models/materialModel');
const PaymentExtra = require('../models/paymentExtraModel');
const PaymentOriginal = require('../models/paymentOriginalModel');
const PurchaseOrder = require('../models/purchaseOrderModel');
const PurchaseOrderTracking = require('../models/purchaseOrderTrackingModel');
const RetentionSupplier = require('../models/retentionSupplierModel');
const Service = require('../models/serviceModel');
const Supplier = require('../models/supplierModel');

const customValidator = require('../utils/validators/validator');
const httpCodes = require('../utils/constants/httpCodes');
const userService = require('./userService');

// =========== Function to register a new user
exports.createReport = async (req, res) => {
  try {
    // Validate request
    customValidator.validateNotNullRequest(req);
    const report = await ReportUploader.insertMany(req.body);
    return report;
  } catch (error) {
    throw error;
  }
};

// =========== Function to get a specific
exports.getReport = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ServiceException(
      commonErrors.E_COMMON_01,
      new ApiError(
        `${commonErrors.EM_COMMON_10}`,
        `${commonErrors.EM_COMMON_10}`,
        'EM_COMMON_10',
        httpCodes.BAD_REQUEST
      )
    );
  }
  const data = await ReportUploader.findById(req.params.id);
  // CompanyData.findOne({ _id: req.params.id })
  if (!data) {
    throw new ServiceException(
      commonErrors.E_COMMON_01,
      new ApiError(
        `${commonErrors.EM_COMMON_11}`,
        `${commonErrors.EM_COMMON_11}`,
        'EM_COMMON_11',
        httpCodes.BAD_REQUEST
      )
    );
  }
  return data;
};

// =========== Function to get all Invoice Clients with filters to the table
exports.getAllAllReports = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    const data = await ReportUploader.find({
      companyId: userInfo.companyId
    });
    return data;
  } catch (err) {
    throw err;
  }
};

exports.deleteReport = async (req, res) => {
  try {
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < req.body.length; i++) {
      // eslint-disable-next-line no-await-in-loop
      const deleted = await ReportUploader.deleteMany({
        code: req.body[i].code,
        companyId: req.body[i].companyId
      });
      switch (req.body[i].code) {
        case 'ASITM':
          // eslint-disable-next-line no-await-in-loop
          await AssistantReport.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'CLITM':
          // eslint-disable-next-line no-await-in-loop
          await Client.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'EMETM':
          // eslint-disable-next-line no-await-in-loop
          await EntryMerchandiseExtra.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'EMSTM':
          // eslint-disable-next-line no-await-in-loop
          await EntryMerchandise.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'INCTM':
          // eslint-disable-next-line no-await-in-loop
          await InvoiceClient.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'INSTM':
          // eslint-disable-next-line no-await-in-loop
          await InvoiceSupplier.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'IVATM':
          // eslint-disable-next-line no-await-in-loop
          await Iva.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'MASTM':
          // eslint-disable-next-line no-await-in-loop
          await MasterReport.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'MATTM':
          // eslint-disable-next-line no-await-in-loop
          await Material.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'PAETM':
          // eslint-disable-next-line no-await-in-loop
          await PaymentExtra.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'PAOTM':
          // eslint-disable-next-line no-await-in-loop
          await PaymentOriginal.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'PORTM':
          // eslint-disable-next-line no-await-in-loop
          await PurchaseOrder.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'POTTM':
          // eslint-disable-next-line no-await-in-loop
          await PurchaseOrderTracking.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'RESTM':
          // eslint-disable-next-line no-await-in-loop
          await RetentionSupplier.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'SERTM':
          // eslint-disable-next-line no-await-in-loop
          await Service.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        case 'SUPTM':
          // eslint-disable-next-line no-await-in-loop
          await Supplier.deleteMany({
            companyId: req.body[i].companyId
          });
          break;
        default:
          break;
      }
      console.log(deleted);
    }
    return true;
  } catch (err) {
    throw err;
  }
};
