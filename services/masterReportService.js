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
const MasterReport = require('../models/masterReportModel');
const httpCodes = require('../utils/constants/httpCodes');
const constants = require('../utils/constants/constants');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const CommonLst = require('../dto/commons/commonLstDTO');
const APIFeatures = require('../utils/responses/apiFeatures');
const userService = require('../services/userService');

// =========== Function to loadSuppliers
exports.loadMasterReportData = async (req, res) => {
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
    if (!userInfo || !userInfo.companyId) {
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
    const masterReport = [];
    let count = 0;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(pathx).then(function() {
      const workSheet = workbook.getWorksheet(1);
      workSheet.eachRow(function(row, rowNumber) {
        const currRow = workSheet.getRow(rowNumber);
        if (count === 0) {
          const fileTitle = currRow.getCell(2).value;
          if (fileTitle !== constants.MASTER_REPORT_TEMPLATE_TITLE) {
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

        if (count > constants.MASTER_REPORT_TEMPLATE_ROW_INIT) {
          const report = {
            seniorAccountantId: currRow.getCell(2).value,
            seniorAccountantName: currRow.getCell(3).value,
            postingDate: currRow.getCell(4).value,
            accountingSeat: currRow.getCell(5).value,
            externalReferenceId: currRow.getCell(6).value,
            originalDocumentId: currRow.getCell(7).value,
            accountingSeatType: currRow.getCell(8).value,
            accountingSeatAnnulled: currRow.getCell(9).value,
            originalDocumentAnnulledId: currRow.getCell(10).value,
            accountingSeatAnnulment: currRow.getCell(11).value,
            extraOriginalDocumentAnulledId: currRow.getCell(12).value,
            extraOriginalDocumentId: currRow.getCell(13).value,
            originalDocumentPosition: currRow.getCell(14).value,
            debtAmountCompanyCurrency: currRow.getCell(15).value,
            creditAmountCompanyCurrency: currRow.getCell(16).value,
            companyId: userInfo.companyId,
            userId: userInfo._id
          };
          masterReport.push(report);
        }
        count += 1;
      });
    });
    const summaryLoadedData = new SummaryLoadedData('', 0);
    console.log('Insert Data Init');
    await MasterReport.insertMany(masterReport)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = masterReport.length;
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

// =========== Function to delete MasterReport
exports.deleteMasterReport = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    await MasterReport.deleteMany({ companyId: userInfo.companyId });
    console.log('All Data successfully deleted');
    return true;
  } catch (err) {
    console.log(err);
  }
};

// =========== Function to count MasterReport
exports.countMasterReport = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    return await MasterReport.countDocuments({ companyId: userInfo.companyId });
  } catch (err) {
    console.log(err);
  }
};

// =========== Function to get a specific
exports.getMasterReportRow = async (req, res) => {
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
  const data = await MasterReport.findById(req.params.id);
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
exports.getAllMasterReportRows = async (req, res) => {
  const userInfo = await userService.getUserInfo(req, res);
  const features = new APIFeatures(
    MasterReport.find({ companyId: userInfo.companyId }),
    req.query
  )
    .filterTable()
    .sort()
    .limitFields()
    .paginate();
  const total = await MasterReport.countDocuments({
    companyId: userInfo.companyId
  });
  const data = await features.query;
  const dataList = new CommonLst(total, data);
  return dataList;
};
