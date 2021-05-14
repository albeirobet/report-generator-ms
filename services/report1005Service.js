/* eslint-disable prefer-destructuring */
/* eslint-disable no-plusplus */
/* eslint-disable no-lonely-if */
/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-continue */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const path = require('path');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const ApiError = require('../dto/commons/response/apiErrorDTO');
const ServiceException = require('../utils/errors/serviceException');
const commonErrors = require('../utils/constants/commonErrors');
const httpCodes = require('../utils/constants/httpCodes');
const DailyAccount = require('../models/dailyAccountModel');
const MasterReport = require('../models/masterReportModel');
const Supplier = require('../models/supplierModel');
const Report1005 = require('../models/report1005Model');
const ReportCreator = require('../models/reportCreatorModel');
const reportGeneratorMessages = require('../utils/constants/reportGeneratorMessages');
const reportFunctionsUpdate = require('../utils/functions/reportFunctionsUpdate');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const userService = require('./userService');
const email = require('../utils/email');

function getNum(val) {
  val = +val || 0;
  return val;
}
function generatePersonalData(objectGenerated, supplierFound) {
  const identificationNumber = supplierFound.identificationNumber;
  const identificationType = supplierFound.identificationType;
  let direccion = null;
  let tipoDocumento = null;
  let nroIdentificacion = null;
  let dv = null;
  let razonSocial = null;
  let primerApellido = null;
  let segundoApellido = null;
  let primerNombre = null;
  let segundoNombre = null;
  direccion = supplierFound.address;
  if (identificationType === '31-Número de identificación tributaria') {
    dv = identificationNumber.substr(identificationNumber.length - 1);
    nroIdentificacion = identificationNumber.slice(0, -1);
    tipoDocumento = '31';
    razonSocial = supplierFound.name;
  } else {
    let nombresParts = supplierFound.name.split(' ');
    nombresParts = nombresParts.filter(item => item);
    if (nombresParts.length > 0) {
      if (nombresParts.length === 1) {
        primerApellido = nombresParts[0];
      }
      if (nombresParts.length === 2) {
        primerApellido = nombresParts[0];
        primerNombre = nombresParts[1];
      }
      if (nombresParts.length === 3) {
        primerApellido = nombresParts[0];
        segundoApellido = nombresParts[1];
        primerNombre = nombresParts[2];
      }
      if (nombresParts.length === 4) {
        primerApellido = nombresParts[0];
        segundoApellido = nombresParts[1];
        primerNombre = nombresParts[2];
        segundoNombre = nombresParts[3];
      }
      if (nombresParts.length > 4) {
        primerApellido = nombresParts[0];
        segundoApellido = nombresParts[1];
        primerNombre = nombresParts[2];
        let counter = 3;
        segundoNombre = '';
        for (counter; counter < nombresParts.length; counter++) {
          const nameTmp = nombresParts[counter];
          segundoNombre += `${nameTmp} `;
        }
      }
    } else {
      primerApellido = supplierFound.name;
    }
    nroIdentificacion = identificationNumber;
    const identificationTypeParts = identificationType.split('-');
    if (identificationType === 'Número de identificación fiscal') {
      nroIdentificacion = 42;
    } else {
      if (identificationTypeParts.length > 0) {
        tipoDocumento = identificationTypeParts[0];
        if (isNaN(tipoDocumento)) {
          tipoDocumento = 9999999999;
        }
      } else {
        tipoDocumento = 9999999999;
      }
    }
  }
  objectGenerated.direccion = direccion;
  objectGenerated.dv = dv;
  objectGenerated.tipoDocumento = tipoDocumento;
  objectGenerated.nroIdentificacion = nroIdentificacion;
  objectGenerated.razonSocial = razonSocial;
  objectGenerated.primerApellido = primerApellido;
  objectGenerated.segundoApellido = segundoApellido;
  objectGenerated.primerNombre = primerNombre;
  objectGenerated.segundoNombre = segundoNombre;
  return objectGenerated;
}
// =========== Function to count records of reports
exports.generateReport = async (req, res) => {
  try {
    const objectReportResume = {};
    objectReportResume.code = '1005GR';
    objectReportResume.startDate = new Date();

    const userInfo = await userService.getUserInfo(req, res);
    objectReportResume.companyId = userInfo.companyId;
    objectReportResume.generatorUserId = userInfo._id;
    const reportInfo = await ReportCreator.find({
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

    // Actualizando información encabezado reporte
    objectReportResume.state = 'processing';
    objectReportResume.percentageCompletition = 33;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Procesando Información';
    objectReportResume.endDate = null;
    await reportFunctionsUpdate.updateReportCreator(objectReportResume);

    // Limpiando reporte anterior
    await Report1005.collection.deleteMany({
      companyId: userInfo.companyId
    });
    let arrayGenerated = [];
    let arrayGeneratedTmp = [];
    let objectGenerated = {};

    console.log(' =========  Cargando en memoria');
    let masterReportData = await MasterReport.find({
      companyId: userInfo.companyId
      //, originalDocumentId: { $in: ['6947'] }
    }).lean();

    let dailyAccount = await DailyAccount.find({
      companyId: userInfo.companyId
    }).lean();

    // Cargando datos de proveedores en memoria
    console.log(' =========  Cargando proveedores en memoria');
    let supplierReportData = await Supplier.find({
      companyId: userInfo.companyId
    }).lean();

    console.log(
      'Cargada información Maestra en Memoria ',
      masterReportData.length
    );

    for await (const reportData of masterReportData) {
      objectGenerated = {};
      if (
        reportData.accountingSeatType === 'Arrastre de saldos' ||
        reportData.accountingSeatType ===
          'Cont.manual - Anul.doc.asiento contable' ||
        reportData.accountingSeatType ===
          'Cont.manual - Documento asiento contable'
      ) {
        continue;
      } else {
        objectGenerated.companyId = userInfo.companyId;
        objectGenerated.userId = userInfo._id;
        objectGenerated.seniorAccountantId = reportData.seniorAccountantId;
        objectGenerated.accountingSeat = reportData.accountingSeat;
        objectGenerated.impuestoDescontable =
          reportData.balanceAmountCompanyCurrency;
        const thirdId = reportData.thirdId;
        if (thirdId.length > 0) {
          if (thirdId === '#') {
            const dailyFound = dailyAccount.find(
              el => el.accountingSeat === reportData.accountingSeat
            );
            if (dailyFound) {
              if (dailyFound.businessPartnerID !== '#') {
                objectGenerated.thirdId = dailyFound.businessPartnerID;
              } else {
                objectGenerated.thirdId = '#';
              }
            } else {
              objectGenerated.thirdId = 'NO ENCONTRADO';
            }
          } else {
            objectGenerated.thirdId = thirdId;
          }
          if (objectGenerated.thirdId !== '#') {
            const supplierFound = supplierReportData.find(
              el => el.supplier === objectGenerated.thirdId
            );
            if (supplierFound) {
              objectGenerated = generatePersonalData(
                objectGenerated,
                supplierFound
              );
            } else {
              console.log('PROVEEDOR NO ENCONTRADO');
              objectGenerated.nroIdentificacion = 'NO ENCONTRADO';
            }
          } else {
            objectGenerated.nroIdentificacion = objectGenerated.thirdId;
            objectGenerated.tipoDocumento = '9999999999';
          }
          arrayGenerated.push(objectGenerated);
        }
      }
    }

    const nroCedulasUnicos = [];
    for (let i = 0; i < arrayGenerated.length; i++) {
      if (
        nroCedulasUnicos.indexOf(arrayGenerated[i].nroIdentificacion) === -1
      ) {
        nroCedulasUnicos.push(arrayGenerated[i].nroIdentificacion);
      }
    }

    arrayGeneratedTmp = arrayGenerated;
    arrayGenerated = [];

    nroCedulasUnicos.forEach(function(doc) {
      let byCedulaList = [];
      byCedulaList = arrayGeneratedTmp.filter(
        el => el.nroIdentificacion === doc
      );
      if (doc === '#') {
        byCedulaList.forEach(function(docNumeral) {
          arrayGenerated.push(docNumeral);
        });
      } else {
        objectGenerated = {};
        objectGenerated.companyId = userInfo.companyId;
        objectGenerated.userId = userInfo._id;
        objectGenerated.impuestoDescontable = 0;
        byCedulaList.forEach(function(docSum) {
          objectGenerated.seniorAccountantId = docSum.seniorAccountantId;
          objectGenerated.accountingSeat = docSum.accountingSeat;
          objectGenerated.tipoDocumento = docSum.tipoDocumento;
          objectGenerated.nroIdentificacion = docSum.nroIdentificacion;
          objectGenerated.dv = docSum.dv;
          objectGenerated.primerApellido = docSum.primerApellido;
          objectGenerated.segundoApellido = docSum.segundoApellido;
          objectGenerated.primerNombre = docSum.primerNombre;
          objectGenerated.segundoNombre = docSum.segundoNombre;
          objectGenerated.razonSocial = docSum.razonSocial;

          // ==== Impuesto Descontable
          let impuestoDescontableDef = 0;
          if (getNum(docSum.impuestoDescontable)) {
            impuestoDescontableDef =
              getNum(objectGenerated.impuestoDescontable) +
              getNum(docSum.impuestoDescontable);
            objectGenerated.impuestoDescontable = impuestoDescontableDef;
          }

          objectGenerated.ivaResultante = 0;
        });
        arrayGenerated.push(objectGenerated);
      }
    });

    const summaryLoadedData = new SummaryLoadedData('', 0);
    // Actualizando información encabezado reporte
    objectReportResume.state = 'entering_information';
    objectReportResume.percentageCompletition = 66;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Insertando Información';
    await reportFunctionsUpdate.updateReportCreator(objectReportResume);

    // Limpiando memoria general
    masterReportData = null;
    dailyAccount = null;
    supplierReportData = null;

    await Report1005.collection
      .insertMany(arrayGenerated)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = arrayGenerated.length;
        console.log('Insert Data Finish');
        async function finishReport() {
          // Actualizando información encabezado reporte
          objectReportResume.state = 'created_report';
          objectReportResume.percentageCompletition = 90;
          objectReportResume.counterRows = arrayGenerated.length;
          objectReportResume.message = 'Reporte cargado correctamente';
          objectReportResume.endDate = new Date();
          await reportFunctionsUpdate.updateReportCreator(objectReportResume);
        }
        finishReport();
      })
      .catch(function(error) {
        // Limpiando memoria general
        masterReportData = null;
        dailyAccount = null;
        supplierReportData = null;

        summaryLoadedData.message =
          reportGeneratorMessages.E_REPORT_GENERATOR_MS_03;
        console.log('Insert Data Finish');
        async function finishReport() {
          // Actualizando información encabezado reporte
          objectReportResume.state = 'error_report';
          objectReportResume.percentageCompletition = 0;
          objectReportResume.counterRows = 0;
          objectReportResume.message =
            'Ocurrió un error al generar el reporte de Entrada de Mercancias y Servicios. Por favor contácte a Soporte Técnico';
          objectReportResume.endDate = new Date();
          await reportFunctionsUpdate.updateReportCreator(objectReportResume);
        }
        finishReport();
        console.log(error);
      });
    if (summaryLoadedData.counter > 0) {
      console.log('voy a enviar de una vez la plantilla');
      this.sendReportCSV(req, res);
    }
    return summaryLoadedData;
  } catch (err) {
    throw err;
  }
};

// =========== Function to delete MasterReport
exports.deleteReport = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    await Report1005.collection.deleteMany({
      companyId: userInfo.companyId
    });

    // Defino objeto y variables estandar para el resumen de la carga
    const objectReportResume = {};
    objectReportResume.code = '1005GR';
    objectReportResume.companyId = userInfo.companyId;
    objectReportResume.startDate = null;
    objectReportResume.state = 'deleted_report';
    objectReportResume.percentageCompletition = 0;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Reporte borrado';
    objectReportResume.endDate = new Date();
    await reportFunctionsUpdate.updateReportCreator(objectReportResume);

    console.log('All Data successfully deleted');
    return true;
  } catch (err) {
    console.log(err);
  }
};

exports.sendReportCSV = async (req, res) => {
  try {
    const objectReportResume = {};
    objectReportResume.code = '1005GR';
    objectReportResume.startDate = new Date();

    console.log('>>>>>>>> TIEMPO DE INICIO xxxx');
    console.log(new Date());
    const userInfo = await userService.getUserInfo(req, res);
    objectReportResume.companyId = userInfo.companyId;
    objectReportResume.generatorUserId = userInfo._id;
    const reportInfo = await ReportCreator.find({
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

    // Actualizando información encabezado reporte
    objectReportResume.state = 'email_report_created';
    objectReportResume.percentageCompletition = 95;
    objectReportResume.counterRows = reportInfo[0].counterRows;
    objectReportResume.message =
      'Creando reporte para envío a correo electrónico';
    objectReportResume.endDate = null;
    await reportFunctionsUpdate.updateReportCreator(objectReportResume);

    console.log('>>>>>>>>>>>>  empecé a cargar en memoria');
    const reportData = await Report1005.find({
      companyId: userInfo.companyId
    }).lean();
    console.log('>>>>>>>>>>>>  cargado en memoria');

    const nameFile = 'REPORTE 1005';
    const pathTmp = path.resolve(__dirname, '../resources/uploads/');
    const pathx = `${pathTmp}//${nameFile}.csv`;
    const csvWriter = createCsvWriter({
      path: pathx,
      fieldDelimiter: ';',
      header: [
        { id: 'seniorAccountantId', title: 'Id Cuenta' },
        { id: 'accountingSeat', title: 'Asiento Contable' },
        { id: 'tipoDocumento', title: 'Tipo Documento' },
        {
          id: 'nroIdentificacion',
          title: 'Número de Identificación del Informado'
        },
        {
          id: 'dv',
          title: 'DV'
        },
        { id: 'primerApellido', title: 'Primer apellido del informado' },
        { id: 'segundoApellido', title: 'Segundo apellido del informado' },
        { id: 'primerNombre', title: 'Primer nombre del informado' },
        { id: 'segundoNombre', title: 'Otros nombres del informado' },
        { id: 'razonSocial', title: 'Razon social informado' },
        {
          id: 'impuestoDescontable',
          title: 'Impuesto descontable'
        },
        {
          id: 'ivaResultante',
          title: 'IVA Resultante por devoluciones'
        }
      ]
    });

    console.log(
      '>>>>>>>>>>>>  empecé a escribir en archivo con ',
      reportData.length
    );

    csvWriter.writeRecords(reportData).then(function() {
      console.log('Terminé de escribir el archivo');
      async function finishReport() {
        // Actualizando información encabezado reporte
        objectReportResume.state = 'email_send';
        objectReportResume.percentageCompletition = 100;
        objectReportResume.message =
          'Reporte enviado a correo electrónico del usuario';
        objectReportResume.endDate = new Date();
        await reportFunctionsUpdate.updateReportCreator(objectReportResume);
      }
      finishReport();

      let message = '';
      try {
        message = fs.readFileSync(
          path.resolve(
            __dirname,
            '../utils/emailTemplates/reportGenerator.html'
          ),
          'utf8'
        );
        message = message.replace(
          '$#$#$#USER#$#$#$',
          `${userInfo.name} ${userInfo.lastname}`
        );
        message = message.replace('$#$#$#REPORT_NAME#$#$#$', `${nameFile}`);
      } catch (err) {
        console.error(err);
      }
      email.sendEmailWithAttachments({
        email: userInfo.email,
        subject: 'Generación de Reportes',
        message: message,
        path: pathx
      });
    });
  } catch (err) {
    throw err;
  }
};
