/* eslint-disable radix */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const mongoose = require('mongoose');
const Excel = require('exceljs');
const path = require('path');
const fs = require('fs');
const ApiError = require('../dto/commons/response/apiErrorDTO');
const ServiceException = require('../utils/errors/serviceException');
const commonErrors = require('../utils/constants/commonErrors');
const reportGeneratorMessages = require('../utils/constants/reportGeneratorMessages');
const PurchaseOrderTracking = require('../models/purchaseOrderTrackingModel');
const httpCodes = require('../utils/constants/httpCodes');
const constants = require('../utils/constants/constants');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const userService = require('./userService');
const CommonLst = require('../dto/commons/commonLstDTO');
const APIFeatures = require('../utils/responses/apiFeatures');
const customValidator = require('../utils/validators/validator');

// =========== Function to loadServices
exports.loadPurchaseOrderTracking = async (req, res) => {
  try {
    if (req.file === undefined) {
      throw new ServiceException(
        commonErrors.E_COMMON_01,
        new ApiError(
          `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_01}`,
          `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_01}`,
          'E_REPORT_GENERATOR_MS_01',
          httpCodes.BAD_REQUEST
        )
      );
    }
    const userInfo = await userService.getUserInfo(req, res);
    if (!userInfo.companyId) {
      throw new ServiceException(
        commonErrors.E_COMMON_01,
        new ApiError(
          `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_04}`,
          `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_04}`,
          'E_REPORT_GENERATOR_MS_04',
          httpCodes.BAD_REQUEST
        )
      );
    }
    const pathTmp = path.resolve(__dirname, '../resources/uploads/');
    const pathx = `${pathTmp}//${req.file.filename}`;
    const purchaseOrders = [];
    let count = 0;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(pathx).then(function() {
      const workSheet = workbook.getWorksheet(1);
      workSheet.eachRow(function(row, rowNumber) {
        const currRow = workSheet.getRow(rowNumber);
        if (count === 0) {
          const fileTitle = currRow.getCell(2).value;
          if (fileTitle !== constants.PURCHASE_ORDER_TRACKING_TEMPLATE_TITLE) {
            fs.unlink(pathx, function(err) {
              if (err) throw err;
            });
            throw new ServiceException(
              commonErrors.E_COMMON_01,
              new ApiError(
                `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_02}`,
                `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_02}`,
                'E_REPORT_GENERATOR_MS_02',
                httpCodes.BAD_REQUEST
              )
            );
          }
        }

        if (count > constants.PURCHASE_ORDER_TRACKING_TEMPLATE_ROW_INIT) {
          const purchaseOrder = {
            supplierId: currRow.getCell(2).value,
            supplierName: currRow.getCell(3).value,
            purchaseOrderId: currRow.getCell(4).value,
            purchaseOrderPosition: currRow.getCell(5).value,
            purchaseOrderDate: customValidator.dateFromString(
              currRow.getCell(6).value
            ),
            itemsDescriptionPurchaseOrder: currRow.getCell(7).value,
            sedeCode: currRow.getCell(7).value,
            sedeName: currRow.getCell(7).value,
            requestedAmount: currRow.getCell(7).value,
            netPriceCompanyCurrency: currRow.getCell(7).value,
            deliveredQuantity: currRow.getCell(7).value,
            deliveredValue: currRow.getCell(7).value,
            deliveredValueCompanyCurrency: currRow.getCell(7).value,
            invoicedAmount: currRow.getCell(7).value,
            invoicedValue: currRow.getCell(7).value,
            invoicedValueCompanyCurrency: currRow.getCell(7).value,
            companyId: userInfo.companyId,
            userId: userInfo._id
          };
          purchaseOrders.push(purchaseOrder);
        }
        count += 1;
      });
    });
    const summaryLoadedData = new SummaryLoadedData('', 0);
    console.log('Insert Data Init');
    await PurchaseOrderTracking.insertMany(purchaseOrders)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = purchaseOrders.length;
        console.log('Insert Data Finish');
      })
      .catch(function(error) {
        summaryLoadedData.message =
          reportGeneratorMessages.E_REPORT_GENERATOR_MS_03;
        console.log(error);
      });

    fs.unlink(pathx, function(err) {
      if (err) throw err;
    });
    return summaryLoadedData;
  } catch (error) {
    throw error;
  }
};

// =========== Function to delete Service
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    await PurchaseOrderTracking.deleteMany({ companyId: userInfo.companyId });
    console.log('All Data successfully deleted');
    return true;
  } catch (err) {
    console.log(err);
  }
};

// =========== Function to count Service
exports.countPurchaseOrder = async (req, res) => {
  // console.log(stringToDate(null, 'dd.MM.yyyy', '.'));
  try {
    const userInfo = await userService.getUserInfo(req, res);
    return await PurchaseOrderTracking.countDocuments({
      companyId: userInfo.companyId
    });
  } catch (err) {
    console.log(err);
  }
};

// =========== Function to get a specific
exports.getPurchaseOrder = async (req, res) => {
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
  const data = await PurchaseOrderTracking.findById(req.params.id);
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
exports.getAllPurchaseOrders = async (req, res) => {
  const userInfo = await userService.getUserInfo(req, res);
  const filterColumns = [
    'supplierId',
    'supplierName',
    'purchaseOrderId',
    'purchaseOrderPosition',
    'itemsDescriptionPurchaseOrder',
    'sedeCode',
    'sedeName',
    'requestedAmount',
    'netPriceCompanyCurrency',
    'deliveredQuantity',
    'deliveredValue',
    'deliveredValueCompanyCurrency',
    'invoicedAmount',
    'invoicedValue',
    'invoicedValueCompanyCurrency'
  ];
  const dataTable = new APIFeatures(PurchaseOrderTracking.find(), req.query)
    .filter(userInfo.companyId, false, filterColumns)
    .sort()
    .limitFields()
    .paginate();
  const counter = new APIFeatures(
    PurchaseOrderTracking.find(),
    req.query
  ).filter(userInfo.companyId, true, filterColumns);
  const totalCount = await counter.query;
  const dataPaginate = await dataTable.query;
  const data = new CommonLst(totalCount, dataPaginate);
  return data;
};
