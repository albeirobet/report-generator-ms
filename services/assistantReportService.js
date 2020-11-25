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
const AssistantReport = require('../models/assistantReportModel');
const httpCodes = require('../utils/constants/httpCodes');
const constants = require('../utils/constants/constants');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const CommonLst = require('../dto/commons/commonLstDTO');
const APIFeatures = require('../utils/responses/apiFeatures');
const userService = require('../services/userService');
const customValidator = require('../utils/validators/validator');

// =========== Function to loadSuppliers
exports.loadAssistantReportData = async (req, res) => {
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
    const assistantReport = [];
    let count = 0;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(pathx).then(function() {
      const workSheet = workbook.getWorksheet(1);
      workSheet.eachRow(function(row, rowNumber) {
        const currRow = workSheet.getRow(rowNumber);
        if (count === 0) {
          const fileTitle = currRow.getCell(2).value;
          if (fileTitle !== constants.ASSISTANT_REPORT_TEMPLATE_TITLE) {
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

        if (count > constants.ASSISTANT_REPORT_TEMPLATE_ROW_INIT) {
          const report = {
            invoiceId: currRow.getCell(2).value,
            invoiceDate: customValidator.dateFromString(
              currRow.getCell(3).value
            ),
            supplierId: currRow.getCell(4).value,
            supplierName: currRow.getCell(5).value,
            entryMerchandiseId: currRow.getCell(6).value,
            inboundDeliveryConfirmedId: currRow.getCell(7).value,
            purchaseOrderId: currRow.getCell(8).value,
            supplierCoName: currRow.getCell(9).value,
            supplierCoId: currRow.getCell(10).value,
            refundCo: currRow.getCell(11).value,
            externalDocumentId: currRow.getCell(12).value,
            invoicePosition: currRow.getCell(13).value,
            counter: currRow.getCell(14).value,
            grossAmountCompanyCurrency: currRow.getCell(15).value,
            netAmountCompanyCurrency: currRow.getCell(16).value,
            grossValue: currRow.getCell(17).value,
            netValue: currRow.getCell(18).value,
            quantity: currRow.getCell(19).value,
            companyId: userInfo.companyId,
            userId: userInfo._id
          };
          assistantReport.push(report);
        }
        count += 1;
      });
    });
    const summaryLoadedData = new SummaryLoadedData('', 0);
    console.log('Insert Data Init');
    await AssistantReport.insertMany(assistantReport)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = assistantReport.length;
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

// =========== Function to delete AssistantReport
exports.deleteAssistantReport = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    await AssistantReport.deleteMany({ companyId: userInfo.companyId });
    console.log('All Data successfully deleted');
    return true;
  } catch (err) {
    console.log(err);
  }
};

// =========== Function to count AssistantReport
exports.countAssistantReport = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    return await AssistantReport.countDocuments({
      companyId: userInfo.companyId
    });
  } catch (err) {
    console.log(err);
  }
};

// =========== Function to get a specific Assistant Report
exports.getAssistantReport = async (req, res) => {
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
  const report = await AssistantReport.findById(req.params.id);
  // CompanyData.findOne({ _id: req.params.id })
  if (!report) {
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
  return report;
};

// =========== Function to get all Assistant Reports Rows with filters to the table
exports.getAllAssistantReports = async (req, res) => {
  const userInfo = await userService.getUserInfo(req, res);
  const filterColumns = [
    'invoiceId',
    'supplierId',
    'supplierName',
    'entryMerchandiseId',
    'inboundDeliveryConfirmedId',
    'purchaseOrderId',
    'supplierCoName',
    'supplierCoId',
    'refundCo',
    'externalDocumentId',
    'grossAmountCompanyCurrency',
    'netAmountCompanyCurrency',
    'grossValue',
    'netValue'
  ];
  const dataTable = new APIFeatures(AssistantReport.find(), req.query)
    .filter(userInfo.companyId, false, filterColumns)
    .sort()
    .limitFields()
    .paginate();
  const counter = new APIFeatures(AssistantReport.find(), req.query).filter(
    userInfo.companyId,
    true,
    filterColumns
  );
  const totalCount = await counter.query;
  const dataPaginate = await dataTable.query;
  const data = new CommonLst(totalCount, dataPaginate);

  return data;
};
