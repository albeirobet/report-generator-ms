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
const Report1001 = require('../models/report1001Model');
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
      //, businessPartnerID: { $in: ['5000103'] }
    }).lean();

    let chartAccount = await ChartAccount.find({
      companyId: userInfo.companyId
    }).lean();

    console.log(chartAccount.length);

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
    let nroCedulasUnicos = [];
    for (let i = 0; i < arrayGenerated.length; i++) {
      if (
        nroCedulasUnicos.indexOf(arrayGenerated[i].nroIdentificacion) === -1
      ) {
        nroCedulasUnicos.push(arrayGenerated[i].nroIdentificacion);
      }
    }

    nroCedulasUnicos = [...new Set(nroCedulasUnicos)];

    nroCedulasUnicos.forEach(function(doc, indey) {
      let byCedulaList = [];
      byCedulaList = arrayGenerated.filter(el => el.nroIdentificacion === doc);

      const conceptosUnicos = [];
      for (let i = 0; i < byCedulaList.length; i++) {
        if (conceptosUnicos.indexOf(byCedulaList[i].concepto) === -1) {
          conceptosUnicos.push(byCedulaList[i].concepto);
        }
      }
      conceptosUnicos.forEach(function(concepto, indexConceptos) {
        if (concepto !== 'N/A') {
          let byConceptosList = [];
          byConceptosList = arrayGenerated.filter(
            el => el.concepto === concepto
          );
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

      // const byConceptosList = arrayGenerated.filter(
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
      //           delete byConceptosList[index];
      //         }
      //       }
      //     });
      //   });
      // }

      nroCedulasUnicos.splice(indey, 1);
    });

    //  console.table(arrayGeneratedDef);

    console.log('Insert Data Init ', arrayGeneratedDef.length);

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
      .insertMany(arrayGeneratedDef)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = arrayGeneratedDef.length;
        console.log('Insert Data Finish');
        this.arrayGeneratedDef = null;
        async function finishReport() {
          // Actualizando información encabezado reporte
          objectReportResume.state = 'created_report';
          objectReportResume.percentageCompletition = 90;
          objectReportResume.counterRows = arrayGeneratedDef.length;
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
        this.arrayGeneratedDef = null;

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
