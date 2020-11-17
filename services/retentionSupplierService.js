// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const Excel = require('exceljs');
const path = require('path');
const fs = require('fs');
const ApiError = require('../dto/commons/response/apiErrorDTO');
const ServiceException = require('../utils/errors/serviceException');
const commonErrors = require('../utils/constants/commonErrors');
const reportGeneratorMessages = require('../utils/constants/reportGeneratorMessages');
const RetentionSupplier = require('../models/retentionSupplierModel');
const httpCodes = require('../utils/constants/httpCodes');
const constants = require('../utils/constants/constants');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const userService = require('../services/userService');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

// =========== Function to loadEntryMerchandises
exports.loadRetentionSupplier = async (req, res) => {
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
    const pathTmp = path.resolve(__dirname, '../resources/uploads/');
    const pathx = `${pathTmp}//${req.file.filename}`;
    const invoiceSuppliers = [];
    let count = 0;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(pathx).then(function() {
      const workSheet = workbook.getWorksheet(1);
      workSheet.eachRow(function(row, rowNumber) {
        const currRow = workSheet.getRow(rowNumber);
        if (count === 0) {
          const fileTitle = currRow.getCell(2).value;
          if (fileTitle !== constants.RETENTION_SUPPLIERS_TEMPLATE_TITLE) {
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
        if (count > constants.RETENTION_SUPPLIERS_TEMPLATE_ROW_INIT) {
          const invoiceSupplier = {
            company: currRow.getCell(2).value,
            supplierId: currRow.getCell(3).value,
            supplierName: currRow.getCell(4).value,
            postingDate: currRow.getCell(5).value,
            invoiceId: currRow.getCell(6).value,
            invoicePosition: currRow.getCell(7).value,
            amountCompanyCurrency: currRow.getCell(8).value,
            reteFuentePercentage: currRow.getCell(9).value,
            reteFuenteValue: currRow.getCell(10).value,
            reteIcaPercentage: currRow.getCell(11).value,
            reteIcaValue: currRow.getCell(12).value,
            reteIvaPercentage: currRow.getCell(13).value,
            reteIvaValue: currRow.getCell(14).value
          };
          invoiceSuppliers.push(invoiceSupplier);
        }
        count += 1;
      });
    });
    const summaryLoadedData = new SummaryLoadedData('', 0);
    console.log('Insert Data Init');
    await RetentionSupplier.insertMany(invoiceSuppliers)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = invoiceSuppliers.length;
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

// =========== Function to delete RetentionSupplier
exports.deleteRetentionSupplier = async (req, res) => {
  try {
    let userInfo = await getUserInfo(req, res);
    await RetentionSupplier.deleteMany({ companyId: userInfo.companyId });
    console.log('All Data successfully deleted');
    return true;
  } catch (err) {
    console.log(err);
  }
};

// =========== Function to count RetentionSupplier
exports.countRetentionSupplier = async (req, res) => {
  try {
    let userInfo = await getUserInfo(req, res);
    return await RetentionSupplier.countDocuments({ companyId: userInfo.companyId });
  } catch (err) {
    console.log(err);
  }
};

async function getUserInfo(req, res) {
  let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization;
    }
    if (!token) {
      throw new ServiceException(
        commonErrors.E_COMMON_01,
        new ApiError(
          `${accessControlMessages.E_ACCESS_CONTROL_MS_02}`,
          `${accessControlMessages.E_ACCESS_CONTROL_MS_02}`,
          'E_ACCESS_CONTROL_MS_02',
          httpCodes.UNAUTHORIZED
        )
      );
    }

    const decoded = await promisify(jwt.verify)(token.split(' ')[1], process.env.JWT_SECRET);
    return await userService.getUserInfo(decoded.id, token, res);
}