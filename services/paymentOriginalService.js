/* eslint-disable no-inner-declarations */
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
const PaymentOriginal = require('../models/paymentOriginalModel');
const httpCodes = require('../utils/constants/httpCodes');
const constants = require('../utils/constants/constants');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const userService = require('./userService');
const CommonLst = require('../dto/commons/commonLstDTO');
const APIFeatures = require('../utils/responses/apiFeatures');
const customValidator = require('../utils/validators/validator');
const ReportUploader = require('../models/reportUploaderModel');
const reportFunctionsUpdate = require('../utils/functions/reportFunctionsUpdate');

// =========== Function to
exports.loadPaymentOriginalData = async (req, res) => {
  try {
    this.loadPaymentOriginalDataAsyncy(req, res);
    return 'El reporte está siendo Cargado. Por favor validar su estado';
  } catch (error) {
    throw error;
  }
};

exports.loadPaymentOriginalDataAsyncy = async (req, res) => {
  try {
    // Defino objeto y variables estandar para el resumen de la carga
    const objectReportResume = {};
    objectReportResume.code = 'PAOTM';
    objectReportResume.startDate = new Date();
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

    objectReportResume.companyId = userInfo.companyId;
    objectReportResume.generatorUserId = userInfo._id;
    const reportInfo = await ReportUploader.find({
      companyId: userInfo.companyId,
      code: objectReportResume.code
    }).lean();
    if (reportInfo.length === 0) {
      throw new ServiceException(
        commonErrors.E_COMMON_01,
        new ApiError(
          `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_06}`,
          `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_06}`,
          'E_REPORT_GENERATOR_MS_06',
          httpCodes.BAD_REQUEST
        )
      );
    }

    if (req.file === undefined) {
      // Actualizando información encabezado reporte
      objectReportResume.state = 'error_report';
      objectReportResume.percentageCompletition = 0;
      objectReportResume.counterRows = 0;
      objectReportResume.message = `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_01}`;
      objectReportResume.endDate = new Date();
      await reportFunctionsUpdate.updateReportUploader(objectReportResume);
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

    // Actualizando información encabezado reporte
    objectReportResume.state = 'processing';
    objectReportResume.percentageCompletition = 33;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Procesando Información';
    objectReportResume.endDate = null;
    await reportFunctionsUpdate.updateReportUploader(objectReportResume);

    const pathTmp = path.resolve(__dirname, '../resources/uploads/');
    const pathx = `${pathTmp}//${req.file.filename}`;
    const paymentOriginalData = [];
    let count = 0;
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(pathx).then(function() {
      const workSheet = workbook.getWorksheet(1);
      workSheet.eachRow(function(row, rowNumber) {
        const currRow = workSheet.getRow(rowNumber);
        if (count === 0) {
          const fileTitle = currRow.getCell(2).value;
          if (fileTitle !== constants.PAYMENT_ORIGINAL_TEMPLATE_TITLE) {
            fs.unlink(pathx, function(err) {
              if (err) throw err;
            });
            async function finishReport() {
              // Actualizando información encabezado reporte
              objectReportResume.state = 'error_report';
              objectReportResume.percentageCompletition = 0;
              objectReportResume.counterRows = 0;
              objectReportResume.message = `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_02}`;
              objectReportResume.endDate = new Date();
              await reportFunctionsUpdate.updateReportUploader(
                objectReportResume
              );
            }
            finishReport();

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

        if (count > constants.PAYMENT_ORIGINAL_TEMPLATE_ROW_INIT) {
          const payment = {
            state: currRow.getCell(2).value,
            documentId: currRow.getCell(3).value,
            externalReferenceId: currRow.getCell(4).value,
            createdAt: customValidator.dateFromString(currRow.getCell(5).value),
            pyamentMethod: currRow.getCell(6).value,
            businessPartnerName: currRow.getCell(7).value,
            bankAccountId: currRow.getCell(8).value,
            minorExpensesId: currRow.getCell(9).value,
            paymentAmount: currRow.getCell(10).value,
            companyIdFile: currRow.getCell(11).value,
            companyId: userInfo.companyId,
            userId: userInfo._id
          };
          paymentOriginalData.push(payment);
        }
        count += 1;
      });
    });
    const summaryLoadedData = new SummaryLoadedData('', 0);
    console.log('Insert Data Init');
    // Actualizando información encabezado reporte
    objectReportResume.state = 'entering_information';
    objectReportResume.percentageCompletition = 66;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Insertando Información';
    await reportFunctionsUpdate.updateReportUploader(objectReportResume);
    await PaymentOriginal.insertMany(paymentOriginalData)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = paymentOriginalData.length;
        console.log('Insert Data Finish');
        async function finishReport() {
          // Actualizando información encabezado reporte
          objectReportResume.state = 'uploaded_data';
          objectReportResume.percentageCompletition = 100;
          objectReportResume.counterRows = paymentOriginalData.length;
          objectReportResume.message = 'Reporte cargado correctamente';
          objectReportResume.endDate = new Date();
          await reportFunctionsUpdate.updateReportUploader(objectReportResume);
        }
        finishReport();
      })
      .catch(function(error) {
        summaryLoadedData.message =
          reportGeneratorMessages.E_REPORT_GENERATOR_MS_03;
        console.log(error);
        async function finishReport() {
          // Actualizando información encabezado reporte
          objectReportResume.state = 'error_report';
          objectReportResume.percentageCompletition = 0;
          objectReportResume.counterRows = 0;
          objectReportResume.message =
            'Ocurrió un error al cargar el archivo. Por favor contácte a Soporte Técnico';
          objectReportResume.endDate = new Date();
          await reportFunctionsUpdate.updateReportUploader(objectReportResume);
        }
        finishReport();
      });

    fs.unlink(pathx, function(err) {
      if (err) throw err;
    });
    return summaryLoadedData;
  } catch (error) {
    throw error;
  }
};

// =========== Function to delete PaymentOriginal
exports.deletePaymentOriginal = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    await PaymentOriginal.deleteMany({ companyId: userInfo.companyId });
    // Defino objeto y variables estandar para el resumen de la carga
    const objectReportResume = {};
    objectReportResume.code = 'PAOTM';
    objectReportResume.companyId = userInfo.companyId;
objectReportResume.startDate = null;
    objectReportResume.state = 'deleted_report';
    objectReportResume.percentageCompletition = 0;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Reporte borrado';
    objectReportResume.endDate = new Date();
    await reportFunctionsUpdate.updateReportUploader(objectReportResume);
    console.log('All Data successfully deleted');
    return true;
  } catch (err) {
    console.log(err);
  }
};

// =========== Function to count PaymentOriginal
exports.countPaymentOriginal = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    return await PaymentOriginal.countDocuments({
      companyId: userInfo.companyId
    });
  } catch (err) {
    console.log(err);
  }
};

// =========== Function to get a specific
exports.getPaymentOriginal = async (req, res) => {
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
  const data = await PaymentOriginal.findById(req.params.id);
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
exports.getAllPaymentOriginal = async (req, res) => {
  const userInfo = await userService.getUserInfo(req, res);
  const filterColumns = [
    'state',
    'documentId',
    'externalReferenceId',
    'pyamentMethod',
    'businessPartnerName',
    'bankAccountId',
    'minorExpensesId',
    'paymentAmount',
    'companyIdFile'
  ];
  const dataTable = new APIFeatures(PaymentOriginal.find(), req.query)
    .filter(userInfo.companyId, false, filterColumns)
    .sort()
    .limitFields()
    .paginate();
  const counter = new APIFeatures(PaymentOriginal.find(), req.query).filter(
    userInfo.companyId,
    true,
    filterColumns
  );
  const totalCount = await counter.query;
  const dataPaginate = await dataTable.query;
  const data = new CommonLst(totalCount, dataPaginate);

  return data;
};
