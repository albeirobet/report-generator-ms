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
const ChartAccount = require('../models/chartAccountModel');
const EntryMerchandiseAndServicesReportReport = require('../models/entryMerchandiseAndServicesReportReportModel');
const Report1001 = require('../models/report1001Model');
const ReportCreator = require('../models/reportCreatorModel');
const reportGeneratorMessages = require('../utils/constants/reportGeneratorMessages');
const reportFunctionsUpdate = require('../utils/functions/reportFunctionsUpdate');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const userService = require('./userService');
const email = require('../utils/email');

// =========== Function to count records of reports
exports.generateReport = async (req, res) => {
  try {
    const objectReportResume = {};
    objectReportResume.code = '1001GR';
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
    await Report1001.collection.deleteMany({
      companyId: userInfo.companyId
    });
    const arrayGenerated = [];
    let objectGenerated = {};

    console.log(' =========  Cargando en memoria');
    let masterReportData = await EntryMerchandiseAndServicesReportReport.find({
      companyId: userInfo.companyId
      // , thirdId: { $in: ['5000986'] }
    }).lean();

    let chartAccount = await ChartAccount.find({
      companyId: userInfo.companyId
    }).lean();

    console.log(chartAccount.length);

    console.log('Cargada información Maestra en Memoria');
    for await (const reportData of masterReportData) {
      objectGenerated = {};
      objectGenerated.companyId = userInfo.companyId;
      objectGenerated.userId = userInfo._id;
      // console.log('CON LA CUENTA', reportData.seniorAccountantId);

      let nroIdentificacion = '';
      let valorReportado = '';
      let valorIva = null;

      // ==== ENCONTRANDO EL NUMERO DE IDENTIFICACIÓN DEL USUARIO
      if (reportData.thirdIDExtra && reportData.thirdIDExtra !== '#') {
        nroIdentificacion = reportData.thirdIDExtra;
      } else {
        if (reportData.thirdId && reportData.thirdId !== '#') {
          nroIdentificacion = reportData.thirdId;
        } else {
          if (
            reportData.businessPartnerID &&
            reportData.businessPartnerID !== '#'
          ) {
            nroIdentificacion = reportData.businessPartnerID;
          } else {
            if (
              reportData.supplierIdGenerated &&
              reportData.supplierIdGenerated !== '#'
            ) {
              nroIdentificacion = reportData.supplierIdGenerated;
            } else {
              if (reportData.supplierCoId && reportData.supplierCoId !== '#') {
                nroIdentificacion = reportData.supplierCoId;
              }
            }
          }
        }
      }
      // ==== FIN ENCONTRANDO EL NUMERO DE IDENTIFICACIÓN DEL USUARIO

      // ==== ENCONTRANDO EL VALOR A REPORTAR
      if (
        reportData.debtAmountCompanyCurrency &&
        reportData.debtAmountCompanyCurrency !== '#' &&
        reportData.debtAmountCompanyCurrency !== '0' &&
        reportData.debtAmountCompanyCurrency !== '0,00'
      ) {
        valorReportado = reportData.debtAmountCompanyCurrency;
      } else {
        if (
          reportData.creditAmountCompanyCurrency &&
          reportData.creditAmountCompanyCurrency !== '#' &&
          reportData.creditAmountCompanyCurrency !== '0' &&
          reportData.creditAmountCompanyCurrency !== '0,00'
        ) {
          valorReportado = reportData.creditAmountCompanyCurrency;
        }
      }
      // ==== FIN ENCONTRANDO EL VALOR A REPORTAR

      // ==== ENCONTRANDO EL IVA A REPORTAR
      if (
        reportData.ivaValueCalculated &&
        reportData.ivaValueCalculated !== '#' &&
        reportData.ivaValueCalculated !== '0' &&
        reportData.ivaValueCalculated !== '0,00'
      ) {
        valorIva = reportData.ivaValueCalculated;
      }
      // ==== FIN ENCONTRANDO EL IVA A REPORTAR

      if (nroIdentificacion.length < 1) {
        continue;
      }
      if (valorReportado.length < 1) {
        continue;
      }

      objectGenerated.nroIdentificacion = nroIdentificacion;

      // ENCONTRANDO INFORMACIÓN DE LA CUENTA ASOCIADA AL REGISTRO
      // const chartAccountData = chartAccount.filter(
      //   el => el.accountID === reportData.seniorAccountantId
      // );

      objectGenerated.seniorAccountantId = reportData.seniorAccountantId.toString();
      objectGenerated.invoiceIdGenerated = reportData.invoiceIdGenerated;
      objectGenerated.externalReferenceId = reportData.externalReferenceId;

      const chartAccountData = chartAccount.filter(el => {
        return (
          el.accountID.toString() === reportData.seniorAccountantId.toString()
        );
      });

      if (chartAccountData && chartAccountData.length > 0) {
        // RECORRIENDO INFORMACIÓN DE LA CUENTA ASOCIADA AL REGISTRO
        for await (const chartAccountRow of chartAccountData) {
          // console.log(
          //   `${chartAccountRow.accountID}  ${chartAccountRow.accountDescription} ${chartAccountRow.accountType} ${chartAccountRow.format} ${chartAccountRow.extraFormat} `
          // );
          const {
            format,
            accountType,
            concept,
            extraFormat,
            extraConcept,
            deductible,
            noDeductible,
            ivaDeductible,
            ivaNoDeductible
          } = chartAccountRow;
          let accountTypeTrim = null;
          if (accountType) {
            accountTypeTrim = accountType.trim();
          }

          if (accountTypeTrim && accountTypeTrim !== 'RET - Retenciones Ica') {
            // ==== INICIO DEFINICION DE CONCEPTO
            let defConcept = null;
            let defFormat = null;

            if (
              (format && format.length > 0 && format === '1001') ||
              format === 1001
            ) {
              defConcept = concept;
              defFormat = format;
            }
            if (!defConcept) {
              if (
                (extraFormat &&
                  extraFormat.length > 0 &&
                  extraFormat === '1001') ||
                extraFormat === 1001
              ) {
                defConcept = extraConcept;
                defFormat = extraFormat;
              }
            }
            // ==== Voy a romper el ciclo, no coincide con el formato 1001
            if (!defFormat) {
              break;
            }
            if (defConcept) {
              objectGenerated.concepto = defConcept;
            } else {
              objectGenerated.concepto = 'N/A';
            }
            // ==== FIN DEFINICION DE CONCEPTO

            // ==== INICIO DEFINICION DE PAGO (DEDUCIBLE, NO DEDUCIBLE INCLUYE IVA)
            if (
              accountTypeTrim &&
              accountTypeTrim !== 'RET - Retenciones Fuente' &&
              accountTypeTrim !== 'RET - Retenciones Iva'
            ) {
              // ==== PAGO
              if (deductible && deductible.length > 0) {
                objectGenerated.pagoDeducible = valorReportado;
              } else {
                if (noDeductible && noDeductible.length > 0) {
                  objectGenerated.pagoNoDeducible = valorReportado;
                }
              }

              if (!valorIva) {
                valorIva = 0;
              }
              // ==== IVA
              if (ivaDeductible && ivaDeductible.length > 0) {
                objectGenerated.ivaDeducible = valorIva;
              } else {
                if (ivaNoDeductible && ivaNoDeductible.length > 0) {
                  objectGenerated.ivaNoDeducible = valorIva;
                }
              }
            }
            // ==== FIN DEFINICION DE PAGO (DEDUCIBLE, NO DEDUCIBLE INCLUYE IVA)

            // ==== INICIO DEFINICION DEFINICION RETENCION EN LA FUENTE
            if (
              accountTypeTrim &&
              accountTypeTrim === 'RET - Retenciones Fuente'
            ) {
              objectGenerated.retencionFuentePracticada = valorReportado;
            }
            // ==== FIN DEFINICION DEFINICION RETENCION EN LA FUENTE

            // ==== INICIO DEFINICION DEFINICION RETENCION IVA
            if (
              accountTypeTrim &&
              accountTypeTrim === 'RET - Retenciones Iva'
            ) {
              objectGenerated.retencionFuenteIvaRegimenComun = valorReportado;
            }
            // ==== FIN DEFINICION DEFINICION RETENCION IVA
          }
        }
      }
      if (objectGenerated.concepto) {
        arrayGenerated.push(objectGenerated);
      }
    }
    const summaryLoadedData = new SummaryLoadedData('', 0);
    console.log('Insert Data Init ', arrayGenerated.length);
    // Actualizando información encabezado reporte
    objectReportResume.state = 'entering_information';
    objectReportResume.percentageCompletition = 66;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Insertando Información';
    await reportFunctionsUpdate.updateReportCreator(objectReportResume);

    // Limpiando memoria general
    masterReportData = null;
    chartAccount = null;

    await Report1001.collection
      .insertMany(arrayGenerated)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = arrayGenerated.length;
        console.log('Insert Data Finish');
        this.arrayGenerated = null;
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
        chartAccount = null;
        this.arrayGenerated = null;

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
    await Report1001.collection.deleteMany({
      companyId: userInfo.companyId
    });

    // Defino objeto y variables estandar para el resumen de la carga
    const objectReportResume = {};
    objectReportResume.code = '1001GR';
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
    objectReportResume.code = '1001GR';
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
    const reportData = await Report1001.find({
      companyId: userInfo.companyId
    }).lean();
    console.log('>>>>>>>>>>>>  cargado en memoria');

    const nameFile = 'REPORTE 1001';
    const pathTmp = path.resolve(__dirname, '../resources/uploads/');
    const pathx = `${pathTmp}//${nameFile}.csv`;
    const csvWriter = createCsvWriter({
      path: pathx,
      fieldDelimiter: ';',
      header: [
        { id: 'seniorAccountantId', title: 'Id Cuenta' },
        { id: 'invoiceIdGenerated', title: 'Id Factura' },
        { id: 'externalReferenceId', title: 'Id Factura' },

        { id: 'concepto', title: 'Concepto' },
        { id: 'tipoDocumento', title: 'Tipo Documento' },
        {
          id: 'nroIdentificacion',
          title: 'Número de Identificación del Informado'
        },
        { id: 'primerApellido', title: 'Primer apellido del informado' },
        { id: 'segundoApellido', title: 'Segundo apellido del informado' },
        { id: 'primerNombre', title: 'Primer nombre del informado' },
        { id: 'segundoNombre', title: 'Otros nombres del informado' },
        { id: 'razonSocial', title: 'Razon social informado' },
        { id: 'direccion', title: 'Dirección' },
        { id: 'codigoDepto', title: 'Codigo Dpto' },
        { id: 'codigoMpo', title: 'Codigo cp' },
        { id: 'paisResidencia', title: 'Pais de residencia o domicilio' },
        { id: 'pagoDeducible', title: 'Pago o abono en cuenta deducible' },
        { id: 'pagoNoDeducible', title: 'Pago o abono en cuenta no deducible' },
        { id: 'ivaDeducible', title: 'IVA mayor del costo o gasto deducible' },
        {
          id: 'ivaNoDeducible',
          title: 'IVA mayor del costo o gasto no deducible'
        },
        {
          id: 'retencionFuentePracticada',
          title: 'Retencion en la fuente practicada en renta'
        },
        {
          id: 'retencionFuenteAsumida',
          title: 'Retencion en la fuente asumida en renta'
        },
        {
          id: 'retencionFuenteIvaRegimenComun',
          title: 'Retencion en la fuente practicada IVA regimen comun'
        },
        {
          id: 'retencionFuenteIvaNoDomiciliados',
          title: 'Retencion en la fuente practicada IVA no domiciliados'
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
