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
const Iva = require('../models/ivaModel');
const httpCodes = require('../utils/constants/httpCodes');
const constants = require('../utils/constants/constants');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const CommonLst = require('../dto/commons/commonLstDTO');
const APIFeatures = require('../utils/responses/apiFeatures');
const userService = require('./userService');

// =========== Function to loadClients
exports.loadIvaData = async (req, res) => {
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
    const ivaData = [];
    let count = 0;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(pathx).then(function() {
      const workSheet = workbook.getWorksheet(1);
      workSheet.eachRow(function(row, rowNumber) {
        const currRow = workSheet.getRow(rowNumber);
        if (count === 0) {
          const fileTitle = currRow.getCell(2).value;
          if (fileTitle !== constants.IVA_TEMPLATE_TITLE) {
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

        if (count > constants.IVA_TEMPLATE_ROW_INIT) {
          const iva = {
            mayorAccountNetId: currRow.getCell(2).value,
            mayorAccountNetName: currRow.getCell(3).value,
            accountingSeatId: currRow.getCell(4).value,
            originalDocumentId: currRow.getCell(5).value,
            originalDocumentType: currRow.getCell(6).value,
            taxCode: currRow.getCell(7).value,
            taxRate: currRow.getCell(8).value,
            taxType: currRow.getCell(9).value,
            netAmountCompanyCurrency: currRow.getCell(10).value,
            deductibleAmountTransactionCurrency: currRow.getCell(11).value,
            internalTaxAmountTransactionCurrency: currRow.getCell(12).value,
            netAmountTransactionCurrency: currRow.getCell(13).value,
            taxAmountTransactionCurrency: currRow.getCell(14).value,
            taxBaseAmountTransactionCurrency: currRow.getCell(15).value,
            internalTaxAmountTaxDlecarationCurrency: currRow.getCell(16).value,
            noDeductibleAmountTransactionCurrency: currRow.getCell(17).value,
            counter: currRow.getCell(18).value,
            companyId: userInfo.companyId,
            userId: userInfo._id
          };
          ivaData.push(iva);
        }
        count += 1;
      });
    });
    const summaryLoadedData = new SummaryLoadedData('', 0);
    console.log('Insert Data Init');
    await Iva.insertMany(ivaData)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = ivaData.length;
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

// =========== Function to delete
exports.deleteIvaData = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    await Iva.deleteMany({ companyId: userInfo.companyId });
    console.log('All Data successfully deleted');
    return true;
  } catch (err) {
    throw err;
  }
};

// =========== Function to count
exports.countIvaData = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    return await Iva.countDocuments({ companyId: userInfo.companyId });
  } catch (err) {
    throw err;
  }
};

// =========== Function to get a specific
exports.getIvaData = async (req, res) => {
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
  const data = await Iva.findById(req.params.id);
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

// =========== Function to get all Clients with filters to the table
exports.getAllIvaData = async (req, res) => {
  const userInfo = await userService.getUserInfo(req, res);
  const filterColumns = [
    'mayorAccountNetId',
    'mayorAccountNetName',
    'accountingSeatId',
    'originalDocumentId',
    'originalDocumentType',
    'taxCode',
    'taxRate',
    'taxType',
    'netAmountCompanyCurrency',
    'deductibleAmountTransactionCurrency',
    'internalTaxAmountTransactionCurrency',
    'netAmountTransactionCurrency',
    'taxAmountTransactionCurrency',
    'taxBaseAmountTransactionCurrency',
    'internalTaxAmountTaxDlecarationCurrency',
    'noDeductibleAmountTransactionCurrency'
  ];
  const dataTable = new APIFeatures(Iva.find(), req.query)
    .filter(userInfo.companyId, false, filterColumns)
    .sort()
    .limitFields()
    .paginate();
  const counter = new APIFeatures(Iva.find(), req.query).filter(
    userInfo.companyId,
    true,
    filterColumns
  );
  const totalCount = await counter.query;
  const dataPaginate = await dataTable.query;
  const data = new CommonLst(totalCount, dataPaginate);

  return data;
};
