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
const TaxSale = require('../models/taxSaleModel');
const Supplier = require('../models/supplierModel');
const Client = require('../models/clientModel');
const Report1006 = require('../models/report1006Model');
const ReportCreator = require('../models/reportCreatorModel');
const reportGeneratorMessages = require('../utils/constants/reportGeneratorMessages');
const reportFunctionsUpdate = require('../utils/functions/reportFunctionsUpdate');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const userService = require('./userService');
const email = require('../utils/email');
const ciudades = require('../utils/ciudades/api.json');

function getNum(val) {
  val = +val || 0;
  return val;
}

const removeAccents = str => {
  if (str) {
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } else {
    str = null;
  }
  return str;
};

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

function generateAddressData(
  ciudadesCorregidas,
  objectGenerated,
  supplierReportData,
  clientReportData
) {
  let codigoDepto = null;
  let codigoMpo = null;
  let paisResidencia = null;

  try {
    let supplierFound = null;
    supplierFound = clientReportData.find(
      el => el.identificationNumber === objectGenerated.nroIdentificacion
    );
    if (!supplierFound) {
      supplierFound = supplierReportData.find(
        el => el.supplier === objectGenerated.nroIdentificacion
      );
    }
    if (supplierFound) {
      objectGenerated = generatePersonalData(objectGenerated, supplierFound);
      let country = supplierFound.country;

      if (country) {
        country = removeAccents(country.toUpperCase());
        if (country.toUpperCase() === 'COLOMBIA') {
          paisResidencia = '169';
          let department = supplierFound.department;
          if (department) {
            department = removeAccents(department.toUpperCase());
            const departmentDane = ciudadesCorregidas.find(
              el => removeAccents(el.DEPARTAMENTO) === department
            );
            if (departmentDane) {
              let city = supplierFound.city;
              if (isNaN(city)) {
                city = removeAccents(city).toUpperCase();
                if (city.includes('BOGOTA')) {
                  codigoDepto = '11';
                  codigoMpo = '001';
                } else {
                  const cityDane = ciudadesCorregidas.find(
                    el =>
                      removeAccents(el.MUNICIPIO) === city &&
                      el.CODIGO_DANE_DEL_DEPARTAMENTO ===
                        departmentDane.CODIGO_DANE_DEL_DEPARTAMENTO
                  );
                  if (cityDane) {
                    const cityDaneParts = cityDane.CODIGO_DANE_DEL_MUNICIPIO.split(
                      ','
                    );
                    codigoDepto = cityDaneParts[0];
                    codigoMpo = cityDaneParts[1];
                  } else {
                    throw new Error('custom');
                  }
                }
              } else {
                const cityDane = ciudadesCorregidas.find(
                  el => el.CODIGO_DANE_DEL_MUNICIPIO_LIMPIO === city
                );
                if (cityDane) {
                  const cityDaneParts = cityDane.CODIGO_DANE_DEL_MUNICIPIO.split(
                    ','
                  );
                  codigoDepto = cityDaneParts[0];
                  codigoMpo = cityDaneParts[1];
                } else {
                  throw new Error('custom');
                }
              }
            } else {
              throw new Error('custom');
            }
          }
        } else {
          codigoDepto = '11';
          codigoMpo = '001';
          // Canada 149
          if (country === 'CANADA') {
            paisResidencia = '149';
          }
          // Estados unidos 249
          if (country === 'ESTADOS UNIDOS') {
            paisResidencia = '249';
          }
          //Mexico 493
          if (country === 'MEXICO') {
            paisResidencia = '493';
          }
        }
      } else {
        throw new Error('custom');
      }
    } else {
      objectGenerated.tipoDocumento = '43';
      objectGenerated.nroIdentificacion = '222222222';
      objectGenerated.razonSocial = `CUANTIAS MENORES PROVEEDOR NO ENCONTRADO ${objectGenerated.nroIdentificacion}`;
      objectGenerated.direccion = 'Cra. 26 #1068';
      objectGenerated.codigoDepto = '86';
      objectGenerated.codigoMpo = '568';
      objectGenerated.paisResidencia = '169';
      return objectGenerated;
    }
  } catch (err) {
    if (err.message === 'custom') {
      objectGenerated.codigoDepto = '86';
      objectGenerated.codigoMpo = '568';
      objectGenerated.paisResidencia = '169';
    } else {
      objectGenerated.tipoDocumento = '43';
      objectGenerated.nroIdentificacion = '222222222';
      objectGenerated.razonSocial = 'CUANTIAS MENORES ERROR NO CONTROLADO';
      objectGenerated.direccion = 'Cra. 26 #1068';
      objectGenerated.codigoDepto = '86';
      objectGenerated.codigoMpo = '568';
      objectGenerated.paisResidencia = '169';
    }
    return objectGenerated;
  }
  objectGenerated.codigoDepto = codigoDepto;
  objectGenerated.codigoMpo = codigoMpo;
  objectGenerated.paisResidencia = paisResidencia;
  return objectGenerated;
}
// =========== Function to count records of reports
exports.generateReport = async (req, res) => {
  try {
    const objectReportResume = {};
    objectReportResume.code = '1006GR';
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
    await Report1006.collection.deleteMany({
      companyId: userInfo.companyId
    });
    let arrayGenerated = [];
    let arrayGeneratedTmp = [];
    let objectGenerated = {};

    console.log(' =========  Cargando en memoria');
    let masterReportData = await TaxSale.find({
      companyId: userInfo.companyId
      // ,      identificationNumber: { $in: ['15571912'] }
    }).lean();

    console.log(
      'Cargada información Maestra en Memoria ',
      masterReportData.length
    );

    for await (const reportData of masterReportData) {
      objectGenerated = {};
      objectGenerated.companyId = userInfo.companyId;
      objectGenerated.userId = userInfo._id;
      objectGenerated.impuestoGenerado = reportData.tax;
      const thirdId = reportData.identificationNumber;
      let thirdIdDef = '#';
      if (thirdId !== '#') {
        thirdIdDef = thirdId;
      }
      if (thirdIdDef !== '#') {
        objectGenerated.nroIdentificacion = thirdIdDef;
        if (objectGenerated.nroIdentificacion) {
          arrayGenerated.push(objectGenerated);
        }
      } else {
        continue;
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
      objectGenerated = {};
      objectGenerated.companyId = userInfo.companyId;
      objectGenerated.userId = userInfo._id;
      objectGenerated.impuestoGenerado = 0;
      byCedulaList.forEach(function(docSum) {
        objectGenerated.nroIdentificacion = docSum.nroIdentificacion;
        // ==== Impuesto Descontable
        let impuestoGeneradoDef = 0;
        if (getNum(docSum.impuestoGenerado)) {
          impuestoGeneradoDef =
            getNum(objectGenerated.impuestoGenerado) +
            getNum(docSum.impuestoGenerado);
          objectGenerated.impuestoGenerado = impuestoGeneradoDef;
        }
      });
      arrayGenerated.push(objectGenerated);
    });

    arrayGeneratedTmp = arrayGenerated;
    arrayGenerated = [];

    // Voy a generar cuantias menores a 500.000
    objectGenerated = {};
    objectGenerated.companyId = userInfo.companyId;
    objectGenerated.userId = userInfo._id;
    objectGenerated.tipoDocumento = '43';
    objectGenerated.nroIdentificacion = '222222222';
    objectGenerated.razonSocial = 'CUANTIAS MENORES';
    objectGenerated.direccion = 'Cra. 26 #1068';
    objectGenerated.codigoDepto = '86';
    objectGenerated.codigoMpo = '568';
    objectGenerated.paisResidencia = '169';
    objectGenerated.impuestoGenerado = 0;
    arrayGeneratedTmp.forEach(function(rowFinal) {
      const impuestoGeneradoTmp = getNum(rowFinal.impuestoGenerado);
      const signus = Math.sign(impuestoGeneradoTmp);
      let flag = false;
      if (impuestoGeneradoTmp === 0) {
        flag = true;
      } else {
        if (signus === 1) {
          if (impuestoGeneradoTmp < 500000) {
            flag = true;
          } else {
            flag = false;
          }
        } else {
          if (signus === -1) {
            const impuestoGeneradoTmpPositive = impuestoGeneradoTmp * -1;
            if (impuestoGeneradoTmpPositive < 500000) {
              flag = true;
            } else {
              flag = false;
            }
          } else {
            flag = true;
          }
        }
      }
      if (flag) {
        let impuestoGeneradoDef = 0;
        impuestoGeneradoDef =
          getNum(objectGenerated.impuestoGenerado) + impuestoGeneradoTmp;
        objectGenerated.impuestoGenerado = impuestoGeneradoDef;
      } else {
        arrayGenerated.push(rowFinal);
      }
    });
    if (objectGenerated.impuestoGenerado !== 0) {
      arrayGenerated.push(objectGenerated);
    }

    // Generando información personal, direcciones
    // Corrigiendo datos DANE
    const ciudadesCorregidas = ciudades.map(p =>
      p.CODIGO_DANE_DEL_MUNICIPIO
        ? {
            ...p,
            CODIGO_DANE_DEL_MUNICIPIO_LIMPIO: p.CODIGO_DANE_DEL_MUNICIPIO.replace(
              ',',
              ''
            )
          }
        : p
    );

    // Cargando datos de proveedores en memoria
    console.log(' =========  Cargando proveedores en memoria');
    let supplierReportData = await Supplier.find({
      companyId: userInfo.companyId
    }).lean();
    console.log('Proveedores cargados', supplierReportData.length);

    // Cargando datos de clientes en memoria
    console.log(' =========  Cargando clientes en memoria');
    let clientReportData = await Client.find({
      companyId: userInfo.companyId
    }).lean();
    console.log('Clientes cargados', clientReportData.length);

    arrayGeneratedTmp = arrayGenerated;
    arrayGenerated = [];

    arrayGeneratedTmp.forEach(row => {
      if (row.nroIdentificacion !== '222222222') {
        const rowDef = generateAddressData(
          ciudadesCorregidas,
          row,
          supplierReportData,
          clientReportData
        );
        arrayGenerated.push(rowDef);
      } else {
        arrayGenerated.push(row);
      }
    });

    arrayGeneratedTmp = arrayGenerated;
    arrayGenerated = [];
    objectGenerated = {};
    objectGenerated.companyId = userInfo.companyId;
    objectGenerated.userId = userInfo._id;
    objectGenerated.tipoDocumento = '43';
    objectGenerated.nroIdentificacion = '222222222';
    objectGenerated.razonSocial = 'CUANTIAS MENORES';
    objectGenerated.direccion = 'Cra. 26 #1068';
    objectGenerated.codigoDepto = '86';
    objectGenerated.codigoMpo = '568';
    objectGenerated.paisResidencia = '169';
    objectGenerated.impuestoGenerado = 0;
    objectGenerated.seniorAccountantId = null;
    objectGenerated.concepto = null;
    arrayGeneratedTmp.forEach(row => {
      if (row.nroIdentificacion === '222222222') {
        const impuestoGeneradoTmp = getNum(row.impuestoGenerado);
        let impuestoGeneradoDef = 0;
        impuestoGeneradoDef =
          getNum(objectGenerated.impuestoGenerado) + impuestoGeneradoTmp;
        objectGenerated.impuestoGenerado = impuestoGeneradoDef;
      } else {
        arrayGenerated.push(row);
      }
    });
    if (objectGenerated.impuestoGenerado !== 0) {
      arrayGenerated.push(objectGenerated);
    }

    const summaryLoadedData = new SummaryLoadedData('', 0);
    // Actualizando información encabezado reporte
    objectReportResume.state = 'entering_information';
    objectReportResume.percentageCompletition = 66;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Insertando Información';
    await reportFunctionsUpdate.updateReportCreator(objectReportResume);

    // Limpiando memoria general
    masterReportData = null;
    supplierReportData = null;
    clientReportData = null;
    arrayGeneratedTmp = [];
    console.log('Insert Data init', arrayGenerated.length);
    await Report1006.collection
      .insertMany(arrayGenerated)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = arrayGenerated.length;
        console.log('Insert Data Finish', arrayGenerated.length);
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
        supplierReportData = null;
        clientReportData = null;

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
    await Report1006.collection.deleteMany({
      companyId: userInfo.companyId
    });

    // Defino objeto y variables estandar para el resumen de la carga
    const objectReportResume = {};
    objectReportResume.code = '1006GR';
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
    objectReportResume.code = '1006GR';
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
    const reportData = await Report1006.find({
      companyId: userInfo.companyId
    }).lean();
    console.log('>>>>>>>>>>>>  cargado en memoria');

    const nameFile = 'REPORTE 1006';
    const pathTmp = path.resolve(__dirname, '../resources/uploads/');
    const pathx = `${pathTmp}//${nameFile}.csv`;
    const csvWriter = createCsvWriter({
      path: pathx,
      fieldDelimiter: ';',
      header: [
        { id: 'tipoDocumento', title: 'Tipo Documento' },
        {
          id: 'nroIdentificacion',
          title: 'Número de Identificación acreedor'
        },
        {
          id: 'dv',
          title: 'DV'
        },
        { id: 'primerApellido', title: 'Primer apellido acreedor' },
        { id: 'segundoApellido', title: 'Segundo apellido acreedor' },
        { id: 'primerNombre', title: 'Primer nombre acreedor' },
        { id: 'segundoNombre', title: 'Otros nombres acreedor' },
        { id: 'razonSocial', title: 'Razon social acreedor' },
        {
          id: 'impuestoGenerado',
          title: 'Impuesto generado'
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
