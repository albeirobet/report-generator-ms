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
const ChartAccount = require('../models/chartAccountModel');
const EntryMerchandiseAndServicesReportReport = require('../models/entryMerchandiseAndServicesReportReportModel');
const Supplier = require('../models/supplierModel');
const Report1001 = require('../models/report1001Model');
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
  let razonSocial = null;
  let primerApellido = null;
  let segundoApellido = null;
  let primerNombre = null;
  let segundoNombre = null;
  direccion = supplierFound.address;
  if (identificationType === '31-Número de identificación tributaria') {
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
  supplierReportData
) {
  let codigoDepto = null;
  let codigoMpo = null;
  let paisResidencia = null;

  try {
    const supplierFound = supplierReportData.find(
      el => el.supplier === objectGenerated.nroIdentificacion
    );
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
      objectGenerated.razonSocial = 'CUANTIAS MENORES';
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
      objectGenerated.razonSocial = 'CUANTIAS MENORES';
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
    const arrayGeneratedDef = [];
    let objectGenerated = {};

    console.log(' =========  Cargando en memoria');
    let masterReportData = await EntryMerchandiseAndServicesReportReport.find({
      companyId: userInfo.companyId
      // ,       thirdId: { $in: ['5000477'] }
    }).lean();

    let chartAccount = await ChartAccount.find({
      companyId: userInfo.companyId
    }).lean();

    console.log(
      'Cargada información Maestra en Memoria ',
      masterReportData.length
    );
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

      valorReportado = reportData.balanceAmountCompanyCurrency;

      // ==== ENCONTRANDO EL IVA A REPORTAR
      if (
        reportData.ivaValueCalculated &&
        reportData.ivaValueCalculated !== '0' &&
        reportData.ivaValueCalculated !== '0,00' &&
        reportData.ivaValueCalculated !== '0.00'
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
              objectGenerated.concepto = 'RETFU';
            }
            // ==== FIN DEFINICION DEFINICION RETENCION EN LA FUENTE

            // ==== INICIO DEFINICION DEFINICION RETENCION IVA
            if (
              accountTypeTrim &&
              accountTypeTrim === 'RET - Retenciones Iva'
            ) {
              objectGenerated.retencionFuenteIvaRegimenComun = valorReportado;
              objectGenerated.concepto = 'RETIVA';
            }
            // ==== FIN DEFINICION DEFINICION RETENCION IVA
          }
        }
      }
      if (objectGenerated.concepto) {
        arrayGenerated.push(objectGenerated);
      }
    }

    // TEMPORAL
    // const arrayGeneratedDefinitivo = arrayGenerated;
    // ===========================================
    // ============= INICIA AGRUPACIÓN  ==========
    // ===========================================

    const nroCedulasUnicos = [];
    for (let i = 0; i < arrayGenerated.length; i++) {
      if (
        nroCedulasUnicos.indexOf(arrayGenerated[i].nroIdentificacion) === -1
      ) {
        nroCedulasUnicos.push(arrayGenerated[i].nroIdentificacion);
      }
    }
    nroCedulasUnicos.forEach(function(doc) {
      // console.log(doc);
      let byCedulaList = [];
      byCedulaList = arrayGenerated.filter(el => el.nroIdentificacion === doc);
      const conceptosUnicos = [];
      for (let i = 0; i < byCedulaList.length; i++) {
        if (conceptosUnicos.indexOf(byCedulaList[i].concepto) === -1) {
          conceptosUnicos.push(byCedulaList[i].concepto);
        }
      }
      conceptosUnicos.forEach(function(concepto, indexConceptos) {
        if (
          concepto !== 'N/A' &&
          concepto !== 'RETFU' &&
          concepto !== 'RETIVA'
        ) {
          let byConceptosList = [];
          byConceptosList = byCedulaList.filter(el => el.concepto === concepto);
          if (byConceptosList && byConceptosList.length > 0) {
            objectGenerated = {};
            byConceptosList.forEach(function(rowFinal, indexConceptosList) {
              objectGenerated.seniorAccountantId = rowFinal.seniorAccountantId;
              objectGenerated.invoiceIdGenerated = rowFinal.invoiceIdGenerated;
              objectGenerated.externalReferenceId =
                rowFinal.externalReferenceId;
              objectGenerated.concepto = rowFinal.concepto;
              objectGenerated.tipoDocumento = rowFinal.tipoDocumento;
              objectGenerated.nroIdentificacion = rowFinal.nroIdentificacion;
              objectGenerated.primerApellido = rowFinal.primerApellido;
              objectGenerated.segundoApellido = rowFinal.segundoApellido;
              objectGenerated.primerNombre = rowFinal.primerNombre;
              objectGenerated.segundoNombre = rowFinal.segundoNombre;
              objectGenerated.razonSocial = rowFinal.razonSocial;
              objectGenerated.direccion = rowFinal.direccion;
              objectGenerated.codigoDepto = rowFinal.codigoDepto;
              objectGenerated.codigoMpo = rowFinal.codigoMpo;
              objectGenerated.paisResidencia = rowFinal.paisResidencia;

              // ==== Pago Deducible
              let pagoDeducibleDef = 0;
              if (getNum(objectGenerated.pagoDeducible)) {
                pagoDeducibleDef =
                  getNum(objectGenerated.pagoDeducible) +
                  getNum(rowFinal.pagoDeducible);
              } else {
                const pagoDeducible = getNum(rowFinal.pagoDeducible);
                if (pagoDeducible) {
                  pagoDeducibleDef = pagoDeducible;
                }
              }
              objectGenerated.pagoDeducible = pagoDeducibleDef;

              // ==== Pago No Deducible
              let pagoNoDeducibleDef = 0;
              if (getNum(objectGenerated.pagoNoDeducible)) {
                pagoNoDeducibleDef =
                  getNum(objectGenerated.pagoNoDeducible) +
                  getNum(rowFinal.pagoNoDeducible);
              } else {
                const pagoNoDeducible = getNum(rowFinal.pagoNoDeducible);
                if (pagoNoDeducible) {
                  pagoNoDeducibleDef = pagoNoDeducible;
                }
              }
              objectGenerated.pagoNoDeducible = pagoNoDeducibleDef;

              // ==== IVA Deducible
              let ivaDeducibleDef = 0;
              if (getNum(objectGenerated.ivaDeducible)) {
                ivaDeducibleDef =
                  getNum(objectGenerated.ivaDeducible) +
                  getNum(rowFinal.ivaDeducible);
              } else {
                const ivaDeducible = getNum(rowFinal.ivaDeducible);
                if (ivaDeducible) {
                  ivaDeducibleDef = ivaDeducible;
                }
              }
              objectGenerated.ivaDeducible = ivaDeducibleDef;

              // ==== IVA NO Deducible
              let ivaNoDeducibleDef = 0;
              if (getNum(objectGenerated.ivaNoDeducible)) {
                ivaNoDeducibleDef =
                  getNum(objectGenerated.ivaNoDeducible) +
                  getNum(rowFinal.ivaNoDeducible);
              } else {
                const ivaNoDeducible = getNum(rowFinal.ivaNoDeducible);
                if (ivaNoDeducible) {
                  ivaNoDeducibleDef = ivaNoDeducible;
                }
              }
              objectGenerated.ivaNoDeducible = ivaNoDeducibleDef;

              // ==== Retencion Fuente Practicada
              let retencionFuentePracticadaDef = 0;
              if (getNum(objectGenerated.retencionFuentePracticada)) {
                retencionFuentePracticadaDef =
                  getNum(objectGenerated.retencionFuentePracticada) +
                  getNum(rowFinal.retencionFuentePracticada);
              } else {
                const retencionFuentePracticada = getNum(
                  rowFinal.retencionFuentePracticada
                );
                if (retencionFuentePracticada) {
                  retencionFuentePracticadaDef = retencionFuentePracticada;
                }
              }
              objectGenerated.retencionFuentePracticada = retencionFuentePracticadaDef;

              // ==== Retencion Fuente Asumida
              let retencionFuenteAsumidaDef = 0;
              if (getNum(objectGenerated.retencionFuenteAsumida)) {
                retencionFuenteAsumidaDef =
                  getNum(objectGenerated.retencionFuenteAsumida) +
                  getNum(rowFinal.retencionFuenteAsumida);
              } else {
                const retencionFuenteAsumida = getNum(
                  rowFinal.retencionFuenteAsumida
                );
                if (retencionFuenteAsumida) {
                  retencionFuenteAsumidaDef = retencionFuenteAsumida;
                }
              }
              objectGenerated.retencionFuenteAsumida = retencionFuenteAsumidaDef;

              // ==== Retencion Fuente  Iva Regimen Comun
              let retencionFuenteIvaRegimenComunDef = 0;
              if (getNum(objectGenerated.retencionFuenteIvaRegimenComun)) {
                retencionFuenteIvaRegimenComunDef =
                  getNum(objectGenerated.retencionFuenteIvaRegimenComun) +
                  getNum(rowFinal.retencionFuenteIvaRegimenComun);
              } else {
                const retencionFuenteIvaRegimenComun = getNum(
                  rowFinal.retencionFuenteIvaRegimenComun
                );
                if (retencionFuenteIvaRegimenComun) {
                  retencionFuenteIvaRegimenComunDef = retencionFuenteIvaRegimenComun;
                }
              }
              objectGenerated.retencionFuenteIvaRegimenComun = retencionFuenteIvaRegimenComunDef;

              // ==== Retencion Fuente  Iva  No domiciliados
              let retencionFuenteIvaNoDomiciliadosDef = 0;
              if (getNum(objectGenerated.retencionFuenteIvaNoDomiciliados)) {
                retencionFuenteIvaNoDomiciliadosDef =
                  getNum(objectGenerated.retencionFuenteIvaNoDomiciliados) +
                  getNum(rowFinal.retencionFuenteIvaNoDomiciliados);
              } else {
                const retencionFuenteIvaNoDomiciliados = getNum(
                  rowFinal.retencionFuenteIvaNoDomiciliados
                );
                if (retencionFuenteIvaNoDomiciliados) {
                  retencionFuenteIvaNoDomiciliadosDef = retencionFuenteIvaNoDomiciliados;
                }
              }
              objectGenerated.retencionFuenteIvaNoDomiciliados = retencionFuenteIvaNoDomiciliadosDef;
              delete byConceptosList[indexConceptosList];
            });
            objectGenerated.companyId = userInfo.companyId;
            objectGenerated.userId = userInfo._id;
            arrayGeneratedDef.push(objectGenerated);
            objectGenerated = {};
          }
        }
        delete conceptosUnicos[indexConceptos];
      });

      // ============ NUEVA LOGICA PARA TEMPORALES RETFU, RETIVA
      // arrayGeneratedDef.forEach(row => {
      const byCedulaListComplete = byCedulaList;
      let byConceptosList = byCedulaListComplete.filter(
        el => el.concepto === 'RETFU'
      );
      if (byConceptosList && byConceptosList.length > 0) {
        // console.log('EN RETFU');
        byCedulaList = arrayGeneratedDef.filter(
          el => el.nroIdentificacion === doc
        );
        byCedulaList.every(row => {
          byConceptosList.forEach(function(rowFinal) {
            // ==== Retencion Fuente Practicada
            let retencionFuentePracticadaDef = 0;
            if (getNum(row.retencionFuentePracticada)) {
              retencionFuentePracticadaDef =
                getNum(row.retencionFuentePracticada) +
                getNum(rowFinal.retencionFuentePracticada);
            } else {
              const retencionFuentePracticada = getNum(
                rowFinal.retencionFuentePracticada
              );
              if (retencionFuentePracticada) {
                retencionFuentePracticadaDef = retencionFuentePracticada;
              }
            }
            row.retencionFuentePracticada = retencionFuentePracticadaDef;

            // ==== Retencion Fuente Asumida
            let retencionFuenteAsumidaDef = 0;
            if (getNum(row.retencionFuenteAsumida)) {
              retencionFuenteAsumidaDef =
                getNum(row.retencionFuenteAsumida) +
                getNum(rowFinal.retencionFuenteAsumida);
            } else {
              const retencionFuenteAsumida = getNum(
                rowFinal.retencionFuenteAsumida
              );
              if (retencionFuenteAsumida) {
                retencionFuenteAsumidaDef = retencionFuenteAsumida;
              }
            }
            row.retencionFuenteAsumida = retencionFuenteAsumidaDef;

            // ==== Retencion Fuente  Iva Regimen Comun
            let retencionFuenteIvaRegimenComunDef = 0;
            if (getNum(row.retencionFuenteIvaRegimenComun)) {
              retencionFuenteIvaRegimenComunDef =
                getNum(row.retencionFuenteIvaRegimenComun) +
                getNum(rowFinal.retencionFuenteIvaRegimenComun);
            } else {
              const retencionFuenteIvaRegimenComun = getNum(
                rowFinal.retencionFuenteIvaRegimenComun
              );
              if (retencionFuenteIvaRegimenComun) {
                retencionFuenteIvaRegimenComunDef = retencionFuenteIvaRegimenComun;
              }
            }
            row.retencionFuenteIvaRegimenComun = retencionFuenteIvaRegimenComunDef;

            // ==== Retencion Fuente  Iva  No domiciliados
            let retencionFuenteIvaNoDomiciliadosDef = 0;
            if (getNum(row.retencionFuenteIvaNoDomiciliados)) {
              retencionFuenteIvaNoDomiciliadosDef =
                getNum(row.retencionFuenteIvaNoDomiciliados) +
                getNum(rowFinal.retencionFuenteIvaNoDomiciliados);
            } else {
              const retencionFuenteIvaNoDomiciliados = getNum(
                rowFinal.retencionFuenteIvaNoDomiciliados
              );
              if (retencionFuenteIvaNoDomiciliados) {
                retencionFuenteIvaNoDomiciliadosDef = retencionFuenteIvaNoDomiciliados;
              }
            }
            row.retencionFuenteIvaNoDomiciliados = retencionFuenteIvaNoDomiciliadosDef;

            // byConceptosList.splice(index, 1);
            // delete byConceptosList[index];
          });
          return false;
        });
      }

      byConceptosList = byCedulaListComplete.filter(
        el => el.concepto === 'RETIVA'
      );
      if (byConceptosList && byConceptosList.length > 0) {
        // console.log('EN RETIVA');
        byCedulaList = arrayGeneratedDef.filter(
          el => el.nroIdentificacion === doc
        );
        byCedulaList.every(row => {
          byConceptosList.forEach(function(rowFinal) {
            // ==== Retencion Fuente Practicada
            let retencionFuentePracticadaDef = 0;
            if (getNum(row.retencionFuentePracticada)) {
              retencionFuentePracticadaDef =
                getNum(row.retencionFuentePracticada) +
                getNum(rowFinal.retencionFuentePracticada);
            } else {
              const retencionFuentePracticada = getNum(
                rowFinal.retencionFuentePracticada
              );
              if (retencionFuentePracticada) {
                retencionFuentePracticadaDef = retencionFuentePracticada;
              }
            }
            row.retencionFuentePracticada = retencionFuentePracticadaDef;

            // ==== Retencion Fuente Asumida
            let retencionFuenteAsumidaDef = 0;
            if (getNum(row.retencionFuenteAsumida)) {
              retencionFuenteAsumidaDef =
                getNum(row.retencionFuenteAsumida) +
                getNum(rowFinal.retencionFuenteAsumida);
            } else {
              const retencionFuenteAsumida = getNum(
                rowFinal.retencionFuenteAsumida
              );
              if (retencionFuenteAsumida) {
                retencionFuenteAsumidaDef = retencionFuenteAsumida;
              }
            }
            row.retencionFuenteAsumida = retencionFuenteAsumidaDef;

            // ==== Retencion Fuente  Iva Regimen Comun
            let retencionFuenteIvaRegimenComunDef = 0;
            if (getNum(row.retencionFuenteIvaRegimenComun)) {
              retencionFuenteIvaRegimenComunDef =
                getNum(row.retencionFuenteIvaRegimenComun) +
                getNum(rowFinal.retencionFuenteIvaRegimenComun);
            } else {
              const retencionFuenteIvaRegimenComun = getNum(
                rowFinal.retencionFuenteIvaRegimenComun
              );
              if (retencionFuenteIvaRegimenComun) {
                retencionFuenteIvaRegimenComunDef = retencionFuenteIvaRegimenComun;
              }
            }
            row.retencionFuenteIvaRegimenComun = retencionFuenteIvaRegimenComunDef;

            // ==== Retencion Fuente  Iva  No domiciliados
            let retencionFuenteIvaNoDomiciliadosDef = 0;
            if (getNum(row.retencionFuenteIvaNoDomiciliados)) {
              retencionFuenteIvaNoDomiciliadosDef =
                getNum(row.retencionFuenteIvaNoDomiciliados) +
                getNum(rowFinal.retencionFuenteIvaNoDomiciliados);
            } else {
              const retencionFuenteIvaNoDomiciliados = getNum(
                rowFinal.retencionFuenteIvaNoDomiciliados
              );
              if (retencionFuenteIvaNoDomiciliados) {
                retencionFuenteIvaNoDomiciliadosDef = retencionFuenteIvaNoDomiciliados;
              }
            }
            row.retencionFuenteIvaNoDomiciliados = retencionFuenteIvaNoDomiciliadosDef;

            // byConceptosList.splice(index, 1);
            // delete byConceptosList[index];
          });
          return false;
        });
      }

      // }

      // ============ FIN LOGICA PARA TEMPORALES RETFU, RETIVA

      // byConceptosList = byCedulaListComplete.filter(
      //   el => el.concepto === 'N/A'
      // );

      // if (byConceptosList && byConceptosList.length > 0) {
      //   arrayGeneratedDef.forEach(row => {
      //     byConceptosList.forEach(function(rowFinal, index) {
      //       if (row.invoiceIdGenerated === rowFinal.invoiceIdGenerated) {
      //         // ==== Pago Deducible
      //         let pagoDeducibleDef = 0;
      //         if (getNum(row.pagoDeducible)) {
      //           pagoDeducibleDef =
      //             getNum(row.pagoDeducible) + getNum(rowFinal.pagoDeducible);
      //         } else {
      //           const pagoDeducible = getNum(rowFinal.pagoDeducible);
      //           if (pagoDeducible) {
      //             pagoDeducibleDef = pagoDeducible;
      //           }
      //         }
      //         row.pagoDeducible = pagoDeducibleDef;

      //         // ==== Pago No Deducible
      //         let pagoNoDeducibleDef = 0;
      //         if (getNum(row.pagoNoDeducible)) {
      //           pagoNoDeducibleDef =
      //             getNum(row.pagoNoDeducible) +
      //             getNum(rowFinal.pagoNoDeducible);
      //         } else {
      //           const pagoNoDeducible = getNum(rowFinal.pagoNoDeducible);
      //           if (pagoNoDeducible) {
      //             pagoNoDeducibleDef = pagoNoDeducible;
      //           }
      //         }
      //         row.pagoNoDeducible = pagoNoDeducibleDef;

      //         // ==== IVA Deducible
      //         let ivaDeducibleDef = 0;
      //         if (getNum(row.ivaDeducible)) {
      //           ivaDeducibleDef =
      //             getNum(row.ivaDeducible) + getNum(rowFinal.ivaDeducible);
      //         } else {
      //           const ivaDeducible = getNum(rowFinal.ivaDeducible);
      //           if (ivaDeducible) {
      //             ivaDeducibleDef = ivaDeducible;
      //           }
      //         }
      //         row.ivaDeducible = ivaDeducibleDef;

      //         // ==== IVA NO Deducible
      //         let ivaNoDeducibleDef = 0;
      //         if (getNum(row.ivaNoDeducible)) {
      //           ivaNoDeducibleDef =
      //             getNum(row.ivaNoDeducible) + getNum(rowFinal.ivaNoDeducible);
      //         } else {
      //           const ivaNoDeducible = getNum(rowFinal.ivaNoDeducible);
      //           if (ivaNoDeducible) {
      //             ivaNoDeducibleDef = ivaNoDeducible;
      //           }
      //         }
      //         row.ivaNoDeducible = ivaNoDeducibleDef;

      //         // ==== Retencion Fuente Practicada
      //         let retencionFuentePracticadaDef = 0;
      //         if (getNum(row.retencionFuentePracticada)) {
      //           retencionFuentePracticadaDef =
      //             getNum(row.retencionFuentePracticada) +
      //             getNum(rowFinal.retencionFuentePracticada);
      //         } else {
      //           const retencionFuentePracticada = getNum(
      //             rowFinal.retencionFuentePracticada
      //           );
      //           if (retencionFuentePracticada) {
      //             retencionFuentePracticadaDef = retencionFuentePracticada;
      //           }
      //         }
      //         row.retencionFuentePracticada = retencionFuentePracticadaDef;

      //         // ==== Retencion Fuente Asumida
      //         let retencionFuenteAsumidaDef = 0;
      //         if (getNum(row.retencionFuenteAsumida)) {
      //           retencionFuenteAsumidaDef =
      //             getNum(row.retencionFuenteAsumida) +
      //             getNum(rowFinal.retencionFuenteAsumida);
      //         } else {
      //           const retencionFuenteAsumida = getNum(
      //             rowFinal.retencionFuenteAsumida
      //           );
      //           if (retencionFuenteAsumida) {
      //             retencionFuenteAsumidaDef = retencionFuenteAsumida;
      //           }
      //         }
      //         row.retencionFuenteAsumida = retencionFuenteAsumidaDef;

      //         // ==== Retencion Fuente  Iva Regimen Comun
      //         let retencionFuenteIvaRegimenComunDef = 0;
      //         if (getNum(row.retencionFuenteIvaRegimenComun)) {
      //           retencionFuenteIvaRegimenComunDef =
      //             getNum(row.retencionFuenteIvaRegimenComun) +
      //             getNum(rowFinal.retencionFuenteIvaRegimenComun);
      //         } else {
      //           const retencionFuenteIvaRegimenComun = getNum(
      //             rowFinal.retencionFuenteIvaRegimenComun
      //           );
      //           if (retencionFuenteIvaRegimenComun) {
      //             retencionFuenteIvaRegimenComunDef = retencionFuenteIvaRegimenComun;
      //           }
      //         }
      //         row.retencionFuenteIvaRegimenComun = retencionFuenteIvaRegimenComunDef;

      //         // ==== Retencion Fuente  Iva  No domiciliados
      //         let retencionFuenteIvaNoDomiciliadosDef = 0;
      //         if (getNum(row.retencionFuenteIvaNoDomiciliados)) {
      //           retencionFuenteIvaNoDomiciliadosDef =
      //             getNum(row.retencionFuenteIvaNoDomiciliados) +
      //             getNum(rowFinal.retencionFuenteIvaNoDomiciliados);
      //         } else {
      //           const retencionFuenteIvaNoDomiciliados = getNum(
      //             rowFinal.retencionFuenteIvaNoDomiciliados
      //           );
      //           if (retencionFuenteIvaNoDomiciliados) {
      //             retencionFuenteIvaNoDomiciliadosDef = retencionFuenteIvaNoDomiciliados;
      //           }
      //         }
      //         row.retencionFuenteIvaNoDomiciliados = retencionFuenteIvaNoDomiciliadosDef;

      //         // byConceptosList.splice(index, 1);
      //         delete byConceptosList[index];
      //       } else {
      //         let tempExternalReferenceId = rowFinal.externalReferenceId;
      //         let invoiceIdGenerated = row.invoiceIdGenerated;
      //         if (tempExternalReferenceId) {
      //           tempExternalReferenceId = tempExternalReferenceId.replace(
      //             /\s/g,
      //             ''
      //           );
      //           tempExternalReferenceId = tempExternalReferenceId.replace(
      //             /-/,
      //             ''
      //           );
      //         }
      //         if (invoiceIdGenerated) {
      //           invoiceIdGenerated = invoiceIdGenerated.replace(/\s/g, '');
      //           invoiceIdGenerated = invoiceIdGenerated.replace(/-/, '');
      //         }

      //         if (tempExternalReferenceId.includes(invoiceIdGenerated)) {
      //           // ==== Pago Deducible
      //           let pagoDeducibleDef = 0;
      //           if (getNum(row.pagoDeducible)) {
      //             pagoDeducibleDef =
      //               getNum(row.pagoDeducible) + getNum(rowFinal.pagoDeducible);
      //           } else {
      //             const pagoDeducible = getNum(rowFinal.pagoDeducible);
      //             if (pagoDeducible) {
      //               pagoDeducibleDef = pagoDeducible;
      //             }
      //           }
      //           row.pagoDeducible = pagoDeducibleDef;

      //           // ==== Pago No Deducible
      //           let pagoNoDeducibleDef = 0;
      //           if (getNum(row.pagoNoDeducible)) {
      //             pagoNoDeducibleDef =
      //               getNum(row.pagoNoDeducible) +
      //               getNum(rowFinal.pagoNoDeducible);
      //           } else {
      //             const pagoNoDeducible = getNum(rowFinal.pagoNoDeducible);
      //             if (pagoNoDeducible) {
      //               pagoNoDeducibleDef = pagoNoDeducible;
      //             }
      //           }
      //           row.pagoNoDeducible = pagoNoDeducibleDef;

      //           // ==== IVA Deducible
      //           let ivaDeducibleDef = 0;
      //           if (getNum(row.ivaDeducible)) {
      //             ivaDeducibleDef =
      //               getNum(row.ivaDeducible) + getNum(rowFinal.ivaDeducible);
      //           } else {
      //             const ivaDeducible = getNum(rowFinal.ivaDeducible);
      //             if (ivaDeducible) {
      //               ivaDeducibleDef = ivaDeducible;
      //             }
      //           }
      //           row.ivaDeducible = ivaDeducibleDef;

      //           // ==== IVA NO Deducible
      //           let ivaNoDeducibleDef = 0;
      //           if (getNum(row.ivaNoDeducible)) {
      //             ivaNoDeducibleDef =
      //               getNum(row.ivaNoDeducible) +
      //               getNum(rowFinal.ivaNoDeducible);
      //           } else {
      //             const ivaNoDeducible = getNum(rowFinal.ivaNoDeducible);
      //             if (ivaNoDeducible) {
      //               ivaNoDeducibleDef = ivaNoDeducible;
      //             }
      //           }
      //           row.ivaNoDeducible = ivaNoDeducibleDef;

      //           // ==== Retencion Fuente Practicada
      //           let retencionFuentePracticadaDef = 0;
      //           if (getNum(row.retencionFuentePracticada)) {
      //             retencionFuentePracticadaDef =
      //               getNum(row.retencionFuentePracticada) +
      //               getNum(rowFinal.retencionFuentePracticada);
      //           } else {
      //             const retencionFuentePracticada = getNum(
      //               rowFinal.retencionFuentePracticada
      //             );
      //             if (retencionFuentePracticada) {
      //               retencionFuentePracticadaDef = retencionFuentePracticada;
      //             }
      //           }
      //           row.retencionFuentePracticada = retencionFuentePracticadaDef;

      //           // ==== Retencion Fuente Asumida
      //           let retencionFuenteAsumidaDef = 0;
      //           if (getNum(row.retencionFuenteAsumida)) {
      //             retencionFuenteAsumidaDef =
      //               getNum(row.retencionFuenteAsumida) +
      //               getNum(rowFinal.retencionFuenteAsumida);
      //           } else {
      //             const retencionFuenteAsumida = getNum(
      //               rowFinal.retencionFuenteAsumida
      //             );
      //             if (retencionFuenteAsumida) {
      //               retencionFuenteAsumidaDef = retencionFuenteAsumida;
      //             }
      //           }
      //           row.retencionFuenteAsumida = retencionFuenteAsumidaDef;

      //           // ==== Retencion Fuente  Iva Regimen Comun
      //           let retencionFuenteIvaRegimenComunDef = 0;
      //           if (getNum(row.retencionFuenteIvaRegimenComun)) {
      //             retencionFuenteIvaRegimenComunDef =
      //               getNum(row.retencionFuenteIvaRegimenComun) +
      //               getNum(rowFinal.retencionFuenteIvaRegimenComun);
      //           } else {
      //             const retencionFuenteIvaRegimenComun = getNum(
      //               rowFinal.retencionFuenteIvaRegimenComun
      //             );
      //             if (retencionFuenteIvaRegimenComun) {
      //               retencionFuenteIvaRegimenComunDef = retencionFuenteIvaRegimenComun;
      //             }
      //           }
      //           row.retencionFuenteIvaRegimenComun = retencionFuenteIvaRegimenComunDef;

      //           // ==== Retencion Fuente  Iva  No domiciliados
      //           let retencionFuenteIvaNoDomiciliadosDef = 0;
      //           if (getNum(row.retencionFuenteIvaNoDomiciliados)) {
      //             retencionFuenteIvaNoDomiciliadosDef =
      //               getNum(row.retencionFuenteIvaNoDomiciliados) +
      //               getNum(rowFinal.retencionFuenteIvaNoDomiciliados);
      //           } else {
      //             const retencionFuenteIvaNoDomiciliados = getNum(
      //               rowFinal.retencionFuenteIvaNoDomiciliados
      //             );
      //             if (retencionFuenteIvaNoDomiciliados) {
      //               retencionFuenteIvaNoDomiciliadosDef = retencionFuenteIvaNoDomiciliados;
      //             }
      //           }
      //           row.retencionFuenteIvaNoDomiciliados = retencionFuenteIvaNoDomiciliadosDef;
      //           // byConceptosList.splice(index, 1);
      //           // delete byConceptosList[index];
      //         }
      //       }
      //     });
      //   });
      // }
    });

    //  console.table(arrayGeneratedDef);
    let arrayGeneratedDefinitivo = [];
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
    arrayGeneratedDef.forEach(function(rowFinal) {
      const pagoDeducibleTmp = getNum(rowFinal.pagoDeducible);
      const pagoNoDeducibleTmp = getNum(rowFinal.pagoNoDeducible);

      let flagPagos = false;
      let flagGeneral = false;
      if (pagoDeducibleTmp > 0) {
        flagPagos = true;
      }
      if (pagoNoDeducibleTmp > 0) {
        flagPagos = true;
      }

      if (flagPagos) {
        if (pagoDeducibleTmp < 100000 && pagoNoDeducibleTmp === 0) {
          flagGeneral = true;
        } else if (pagoNoDeducibleTmp < 100000 && pagoDeducibleTmp === 0) {
          flagGeneral = true;
        } else {
          flagGeneral = false;
        }
      }
      if (flagGeneral) {
        // ==== Pago Deducible
        let pagoDeducibleDef = 0;
        if (getNum(objectGenerated.pagoDeducible)) {
          pagoDeducibleDef =
            getNum(objectGenerated.pagoDeducible) +
            getNum(rowFinal.pagoDeducible);
        } else {
          const pagoDeducible = getNum(rowFinal.pagoDeducible);
          if (pagoDeducible) {
            pagoDeducibleDef = pagoDeducible;
          }
        }
        objectGenerated.pagoDeducible = pagoDeducibleDef;

        // ==== Pago No Deducible
        let pagoNoDeducibleDef = 0;
        if (getNum(objectGenerated.pagoNoDeducible)) {
          pagoNoDeducibleDef =
            getNum(objectGenerated.pagoNoDeducible) +
            getNum(rowFinal.pagoNoDeducible);
        } else {
          const pagoNoDeducible = getNum(rowFinal.pagoNoDeducible);
          if (pagoNoDeducible) {
            pagoNoDeducibleDef = pagoNoDeducible;
          }
        }
        objectGenerated.pagoNoDeducible = pagoNoDeducibleDef;

        // ==== IVA Deducible
        let ivaDeducibleDef = 0;
        if (getNum(objectGenerated.ivaDeducible)) {
          ivaDeducibleDef =
            getNum(objectGenerated.ivaDeducible) +
            getNum(rowFinal.ivaDeducible);
        } else {
          const ivaDeducible = getNum(rowFinal.ivaDeducible);
          if (ivaDeducible) {
            ivaDeducibleDef = ivaDeducible;
          }
        }
        objectGenerated.ivaDeducible = ivaDeducibleDef;

        // ==== IVA NO Deducible
        let ivaNoDeducibleDef = 0;
        if (getNum(objectGenerated.ivaNoDeducible)) {
          ivaNoDeducibleDef =
            getNum(objectGenerated.ivaNoDeducible) +
            getNum(rowFinal.ivaNoDeducible);
        } else {
          const ivaNoDeducible = getNum(rowFinal.ivaNoDeducible);
          if (ivaNoDeducible) {
            ivaNoDeducibleDef = ivaNoDeducible;
          }
        }
        objectGenerated.ivaNoDeducible = ivaNoDeducibleDef;

        // ==== Retencion Fuente Practicada
        let retencionFuentePracticadaDef = 0;
        if (getNum(objectGenerated.retencionFuentePracticada)) {
          retencionFuentePracticadaDef =
            getNum(objectGenerated.retencionFuentePracticada) +
            getNum(rowFinal.retencionFuentePracticada);
        } else {
          const retencionFuentePracticada = getNum(
            rowFinal.retencionFuentePracticada
          );
          if (retencionFuentePracticada) {
            retencionFuentePracticadaDef = retencionFuentePracticada;
          }
        }
        objectGenerated.retencionFuentePracticada = retencionFuentePracticadaDef;

        // ==== Retencion Fuente Asumida
        let retencionFuenteAsumidaDef = 0;
        if (getNum(objectGenerated.retencionFuenteAsumida)) {
          retencionFuenteAsumidaDef =
            getNum(objectGenerated.retencionFuenteAsumida) +
            getNum(rowFinal.retencionFuenteAsumida);
        } else {
          const retencionFuenteAsumida = getNum(
            rowFinal.retencionFuenteAsumida
          );
          if (retencionFuenteAsumida) {
            retencionFuenteAsumidaDef = retencionFuenteAsumida;
          }
        }
        objectGenerated.retencionFuenteAsumida = retencionFuenteAsumidaDef;

        // ==== Retencion Fuente  Iva Regimen Comun
        let retencionFuenteIvaRegimenComunDef = 0;
        if (getNum(objectGenerated.retencionFuenteIvaRegimenComun)) {
          retencionFuenteIvaRegimenComunDef =
            getNum(objectGenerated.retencionFuenteIvaRegimenComun) +
            getNum(rowFinal.retencionFuenteIvaRegimenComun);
        } else {
          const retencionFuenteIvaRegimenComun = getNum(
            rowFinal.retencionFuenteIvaRegimenComun
          );
          if (retencionFuenteIvaRegimenComun) {
            retencionFuenteIvaRegimenComunDef = retencionFuenteIvaRegimenComun;
          }
        }
        objectGenerated.retencionFuenteIvaRegimenComun = retencionFuenteIvaRegimenComunDef;

        // ==== Retencion Fuente  Iva  No domiciliados
        let retencionFuenteIvaNoDomiciliadosDef = 0;
        if (getNum(objectGenerated.retencionFuenteIvaNoDomiciliados)) {
          retencionFuenteIvaNoDomiciliadosDef =
            getNum(objectGenerated.retencionFuenteIvaNoDomiciliados) +
            getNum(rowFinal.retencionFuenteIvaNoDomiciliados);
        } else {
          const retencionFuenteIvaNoDomiciliados = getNum(
            rowFinal.retencionFuenteIvaNoDomiciliados
          );
          if (retencionFuenteIvaNoDomiciliados) {
            retencionFuenteIvaNoDomiciliadosDef = retencionFuenteIvaNoDomiciliados;
          }
        }
        objectGenerated.retencionFuenteIvaNoDomiciliados = retencionFuenteIvaNoDomiciliadosDef;
        objectGenerated.companyId = userInfo.companyId;
        objectGenerated.userId = userInfo._id;
        //arrayGeneratedDef[index];
      } else {
        arrayGeneratedDefinitivo.push(rowFinal);
      }
    });
    arrayGeneratedDefinitivo.push(objectGenerated);
    objectGenerated = {};
    // ====== RECORRIENDO FINALMENTE PARA ELIMINAR RETENCIONES O IVA SI EL PAGO DEDUCIBLE ES CERO
    arrayGeneratedDefinitivo.forEach(row => {
      if (getNum(row.pagoDeducible) === 0) {
        row.pagoNoDeducible = 0;
        row.ivaDeducible = 0;
        row.ivaNoDeducible = 0;
        row.retencionFuentePracticada = 0;
        row.retencionFuenteAsumida = 0;
        row.retencionFuenteIvaRegimenComun = 0;
        row.retencionFuenteIvaNoDomiciliados = 0;
      }
    });
    // ====== FIN RECORRIENDO FINALMENTE PARA ELIMINAR RETENCIONES O IVA SI EL PAGO DEDUCIBLE ES CERO

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
    const supplierReportData = await Supplier.find({
      companyId: userInfo.companyId
    }).lean();
    console.log('Proveedores cargados', supplierReportData.length);
    const copyArrayGeneratedDefinitivo = arrayGeneratedDefinitivo;
    arrayGeneratedDefinitivo = [];

    copyArrayGeneratedDefinitivo.forEach(row => {
      if (row.nroIdentificacion !== '222222222') {
        const rowDef = generateAddressData(
          ciudadesCorregidas,
          row,
          supplierReportData
        );
        arrayGeneratedDefinitivo.push(rowDef);
      } else {
        arrayGeneratedDefinitivo.push(row);
      }
    });

    // ===========================================
    // ============= FINALIZA AGRUPACIÓN  ==========
    // ===========================================
    console.log('Insert Data Init ', arrayGeneratedDefinitivo.length);

    const summaryLoadedData = new SummaryLoadedData('', 0);
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
      .insertMany(arrayGeneratedDefinitivo)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = arrayGeneratedDefinitivo.length;
        console.log('Insert Data Finish');
        this.arrayGeneratedDefinitivo = null;
        async function finishReport() {
          // Actualizando información encabezado reporte
          objectReportResume.state = 'created_report';
          objectReportResume.percentageCompletition = 90;
          objectReportResume.counterRows = arrayGeneratedDefinitivo.length;
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
        this.arrayGeneratedDefinitivo = null;

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
        { id: 'codigoMpo', title: 'Codigo Mcp' },
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
