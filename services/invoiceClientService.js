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
const InvoiceClient = require('../models/invoiceClientModel');
const httpCodes = require('../utils/constants/httpCodes');
const constants = require('../utils/constants/constants');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const CommonLst = require('../dto/commons/commonLstDTO');
const APIFeatures = require('../utils/responses/apiFeatures');
const userService = require('../services/userService');

// =========== Function to loadSuppliers
exports.loadInvoiceClients = async (req, res) => {
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
    const invoiceClients = [];
    let count = 0;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(pathx).then(function() {
      const workSheet = workbook.getWorksheet(1);
      workSheet.eachRow(function(row, rowNumber) {
        const currRow = workSheet.getRow(rowNumber);
        if (count === 0) {
          const fileTitle = currRow.getCell(2).value;
          if (fileTitle !== constants.INVOICE_CLIENTS_TEMPLATE_TITLE) {
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

        if (count > constants.INVOICE_CLIENTS_TEMPLATE_ROW_INIT) {
          const invoiceClient = {
            clientName: currRow.getCell(2).value,
            clientId: currRow.getCell(3).value,
            invoiceId: currRow.getCell(4).value,
            invoiceDate: currRow.getCell(5).value,
            grossValueInvoice: currRow.getCell(6).value,
            netValueInvoice: currRow.getCell(7).value,
            tax: currRow.getCell(8).value,
            netInvoicedValue: currRow.getCell(9).value,
            companyId: userInfo.companyId,
            userId: userInfo._id
          };
          invoiceClients.push(invoiceClient);
        }
        count += 1;
      });
    });
    const summaryLoadedData = new SummaryLoadedData('', 0);
    console.log('Insert Data Init');
    await InvoiceClient.insertMany(invoiceClients)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = invoiceClients.length;
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

// =========== Function to delete InvoiceClient
exports.deleteInvoiceClient = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    await InvoiceClient.deleteMany({ companyId: userInfo.companyId });
    console.log('All Data successfully deleted');
    return true;
  } catch (err) {
    console.log(err);
  }
};

// =========== Function to count InvoiceClient
exports.countInvoiceClient = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    return await InvoiceClient.countDocuments({
      companyId: userInfo.companyId
    });
  } catch (err) {
    console.log(err);
  }
};

// =========== Function to get a specific Invoice
exports.getInvoiceClient = async (req, res) => {
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
  const data = await InvoiceClient.findById(req.params.id);
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
exports.getAllInvoiceClients = async (req, res) => {
  const features = new APIFeatures(InvoiceClient.find(), req.query)
    .filterTable()
    .sort()
    .limitFields()
    .paginate();
  const total = await InvoiceClient.countDocuments();
  const data = await features.query;
  const dataList = new CommonLst(total, data);
  return dataList;
};
