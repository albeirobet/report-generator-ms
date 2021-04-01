/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-continue */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const ApiError = require('../dto/commons/response/apiErrorDTO');
const ServiceException = require('../utils/errors/serviceException');
const commonErrors = require('../utils/constants/commonErrors');
const httpCodes = require('../utils/constants/httpCodes');
const MasterReport = require('../models/masterReportModel');
const AssistantReport = require('../models/assistantReportModel');
const EntryMerchandiseExtra = require('../models/entryMerchandiseExtraModel');
const PurchaseOrderTracking = require('../models/purchaseOrderTrackingModel');
const EntryMerchandiseAndServicesReportReport = require('../models/entryMerchandiseAndServicesReportReportModel');
const PaymentOriginal = require('../models/paymentOriginalModel');
const PaymentExtra = require('../models/paymentExtraModel');
const ReportCreator = require('../models/reportCreatorModel');
const reportGeneratorMessages = require('../utils/constants/reportGeneratorMessages');
const reportFunctionsUpdate = require('../utils/functions/reportFunctionsUpdate');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const userService = require('./userService');
const email = require('./../utils/email');
const customValidator = require('../utils/validators/validator');

// =========== Function to count records of reports
exports.generateEntryMerchandiseAndServicesReport = async (req, res) => {
  try {
    const objectReportResume = {};
    objectReportResume.code = 'EMEGR';
    objectReportResume.startDate = new Date();

    console.log('>>>>>>>> TIEMPO DE INICIO');
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

    // Limpiando reporte anterior
    await EntryMerchandiseAndServicesReportReport.deleteMany({
      companyId: userInfo.companyId
    });
    const arrayGenerated = [];
    let objectGenerated = {};

    let arrayInvoicePaymentGenerated = [];
    let objectInvoicePaymentGenerated = {};

    const masterReportData = await MasterReport.find({
      companyId: userInfo.companyId,
      //,      originalDocumentId: { $in: ['FP-51950', 'FP-51959', '32380'] }
      originalDocumentId: { $in: ['1681'] }
    })
      //.limit(1000)
      .lean();

    // Actualizando información encabezado reporte
    objectReportResume.state = 'processing';
    objectReportResume.percentageCompletition = 33;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Procesando Información';
    objectReportResume.endDate = null;
    await reportFunctionsUpdate.updateReportCreator(objectReportResume);

    // ===== ITERACION SOBRE MASTER REPORT ORIGINAL
    // ===== Paso 1.
    let temporaloriginalDocumentId = null;
    console.log('Cargada información Maestra en Memoria');
    let contador = 0;
    for await (const reportData of masterReportData) {
      objectGenerated = {};
      contador += 1;
      // if (contador % 1000 === 0) {
      console.log(
        `En el registro:  ${contador}  con idDocumento:  ${reportData.originalDocumentId}`
      );
      // }
      objectGenerated.seniorAccountantId = reportData.seniorAccountantId;
      objectGenerated.seniorAccountantName = reportData.seniorAccountantName;
      objectGenerated.postingDate = reportData.postingDate;
      objectGenerated.accountingSeat = reportData.accountingSeat;
      objectGenerated.externalReferenceId = reportData.externalReferenceId;
      objectGenerated.originalDocumentId = reportData.originalDocumentId;
      objectGenerated.accountingSeatType = reportData.accountingSeatType;
      objectGenerated.accountingSeatAnnulled =
        reportData.accountingSeatAnnulled;
      objectGenerated.originalDocumentAnnulledId =
        reportData.originalDocumentAnnulledId;
      objectGenerated.accountingSeatAnnulment =
        reportData.accountingSeatAnnulment;
      objectGenerated.extraOriginalDocumentAnulledId =
        reportData.extraOriginalDocumentAnulledId;
      objectGenerated.extraOriginalDocumentId =
        reportData.extraOriginalDocumentId;
      objectGenerated.originalDocumentPosition =
        reportData.originalDocumentPosition;
      objectGenerated.debtAmountCompanyCurrency =
        reportData.debtAmountCompanyCurrency;
      objectGenerated.creditAmountCompanyCurrency =
        reportData.creditAmountCompanyCurrency;
      objectGenerated.companyId = userInfo.companyId;
      objectGenerated.userId = userInfo._id;

      // Comprobamos si no es la primera iteracion para no volver a hacer el proceso
      if (temporaloriginalDocumentId === null) {
        temporaloriginalDocumentId = reportData.originalDocumentId;
      } else if (temporaloriginalDocumentId === reportData.originalDocumentId) {
        // console.log('Es el mismo no voy a volver a buscar data');
        //console.log(objectGenerated);
        //console.table(arrayInvoicePaymentGenerated);

        if (
          arrayInvoicePaymentGenerated &&
          arrayInvoicePaymentGenerated.length > 0
        ) {
          let count = 0;
          arrayInvoicePaymentGenerated.forEach(elementInvoicePayment => {
            let objectGeneratedToSave = { ...objectGenerated };
            if (count > 0) {
              objectGeneratedToSave.debtAmountCompanyCurrency = 0;
              objectGeneratedToSave.creditAmountCompanyCurrency = 0;

              objectGeneratedToSave.requestedAmountGenerated = 0;
              objectGeneratedToSave.netPriceCompanyCurrencyGenerated = 0;
              objectGeneratedToSave.deliveredQuantityGenerated = 0;
              objectGeneratedToSave.deliveredValueGenerated = 0;
              objectGeneratedToSave.deliveredValueCompanyCurrencyGenerated = 0;
              objectGeneratedToSave.invoicedAmountGenerated = 0;
              objectGeneratedToSave.invoicedValueGenerated = 0;
              objectGeneratedToSave.invoicedValueCompanyCurrencyGenerated = 0;
              objectGeneratedToSave.balanceQuantityEntryMerchandiseQuantitiesGenerated = 0;
              objectGeneratedToSave.balanceQuantityEntryMerchandiseCurrenciesGenerated = 0;
            }
            objectGeneratedToSave.invoiceIdGenerated =
              elementInvoicePayment.invoiceIdGenerated;
            objectGeneratedToSave.supplierIdGenerated =
              elementInvoicePayment.supplierIdGenerated;
            objectGeneratedToSave.supplierNameGenerated =
              elementInvoicePayment.supplierNameGenerated;
            objectGeneratedToSave.externalDocumentIdGenerated =
              elementInvoicePayment.externalDocumentIdGenerated;
            objectGeneratedToSave.entryMerchandiseIdGenerated =
              elementInvoicePayment.entryMerchandiseIdGenerated;
            objectGeneratedToSave.grossAmountCompanyCurrencyGenerated =
              elementInvoicePayment.grossAmountCompanyCurrencyGenerated;
            objectGeneratedToSave.netAmountCompanyCurrencyGenerated =
              elementInvoicePayment.netAmountCompanyCurrencyGenerated;
            objectGeneratedToSave.quantityGenerated =
              elementInvoicePayment.quantityGenerated;
            objectGeneratedToSave.documentIdGenerated =
              elementInvoicePayment.documentIdGenerated;
            objectGeneratedToSave.createdAtGenerated =
              elementInvoicePayment.createdAtGenerated;
            objectGeneratedToSave.pyamentMethodGenerated =
              elementInvoicePayment.pyamentMethodGenerated;
            objectGeneratedToSave.businessPartnerNameGenerated =
              elementInvoicePayment.businessPartnerNameGenerated;
            objectGeneratedToSave.paymentAmountGenerated =
              elementInvoicePayment.paymentAmountGenerated;
            arrayGenerated.push(objectGeneratedToSave);
            objectGeneratedToSave = {};
            count += 1;
          });
        } else {
          let objectGeneratedToSave = { ...objectGenerated };
          arrayGenerated.push(objectGeneratedToSave);
          objectGeneratedToSave = {};
        }

        continue;
      } else {
        // console.log('Pailas debo iterar nuevamente');
        arrayInvoicePaymentGenerated = [];
        // console.log('Finalizando insercion primer registro');
        // objectGenerated = {};
      }

      if (
        reportData.originalDocumentId &&
        reportData.originalDocumentId !== '#' &&
        reportData.originalDocumentId !== ''
      ) {
        // ===== Buscar Entrada de mercancias con el id Documento Original
        const entryMerchandiseExtraData = await EntryMerchandiseExtra.find({
          companyId: userInfo.companyId,
          entryMerchandiseId: reportData.originalDocumentId
        })
          .select({
            purchaseOrderId: 1,
            entryMerchandiseState: 1
          })
          .lean();
        // ===== Comprobar si encontró mercancias con el id Documento original proporcionado
        if (entryMerchandiseExtraData && entryMerchandiseExtraData.length > 0) {
          // ===== Iteracion sobre la entrada de mercancias
          for await (const entryMerchandise of entryMerchandiseExtraData) {
            objectGenerated.entryMerchandiseStateGenerated =
              entryMerchandise.entryMerchandiseState;
            objectGenerated.purchaseOrderIdGenerated =
              entryMerchandise.purchaseOrderId;

            // ===== Buscar Serguimiento de Orden de compra
            // ===== Paso 2.
            if (
              entryMerchandise.purchaseOrderId &&
              reportData.purchaseOrderId !== '#' &&
              reportData.purchaseOrderId !== ''
            ) {
              const purchaseOrderTrackingData = await PurchaseOrderTracking.find(
                {
                  companyId: userInfo.companyId,
                  purchaseOrderId: entryMerchandise.purchaseOrderId
                }
              )
                .select({
                  requestedAmount: 1,
                  netPriceCompanyCurrency: 1,
                  deliveredQuantity: 1,
                  deliveredValue: 1,
                  deliveredValueCompanyCurrency: 1,
                  invoicedAmount: 1,
                  invoicedValue: 1,
                  invoicedValueCompanyCurrency: 1
                })
                .lean();
              if (
                purchaseOrderTrackingData &&
                purchaseOrderTrackingData.length > 0
              ) {
                // Iterar sobre el seguimiento de ordenes de Compra
                for await (const purchaseOrderTracking of purchaseOrderTrackingData) {
                  objectGenerated.requestedAmountGenerated =
                    purchaseOrderTracking.requestedAmount;
                  objectGenerated.netPriceCompanyCurrencyGenerated =
                    purchaseOrderTracking.netPriceCompanyCurrency;
                  objectGenerated.deliveredQuantityGenerated =
                    purchaseOrderTracking.deliveredQuantity;
                  objectGenerated.deliveredValueGenerated =
                    purchaseOrderTracking.deliveredValue;
                  objectGenerated.deliveredValueCompanyCurrencyGenerated =
                    purchaseOrderTracking.deliveredValueCompanyCurrency;
                  objectGenerated.invoicedAmountGenerated =
                    purchaseOrderTracking.invoicedAmount;
                  objectGenerated.invoicedValueGenerated =
                    purchaseOrderTracking.invoicedValue;
                  objectGenerated.invoicedValueCompanyCurrencyGenerated =
                    purchaseOrderTracking.invoicedValueCompanyCurrency;

                  // ===== Realizamos los calculos sociitados de sumas en cantidades con redondeo a dos decimales
                  // ===== Paso 3.
                  let deliveredQuantityNumber = 0;
                  let invoicedAmountNumber = 0;
                  let deliveredValueNumber = 0;
                  let invoicedValueNumber = 0;

                  if (objectGenerated.deliveredQuantityGenerated) {
                    deliveredQuantityNumber = parseFloat(
                      objectGenerated.deliveredQuantityGenerated
                    );
                  }

                  if (objectGenerated.invoicedAmountGenerated) {
                    invoicedAmountNumber = parseFloat(
                      objectGenerated.invoicedAmountGenerated
                    );
                  }

                  if (objectGenerated.deliveredValueGenerated) {
                    deliveredValueNumber = parseFloat(
                      objectGenerated.deliveredValueGenerated
                    );
                  }

                  if (objectGenerated.invoicedValueGenerated) {
                    invoicedValueNumber = parseFloat(
                      objectGenerated.invoicedValueGenerated
                    );
                  }

                  if (
                    !isNaN(deliveredQuantityNumber) &&
                    !isNaN(invoicedAmountNumber)
                  ) {
                    objectGenerated.balanceQuantityEntryMerchandiseQuantitiesGenerated = (
                      deliveredQuantityNumber - invoicedAmountNumber
                    ).toFixed(2);
                  }

                  if (
                    !isNaN(deliveredValueNumber) &&
                    !isNaN(invoicedValueNumber)
                  ) {
                    objectGenerated.balanceQuantityEntryMerchandiseCurrenciesGenerated = (
                      deliveredValueNumber - invoicedValueNumber
                    ).toFixed(2);
                  }

                  // ===== Buscar en el Assistant Report para armar información de facturas y pagos
                  // ===== Paso 4.

                  // ====== Importante, Comprobamos primero si existe el registro por entrada de mercancias, en caso contrario por factura
                  // ====== CASO A
                  let assistantReportFull = null;
                  const assistantReportDataEM = await AssistantReport.find({
                    companyId: userInfo.companyId,
                    entryMerchandiseId: reportData.originalDocumentId
                  })
                    .select({
                      invoiceId: 1,
                      supplierId: 1,
                      supplierName: 1,
                      externalDocumentId: 1,
                      entryMerchandiseId: 1,
                      grossAmountCompanyCurrency: 1,
                      netAmountCompanyCurrency: 1,
                      quantity: 1
                    })
                    .lean();
                  if (
                    assistantReportDataEM &&
                    assistantReportDataEM.length > 0
                  ) {
                    assistantReportFull = assistantReportDataEM;
                  } else {
                    // ====== CASO B
                    const assistantReportDataF = await AssistantReport.find({
                      companyId: userInfo.companyId,
                      invoiceId: reportData.originalDocumentId
                    })
                      .select({
                        invoiceId: 1,
                        supplierId: 1,
                        supplierName: 1,
                        externalDocumentId: 1,
                        entryMerchandiseId: 1,
                        grossAmountCompanyCurrency: 1,
                        netAmountCompanyCurrency: 1,
                        quantity: 1
                      })
                      .lean();
                    if (
                      assistantReportDataF &&
                      assistantReportDataF.length > 0
                    ) {
                      assistantReportFull = assistantReportDataF;
                    }
                  }
                  // =========== Compruebo si existe data en cualquiera de los dos casos, entrada de mercancia o id factura para poder empezar a iterar y buscar la informacion de pagos
                  if (assistantReportFull && assistantReportFull.length > 0) {
                    // Iterar sobre el seguimiento de ordenes de Compra
                    for await (const assistantReport of assistantReportFull) {
                      objectInvoicePaymentGenerated.invoiceIdGenerated =
                        assistantReport.invoiceId;
                      objectInvoicePaymentGenerated.supplierIdGenerated =
                        assistantReport.supplierId;
                      objectInvoicePaymentGenerated.supplierNameGenerated =
                        assistantReport.supplierName;
                      objectInvoicePaymentGenerated.externalDocumentIdGenerated =
                        assistantReport.externalDocumentId;
                      objectInvoicePaymentGenerated.entryMerchandiseIdGenerated =
                        assistantReport.entryMerchandiseId;
                      objectInvoicePaymentGenerated.grossAmountCompanyCurrencyGenerated =
                        assistantReport.grossAmountCompanyCurrency;
                      objectInvoicePaymentGenerated.netAmountCompanyCurrencyGenerated =
                        assistantReport.netAmountCompanyCurrency;
                      objectInvoicePaymentGenerated.quantityGenerated =
                        assistantReport.quantity;

                      // Buscar el Id de la factura en PaymentExtras
                      if (
                        assistantReport.invoiceId &&
                        assistantReport.invoiceId !== '#' &&
                        assistantReport.invoiceId !== ''
                      ) {
                        const paymentExtraData = await PaymentExtra.find({
                          companyId: userInfo.companyId,
                          documentId: assistantReport.invoiceId
                        })
                          .select({
                            originalDocumentId: 1
                          })
                          .lean();

                        // Iterar sobre los pagos que están asociados a esta factura
                        for await (const paymentExtra of paymentExtraData) {
                          // Obtener la información faltante del pago para completar la tabla

                          if (
                            paymentExtra.originalDocumentId &&
                            paymentExtra.originalDocumentId !== '#' &&
                            paymentExtra.originalDocumentId !== ''
                          ) {
                            const paymentOriginalData = await PaymentOriginal.find(
                              {
                                companyId: userInfo.companyId,
                                documentId: paymentExtra.originalDocumentId
                              }
                            )
                              .select({
                                documentId: 1,
                                createdAt: 1,
                                pyamentMethod: 1,
                                businessPartnerName: 1,
                                paymentAmount: 1
                              })
                              .lean();
                            // Iterar sobre la información completa del pago
                            if (
                              paymentOriginalData &&
                              paymentOriginalData.length > 0
                            ) {
                              for await (const paymentOriginal of paymentOriginalData) {
                                if (
                                  paymentOriginal.businessPartnerName ===
                                  assistantReport.supplierName
                                ) {
                                  objectInvoicePaymentGenerated.documentIdGenerated =
                                    paymentOriginal.documentId;
                                  objectInvoicePaymentGenerated.createdAtGenerated =
                                    paymentOriginal.createdAt;
                                  objectInvoicePaymentGenerated.pyamentMethodGenerated =
                                    paymentOriginal.pyamentMethod;
                                  objectInvoicePaymentGenerated.businessPartnerNameGenerated =
                                    paymentOriginal.businessPartnerName;
                                  objectInvoicePaymentGenerated.paymentAmountGenerated =
                                    paymentOriginal.paymentAmount;
                                  break;
                                }
                              }
                            }
                          }
                        }
                        arrayInvoicePaymentGenerated.push(
                          objectInvoicePaymentGenerated
                        );
                        objectInvoicePaymentGenerated = {};
                      }
                    }
                  }
                  break;
                }
              } else {
                //console.log('No encontré seguimiento ');
                //  =============================================================
                //  ================== IMPORTANTE ES UNA VARIANTE DEL CASO 4 Y ES COPIA DEL CODIGO ANTERIOR

                // ===== Buscar en el Assistant Report para armar información de facturas y pagos
                // ===== Paso 4.

                // ====== Importante, Comprobamos primero si existe el registro por entrada de mercancias, en caso contrario por factura
                // ====== CASO A
                let assistantReportFull = null;
                const assistantReportDataEM = await AssistantReport.find({
                  companyId: userInfo.companyId,
                  entryMerchandiseId: reportData.originalDocumentId
                })
                  .select({
                    invoiceId: 1,
                    supplierId: 1,
                    supplierName: 1,
                    externalDocumentId: 1,
                    entryMerchandiseId: 1,
                    grossAmountCompanyCurrency: 1,
                    netAmountCompanyCurrency: 1,
                    quantity: 1
                  })
                  .lean();
                if (assistantReportDataEM && assistantReportDataEM.length > 0) {
                  assistantReportFull = assistantReportDataEM;
                } else {
                  // ====== CASO B
                  const assistantReportDataF = await AssistantReport.find({
                    companyId: userInfo.companyId,
                    invoiceId: reportData.originalDocumentId
                  })
                    .select({
                      invoiceId: 1,
                      supplierId: 1,
                      supplierName: 1,
                      externalDocumentId: 1,
                      entryMerchandiseId: 1,
                      grossAmountCompanyCurrency: 1,
                      netAmountCompanyCurrency: 1,
                      quantity: 1
                    })
                    .lean();
                  if (assistantReportDataF && assistantReportDataF.length > 0) {
                    assistantReportFull = assistantReportDataF;
                  }
                }
                // =========== Compruebo si existe data en cualquiera de los dos casos, entrada de mercancia o id factura para poder empezar a iterar y buscar la informacion de pagos
                if (assistantReportFull && assistantReportFull.length > 0) {
                  // Iterar sobre el seguimiento de ordenes de Compra
                  for await (const assistantReport of assistantReportFull) {
                    objectInvoicePaymentGenerated.invoiceIdGenerated =
                      assistantReport.invoiceId;
                    objectInvoicePaymentGenerated.supplierIdGenerated =
                      assistantReport.supplierId;
                    objectInvoicePaymentGenerated.supplierNameGenerated =
                      assistantReport.supplierName;
                    objectInvoicePaymentGenerated.externalDocumentIdGenerated =
                      assistantReport.externalDocumentId;
                    objectInvoicePaymentGenerated.entryMerchandiseIdGenerated =
                      assistantReport.entryMerchandiseId;
                    objectInvoicePaymentGenerated.grossAmountCompanyCurrencyGenerated =
                      assistantReport.grossAmountCompanyCurrency;
                    objectInvoicePaymentGenerated.netAmountCompanyCurrencyGenerated =
                      assistantReport.netAmountCompanyCurrency;
                    objectInvoicePaymentGenerated.quantityGenerated =
                      assistantReport.quantity;

                    // Buscar el Id de la factura en PaymentExtras
                    if (
                      assistantReport.invoiceId &&
                      assistantReport.invoiceId !== '#' &&
                      assistantReport.invoiceId !== ''
                    ) {
                      const paymentExtraData = await PaymentExtra.find({
                        companyId: userInfo.companyId,
                        documentId: assistantReport.invoiceId
                      })
                        .select({
                          originalDocumentId: 1
                        })
                        .lean();

                      // Iterar sobre los pagos que están asociados a esta factura
                      for await (const paymentExtra of paymentExtraData) {
                        // Obtener la información faltante del pago para completar la tabla

                        if (
                          paymentExtra.originalDocumentId &&
                          paymentExtra.originalDocumentId !== '#' &&
                          paymentExtra.originalDocumentId !== ''
                        ) {
                          const paymentOriginalData = await PaymentOriginal.find(
                            {
                              companyId: userInfo.companyId,
                              documentId: paymentExtra.originalDocumentId
                            }
                          )
                            .select({
                              documentId: 1,
                              createdAt: 1,
                              pyamentMethod: 1,
                              businessPartnerName: 1,
                              paymentAmount: 1
                            })
                            .lean();
                          // Iterar sobre la información completa del pago
                          if (
                            paymentOriginalData &&
                            paymentOriginalData.length > 0
                          ) {
                            for await (const paymentOriginal of paymentOriginalData) {
                              if (
                                paymentOriginal.businessPartnerName ===
                                assistantReport.supplierName
                              ) {
                                objectInvoicePaymentGenerated.documentIdGenerated =
                                  paymentOriginal.documentId;
                                objectInvoicePaymentGenerated.createdAtGenerated =
                                  paymentOriginal.createdAt;
                                objectInvoicePaymentGenerated.pyamentMethodGenerated =
                                  paymentOriginal.pyamentMethod;
                                objectInvoicePaymentGenerated.businessPartnerNameGenerated =
                                  paymentOriginal.businessPartnerName;
                                objectInvoicePaymentGenerated.paymentAmountGenerated =
                                  paymentOriginal.paymentAmount;
                                break;
                              }
                            }
                          }
                        }
                      }
                      arrayInvoicePaymentGenerated.push(
                        objectInvoicePaymentGenerated
                      );
                      objectInvoicePaymentGenerated = {};
                    }
                  }
                }
                // ================================================================
              }
            }
          }
        } else {
          //  =============================================================
          //  ================== IMPORTANTE ES UNA VARIANTE DEL CASO 4 Y ES COPIA DEL CODIGO ANTERIOR

          // ===== Buscar en el Assistant Report para armar información de facturas y pagos
          // ===== Paso 4.

          // ====== Importante, Comprobamos primero si existe el registro por entrada de mercancias, en caso contrario por factura
          // ====== CASO A
          let assistantReportFull = null;
          const assistantReportDataEM = await AssistantReport.find({
            companyId: userInfo.companyId,
            entryMerchandiseId: reportData.originalDocumentId
          })
            .select({
              invoiceId: 1,
              supplierId: 1,
              supplierName: 1,
              externalDocumentId: 1,
              entryMerchandiseId: 1,
              grossAmountCompanyCurrency: 1,
              netAmountCompanyCurrency: 1,
              quantity: 1
            })
            .lean();
          if (assistantReportDataEM && assistantReportDataEM.length > 0) {
            assistantReportFull = assistantReportDataEM;
          } else {
            // ====== CASO B
            const assistantReportDataF = await AssistantReport.find({
              companyId: userInfo.companyId,
              invoiceId: reportData.originalDocumentId
            })
              .select({
                invoiceId: 1,
                supplierId: 1,
                supplierName: 1,
                externalDocumentId: 1,
                entryMerchandiseId: 1,
                grossAmountCompanyCurrency: 1,
                netAmountCompanyCurrency: 1,
                quantity: 1
              })
              .lean();
            if (assistantReportDataF && assistantReportDataF.length > 0) {
              assistantReportFull = assistantReportDataF;
            }
          }
          // =========== Compruebo si existe data en cualquiera de los dos casos, entrada de mercancia o id factura para poder empezar a iterar y buscar la informacion de pagos
          if (assistantReportFull && assistantReportFull.length > 0) {
            // Iterar sobre el seguimiento de ordenes de Compra
            for await (const assistantReport of assistantReportFull) {
              objectInvoicePaymentGenerated.invoiceIdGenerated =
                assistantReport.invoiceId;
              objectInvoicePaymentGenerated.supplierIdGenerated =
                assistantReport.supplierId;
              objectInvoicePaymentGenerated.supplierNameGenerated =
                assistantReport.supplierName;
              objectInvoicePaymentGenerated.externalDocumentIdGenerated =
                assistantReport.externalDocumentId;
              objectInvoicePaymentGenerated.entryMerchandiseIdGenerated =
                assistantReport.entryMerchandiseId;
              objectInvoicePaymentGenerated.grossAmountCompanyCurrencyGenerated =
                assistantReport.grossAmountCompanyCurrency;
              objectInvoicePaymentGenerated.netAmountCompanyCurrencyGenerated =
                assistantReport.netAmountCompanyCurrency;
              objectInvoicePaymentGenerated.quantityGenerated =
                assistantReport.quantity;

              // Buscar el Id de la factura en PaymentExtras
              if (
                assistantReport.invoiceId &&
                assistantReport.invoiceId !== '#' &&
                assistantReport.invoiceId !== ''
              ) {
                const paymentExtraData = await PaymentExtra.find({
                  companyId: userInfo.companyId,
                  documentId: assistantReport.invoiceId
                })
                  .select({
                    originalDocumentId: 1
                  })
                  .lean();

                // Iterar sobre los pagos que están asociados a esta factura
                for await (const paymentExtra of paymentExtraData) {
                  // Obtener la información faltante del pago para completar la tabla

                  if (
                    paymentExtra.originalDocumentId &&
                    paymentExtra.originalDocumentId !== '#' &&
                    paymentExtra.originalDocumentId !== ''
                  ) {
                    const paymentOriginalData = await PaymentOriginal.find({
                      companyId: userInfo.companyId,
                      documentId: paymentExtra.originalDocumentId
                    })
                      .select({
                        documentId: 1,
                        createdAt: 1,
                        pyamentMethod: 1,
                        businessPartnerName: 1,
                        paymentAmount: 1
                      })
                      .lean();
                    // Iterar sobre la información completa del pago
                    if (paymentOriginalData && paymentOriginalData.length > 0) {
                      for await (const paymentOriginal of paymentOriginalData) {
                        if (
                          paymentOriginal.businessPartnerName ===
                          assistantReport.supplierName
                        ) {
                          objectInvoicePaymentGenerated.documentIdGenerated =
                            paymentOriginal.documentId;
                          objectInvoicePaymentGenerated.createdAtGenerated =
                            paymentOriginal.createdAt;
                          objectInvoicePaymentGenerated.pyamentMethodGenerated =
                            paymentOriginal.pyamentMethod;
                          objectInvoicePaymentGenerated.businessPartnerNameGenerated =
                            paymentOriginal.businessPartnerName;
                          objectInvoicePaymentGenerated.paymentAmountGenerated =
                            paymentOriginal.paymentAmount;
                          break;
                        }
                      }
                    }
                  }
                }
                arrayInvoicePaymentGenerated.push(
                  objectInvoicePaymentGenerated
                );
                objectInvoicePaymentGenerated = {};
              }
            }
          }
          // ================================================================
        }
      }
      // console.log('Insertando el primer registro');

      if (
        arrayInvoicePaymentGenerated &&
        arrayInvoicePaymentGenerated.length > 0
      ) {
        let count = 0;
        arrayInvoicePaymentGenerated.forEach(elementInvoicePayment => {
          let objectGeneratedToSave = { ...objectGenerated };
          if (count > 0) {
            objectGeneratedToSave.debtAmountCompanyCurrency = 0;
            objectGeneratedToSave.creditAmountCompanyCurrency = 0;

            objectGeneratedToSave.requestedAmountGenerated = 0;
            objectGeneratedToSave.netPriceCompanyCurrencyGenerated = 0;
            objectGeneratedToSave.deliveredQuantityGenerated = 0;
            objectGeneratedToSave.deliveredValueGenerated = 0;
            objectGeneratedToSave.deliveredValueCompanyCurrencyGenerated = 0;
            objectGeneratedToSave.invoicedAmountGenerated = 0;
            objectGeneratedToSave.invoicedValueGenerated = 0;
            objectGeneratedToSave.invoicedValueCompanyCurrencyGenerated = 0;
            objectGeneratedToSave.balanceQuantityEntryMerchandiseQuantitiesGenerated = 0;
            objectGeneratedToSave.balanceQuantityEntryMerchandiseCurrenciesGenerated = 0;
          }
          objectGeneratedToSave.invoiceIdGenerated =
            elementInvoicePayment.invoiceIdGenerated;
          objectGeneratedToSave.supplierIdGenerated =
            elementInvoicePayment.supplierIdGenerated;
          objectGeneratedToSave.supplierNameGenerated =
            elementInvoicePayment.supplierNameGenerated;
          objectGeneratedToSave.externalDocumentIdGenerated =
            elementInvoicePayment.externalDocumentIdGenerated;
          objectGeneratedToSave.entryMerchandiseIdGenerated =
            elementInvoicePayment.entryMerchandiseIdGenerated;
          objectGeneratedToSave.grossAmountCompanyCurrencyGenerated =
            elementInvoicePayment.grossAmountCompanyCurrencyGenerated;
          objectGeneratedToSave.netAmountCompanyCurrencyGenerated =
            elementInvoicePayment.netAmountCompanyCurrencyGenerated;
          objectGeneratedToSave.quantityGenerated =
            elementInvoicePayment.quantityGenerated;
          objectGeneratedToSave.documentIdGenerated =
            elementInvoicePayment.documentIdGenerated;
          objectGeneratedToSave.createdAtGenerated =
            elementInvoicePayment.createdAtGenerated;
          objectGeneratedToSave.pyamentMethodGenerated =
            elementInvoicePayment.pyamentMethodGenerated;
          objectGeneratedToSave.businessPartnerNameGenerated =
            elementInvoicePayment.businessPartnerNameGenerated;
          objectGeneratedToSave.paymentAmountGenerated =
            elementInvoicePayment.paymentAmountGenerated;
          arrayGenerated.push(objectGeneratedToSave);
          objectGeneratedToSave = {};
          count += 1;
        });
      } else {
        let objectGeneratedToSave = { ...objectGenerated };
        arrayGenerated.push(objectGeneratedToSave);
        objectGeneratedToSave = {};
      }
    }
    const summaryLoadedData = new SummaryLoadedData('', 0);
    console.log(
      '>>>>>>>>> TIEMPO DE FINALIZACIÓN DE PROCESAMIENTO INFORMACION'
    );
    console.log(new Date());
    console.log('Insert Data Init ', arrayGenerated.length);
    // Actualizando información encabezado reporte
    objectReportResume.state = 'entering_information';
    objectReportResume.percentageCompletition = 66;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Insertando Información';
    await reportFunctionsUpdate.updateReportCreator(objectReportResume);

    EntryMerchandiseAndServicesReportReport.collection
      .insertMany(arrayGenerated)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = arrayGenerated.length;
        console.log('Insert Data Finish');
        async function finishReport() {
          // Actualizando información encabezado reporte
          objectReportResume.state = 'generated_report';
          objectReportResume.percentageCompletition = 100;
          objectReportResume.counterRows = arrayGenerated.length;
          objectReportResume.message = 'Reporte cargado correctamente';
          objectReportResume.endDate = new Date();
          await reportFunctionsUpdate.updateReportCreator(objectReportResume);
        }
        finishReport();
      })
      .catch(function(error) {
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
    console.log('Insertando en background');
    return summaryLoadedData;
  } catch (err) {
    throw err;
  }
};

// =========== Function to count records of reports
// exports.generateInMemory = async (req, res) => {
//   try {
//     const objectReportResume = {};
//     objectReportResume.code = 'EMEGR';
//     objectReportResume.startDate = new Date();

//     console.log('>>>>>>>> TIEMPO DE INICIO');
//     console.log(new Date());
//     const userInfo = await userService.getUserInfo(req, res);
//     objectReportResume.companyId = userInfo.companyId;
//     objectReportResume.generatorUserId = userInfo._id;
//     const reportInfo = await ReportCreator.find({
//       companyId: userInfo.companyId,
//       code: objectReportResume.code
//     }).lean();
//     if (reportInfo.length === 0) {
//       throw new ServiceException(
//         commonErrors.E_COMMON_01,
//         new ApiError(
//           `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_06}`,
//           `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_06}`,
//           'E_REPORT_GENERATOR_MS_06',
//           httpCodes.BAD_REQUEST
//         )
//       );
//     }

//     // Limpiando reporte anterior
//     await EntryMerchandiseAndServicesReportReport.collection.deleteMany({
//       companyId: userInfo.companyId
//     });
//     const arrayGenerated = [];
//     let objectGenerated = {};

//     let arrayInvoicePaymentGenerated = [];
//     let objectInvoicePaymentGenerated = {};

//     console.log(' =========  Cargando en memoria MasterReport');
//     let masterReportData = await MasterReport.find({
//       companyId: userInfo.companyId
//       // ,      originalDocumentId: { $in: ['1681'] }
//     }).lean();

//     console.log(' =========  Cargando en memoria EntryMerchandiseExtra');
//     let entryMerchandiseExtraDataMemory = await EntryMerchandiseExtra.find({
//       companyId: userInfo.companyId
//     })
//       .select({
//         purchaseOrderId: 1,
//         entryMerchandiseState: 1,
//         entryMerchandiseId: 1
//       })
//       .lean();

//     console.log(' =========  Cargando en memoria PurchaseOrderTracking');
//     let purchaseOrderTrackingDataMemory = await PurchaseOrderTracking.find({
//       companyId: userInfo.companyId
//     })
//       .select({
//         requestedAmount: 1,
//         netPriceCompanyCurrency: 1,
//         deliveredQuantity: 1,
//         deliveredValue: 1,
//         deliveredValueCompanyCurrency: 1,
//         invoicedAmount: 1,
//         invoicedValue: 1,
//         invoicedValueCompanyCurrency: 1,
//         purchaseOrderId: 1
//       })
//       .lean();

//     console.log(' =========  Cargando en memoria AssistantReport');
//     let assistantReportDataEMMemory = await AssistantReport.find({
//       companyId: userInfo.companyId
//     })
//       .select({
//         invoiceId: 1,
//         supplierId: 1,
//         supplierName: 1,
//         externalDocumentId: 1,
//         entryMerchandiseId: 1,
//         grossAmountCompanyCurrency: 1,
//         netAmountCompanyCurrency: 1,
//         quantity: 1
//       })
//       .lean();

//     console.log(' =========  Cargando en memoria PaymentExtra');
//     let paymentExtraDataMemory = await PaymentExtra.find({
//       companyId: userInfo.companyId
//     })
//       .select({
//         originalDocumentId: 1,
//         documentId: 1
//       })
//       .lean();

//     console.log(' =========  Cargando en memoria PaymentOriginal');
//     let paymentOriginalDataMemory = await PaymentOriginal.find({
//       companyId: userInfo.companyId
//     })
//       .select({
//         documentId: 1,
//         createdAt: 1,
//         pyamentMethod: 1,
//         businessPartnerName: 1,
//         paymentAmount: 1
//       })
//       .lean();

//     // Actualizando información encabezado reporte
//     objectReportResume.state = 'processing';
//     objectReportResume.percentageCompletition = 33;
//     objectReportResume.counterRows = 0;
//     objectReportResume.message = 'Procesando Información';
//     objectReportResume.endDate = null;
//     await reportFunctionsUpdate.updateReportCreator(objectReportResume);

//     // ===== ITERACION SOBRE MASTER REPORT ORIGINAL
//     // ===== Paso 1.
//     let temporaloriginalDocumentId = null;
//     console.log('Cargada información Maestra en Memoria');
//     let contador = 0;
//     for await (const reportData of masterReportData) {
//       objectGenerated = {};
//       contador += 1;
//       if (contador % 1000 === 0) {
//         console.log(
//           `En el registro:  ${contador}  con idDocumento:  ${reportData.originalDocumentId}`
//         );
//       }
//       objectGenerated.seniorAccountantId = reportData.seniorAccountantId;
//       objectGenerated.seniorAccountantName = reportData.seniorAccountantName;
//       objectGenerated.postingDate = reportData.postingDate;
//       objectGenerated.accountingSeat = reportData.accountingSeat;
//       objectGenerated.externalReferenceId = reportData.externalReferenceId;
//       objectGenerated.originalDocumentId = reportData.originalDocumentId;
//       objectGenerated.accountingSeatType = reportData.accountingSeatType;
//       objectGenerated.accountingSeatAnnulled =
//         reportData.accountingSeatAnnulled;
//       objectGenerated.originalDocumentAnnulledId =
//         reportData.originalDocumentAnnulledId;
//       objectGenerated.accountingSeatAnnulment =
//         reportData.accountingSeatAnnulment;
//       objectGenerated.extraOriginalDocumentAnulledId =
//         reportData.extraOriginalDocumentAnulledId;
//       objectGenerated.extraOriginalDocumentId =
//         reportData.extraOriginalDocumentId;
//       objectGenerated.originalDocumentPosition =
//         reportData.originalDocumentPosition;
//       objectGenerated.debtAmountCompanyCurrency =
//         reportData.debtAmountCompanyCurrency;
//       objectGenerated.creditAmountCompanyCurrency =
//         reportData.creditAmountCompanyCurrency;
//       objectGenerated.companyId = userInfo.companyId;
//       objectGenerated.userId = userInfo._id;

//       // Comprobamos si no es la primera iteracion para no volver a hacer el proceso
//       if (temporaloriginalDocumentId === null) {
//         temporaloriginalDocumentId = reportData.originalDocumentId;
//       } else if (temporaloriginalDocumentId === reportData.originalDocumentId) {
//         // console.log('Es el mismo no voy a volver a buscar data');
//         //console.log(objectGenerated);
//         //console.table(arrayInvoicePaymentGenerated);

//         if (
//           arrayInvoicePaymentGenerated &&
//           arrayInvoicePaymentGenerated.length > 0
//         ) {
//           let count = 0;
//           arrayInvoicePaymentGenerated.forEach(elementInvoicePayment => {
//             let objectGeneratedToSave = { ...objectGenerated };
//             if (count > 0) {
//               objectGeneratedToSave.debtAmountCompanyCurrency = 0;
//               objectGeneratedToSave.creditAmountCompanyCurrency = 0;

//               objectGeneratedToSave.requestedAmountGenerated = 0;
//               objectGeneratedToSave.netPriceCompanyCurrencyGenerated = 0;
//               objectGeneratedToSave.deliveredQuantityGenerated = 0;
//               objectGeneratedToSave.deliveredValueGenerated = 0;
//               objectGeneratedToSave.deliveredValueCompanyCurrencyGenerated = 0;
//               objectGeneratedToSave.invoicedAmountGenerated = 0;
//               objectGeneratedToSave.invoicedValueGenerated = 0;
//               objectGeneratedToSave.invoicedValueCompanyCurrencyGenerated = 0;
//               objectGeneratedToSave.balanceQuantityEntryMerchandiseQuantitiesGenerated = 0;
//               objectGeneratedToSave.balanceQuantityEntryMerchandiseCurrenciesGenerated = 0;
//             }
//             objectGeneratedToSave.invoiceIdGenerated =
//               elementInvoicePayment.invoiceIdGenerated;
//             objectGeneratedToSave.supplierIdGenerated =
//               elementInvoicePayment.supplierIdGenerated;
//             objectGeneratedToSave.supplierNameGenerated =
//               elementInvoicePayment.supplierNameGenerated;
//             objectGeneratedToSave.externalDocumentIdGenerated =
//               elementInvoicePayment.externalDocumentIdGenerated;
//             objectGeneratedToSave.entryMerchandiseIdGenerated =
//               elementInvoicePayment.entryMerchandiseIdGenerated;
//             objectGeneratedToSave.grossAmountCompanyCurrencyGenerated =
//               elementInvoicePayment.grossAmountCompanyCurrencyGenerated;
//             objectGeneratedToSave.netAmountCompanyCurrencyGenerated =
//               elementInvoicePayment.netAmountCompanyCurrencyGenerated;
//             objectGeneratedToSave.quantityGenerated =
//               elementInvoicePayment.quantityGenerated;
//             objectGeneratedToSave.documentIdGenerated =
//               elementInvoicePayment.documentIdGenerated;
//             objectGeneratedToSave.createdAtGenerated =
//               elementInvoicePayment.createdAtGenerated;
//             objectGeneratedToSave.pyamentMethodGenerated =
//               elementInvoicePayment.pyamentMethodGenerated;
//             objectGeneratedToSave.businessPartnerNameGenerated =
//               elementInvoicePayment.businessPartnerNameGenerated;
//             objectGeneratedToSave.paymentAmountGenerated =
//               elementInvoicePayment.paymentAmountGenerated;
//             arrayGenerated.push(objectGeneratedToSave);
//             objectGeneratedToSave = {};
//             count += 1;
//           });
//         } else {
//           let objectGeneratedToSave = { ...objectGenerated };
//           arrayGenerated.push(objectGeneratedToSave);
//           objectGeneratedToSave = {};
//         }

//         continue;
//       } else {
//         // console.log('Pailas debo iterar nuevamente');
//         arrayInvoicePaymentGenerated = [];
//         // console.log('Finalizando insercion primer registro');
//         // objectGenerated = {};
//       }

//       if (
//         reportData.originalDocumentId &&
//         reportData.originalDocumentId !== '#' &&
//         reportData.originalDocumentId !== ''
//       ) {
//         // ===== Buscar Entrada de mercancias con el id Documento Original
//         const entryMerchandiseExtraData = entryMerchandiseExtraDataMemory.filter(
//           el => el.entryMerchandiseId === reportData.originalDocumentId
//         );
//         // ===== Comprobar si encontró mercancias con el id Documento original proporcionado
//         if (entryMerchandiseExtraData && entryMerchandiseExtraData.length > 0) {
//           // ===== Iteracion sobre la entrada de mercancias
//           for await (const entryMerchandise of entryMerchandiseExtraData) {
//             objectGenerated.entryMerchandiseStateGenerated =
//               entryMerchandise.entryMerchandiseState;
//             objectGenerated.purchaseOrderIdGenerated =
//               entryMerchandise.purchaseOrderId;

//             // ===== Buscar Serguimiento de Orden de compra
//             // ===== Paso 2.
//             if (
//               entryMerchandise.purchaseOrderId &&
//               reportData.purchaseOrderId !== '#' &&
//               reportData.purchaseOrderId !== ''
//             ) {
//               const purchaseOrderTrackingData = purchaseOrderTrackingDataMemory.filter(
//                 el => el.purchaseOrderId === entryMerchandise.purchaseOrderId
//               );

//               if (
//                 purchaseOrderTrackingData &&
//                 purchaseOrderTrackingData.length > 0
//               ) {
//                 // Iterar sobre el seguimiento de ordenes de Compra
//                 for await (const purchaseOrderTracking of purchaseOrderTrackingData) {
//                   objectGenerated.requestedAmountGenerated =
//                     purchaseOrderTracking.requestedAmount;
//                   objectGenerated.netPriceCompanyCurrencyGenerated =
//                     purchaseOrderTracking.netPriceCompanyCurrency;
//                   objectGenerated.deliveredQuantityGenerated =
//                     purchaseOrderTracking.deliveredQuantity;
//                   objectGenerated.deliveredValueGenerated =
//                     purchaseOrderTracking.deliveredValue;
//                   objectGenerated.deliveredValueCompanyCurrencyGenerated =
//                     purchaseOrderTracking.deliveredValueCompanyCurrency;
//                   objectGenerated.invoicedAmountGenerated =
//                     purchaseOrderTracking.invoicedAmount;
//                   objectGenerated.invoicedValueGenerated =
//                     purchaseOrderTracking.invoicedValue;
//                   objectGenerated.invoicedValueCompanyCurrencyGenerated =
//                     purchaseOrderTracking.invoicedValueCompanyCurrency;

//                   // ===== Realizamos los calculos sociitados de sumas en cantidades con redondeo a dos decimales
//                   // ===== Paso 3.
//                   let deliveredQuantityNumber = 0;
//                   let invoicedAmountNumber = 0;
//                   let deliveredValueNumber = 0;
//                   let invoicedValueNumber = 0;

//                   if (objectGenerated.deliveredQuantityGenerated) {
//                     deliveredQuantityNumber = parseFloat(
//                       objectGenerated.deliveredQuantityGenerated
//                     );
//                   }

//                   if (objectGenerated.invoicedAmountGenerated) {
//                     invoicedAmountNumber = parseFloat(
//                       objectGenerated.invoicedAmountGenerated
//                     );
//                   }

//                   if (objectGenerated.deliveredValueGenerated) {
//                     deliveredValueNumber = parseFloat(
//                       objectGenerated.deliveredValueGenerated
//                     );
//                   }

//                   if (objectGenerated.invoicedValueGenerated) {
//                     invoicedValueNumber = parseFloat(
//                       objectGenerated.invoicedValueGenerated
//                     );
//                   }

//                   if (
//                     !isNaN(deliveredQuantityNumber) &&
//                     !isNaN(invoicedAmountNumber)
//                   ) {
//                     objectGenerated.balanceQuantityEntryMerchandiseQuantitiesGenerated = (
//                       deliveredQuantityNumber - invoicedAmountNumber
//                     ).toFixed(2);
//                   }

//                   if (
//                     !isNaN(deliveredValueNumber) &&
//                     !isNaN(invoicedValueNumber)
//                   ) {
//                     objectGenerated.balanceQuantityEntryMerchandiseCurrenciesGenerated = (
//                       deliveredValueNumber - invoicedValueNumber
//                     ).toFixed(2);
//                   }

//                   // ===== Buscar en el Assistant Report para armar información de facturas y pagos
//                   // ===== Paso 4.

//                   // ====== Importante, Comprobamos primero si existe el registro por entrada de mercancias, en caso contrario por factura
//                   // ====== CASO A
//                   let assistantReportFull = null;
//                   const assistantReportDataEM = assistantReportDataEMMemory.filter(
//                     el =>
//                       el.entryMerchandiseId === reportData.originalDocumentId
//                   );

//                   if (
//                     assistantReportDataEM &&
//                     assistantReportDataEM.length > 0
//                   ) {
//                     assistantReportFull = assistantReportDataEM;
//                   } else {
//                     // ====== CASO B
//                     const assistantReportDataF = assistantReportDataEMMemory.filter(
//                       el => el.invoiceId === reportData.originalDocumentId
//                     );
//                     if (
//                       assistantReportDataF &&
//                       assistantReportDataF.length > 0
//                     ) {
//                       assistantReportFull = assistantReportDataF;
//                     }
//                   }
//                   // =========== Compruebo si existe data en cualquiera de los dos casos, entrada de mercancia o id factura para poder empezar a iterar y buscar la informacion de pagos
//                   if (assistantReportFull && assistantReportFull.length > 0) {
//                     // Iterar sobre el seguimiento de ordenes de Compra
//                     for await (const assistantReport of assistantReportFull) {
//                       objectInvoicePaymentGenerated.invoiceIdGenerated =
//                         assistantReport.invoiceId;
//                       objectInvoicePaymentGenerated.supplierIdGenerated =
//                         assistantReport.supplierId;
//                       objectInvoicePaymentGenerated.supplierNameGenerated =
//                         assistantReport.supplierName;
//                       objectInvoicePaymentGenerated.externalDocumentIdGenerated =
//                         assistantReport.externalDocumentId;
//                       objectInvoicePaymentGenerated.entryMerchandiseIdGenerated =
//                         assistantReport.entryMerchandiseId;
//                       objectInvoicePaymentGenerated.grossAmountCompanyCurrencyGenerated =
//                         assistantReport.grossAmountCompanyCurrency;
//                       objectInvoicePaymentGenerated.netAmountCompanyCurrencyGenerated =
//                         assistantReport.netAmountCompanyCurrency;
//                       objectInvoicePaymentGenerated.quantityGenerated =
//                         assistantReport.quantity;

//                       // Buscar el Id de la factura en PaymentExtras
//                       if (
//                         assistantReport.invoiceId &&
//                         assistantReport.invoiceId !== '#' &&
//                         assistantReport.invoiceId !== ''
//                       ) {
//                         const paymentExtraData = paymentExtraDataMemory.filter(
//                           el => el.documentId === assistantReport.invoiceId
//                         );

//                         // Iterar sobre los pagos que están asociados a esta factura
//                         for await (const paymentExtra of paymentExtraData) {
//                           // Obtener la información faltante del pago para completar la tabla

//                           if (
//                             paymentExtra.originalDocumentId &&
//                             paymentExtra.originalDocumentId !== '#' &&
//                             paymentExtra.originalDocumentId !== ''
//                           ) {
//                             const paymentOriginalData = paymentOriginalDataMemory.filter(
//                               el =>
//                                 el.documentId ===
//                                 paymentExtra.originalDocumentId
//                             );
//                             // Iterar sobre la información completa del pago
//                             if (
//                               paymentOriginalData &&
//                               paymentOriginalData.length > 0
//                             ) {
//                               for await (const paymentOriginal of paymentOriginalData) {
//                                 if (
//                                   paymentOriginal.businessPartnerName ===
//                                   assistantReport.supplierName
//                                 ) {
//                                   objectInvoicePaymentGenerated.documentIdGenerated =
//                                     paymentOriginal.documentId;
//                                   objectInvoicePaymentGenerated.createdAtGenerated =
//                                     paymentOriginal.createdAt;
//                                   objectInvoicePaymentGenerated.pyamentMethodGenerated =
//                                     paymentOriginal.pyamentMethod;
//                                   objectInvoicePaymentGenerated.businessPartnerNameGenerated =
//                                     paymentOriginal.businessPartnerName;
//                                   objectInvoicePaymentGenerated.paymentAmountGenerated =
//                                     paymentOriginal.paymentAmount;
//                                   break;
//                                 }
//                               }
//                             }
//                           }
//                         }
//                         arrayInvoicePaymentGenerated.push(
//                           objectInvoicePaymentGenerated
//                         );
//                         objectInvoicePaymentGenerated = {};
//                       }
//                     }
//                   }
//                   break;
//                 }
//               } else {
//                 //console.log('No encontré seguimiento ');
//                 //  =============================================================
//                 //  ================== IMPORTANTE ES UNA VARIANTE DEL CASO 4 Y ES COPIA DEL CODIGO ANTERIOR

//                 // ===== Buscar en el Assistant Report para armar información de facturas y pagos
//                 // ===== Paso 4.

//                 // ====== Importante, Comprobamos primero si existe el registro por entrada de mercancias, en caso contrario por factura
//                 // ====== CASO A
//                 let assistantReportFull = null;
//                 const assistantReportDataEM = assistantReportDataEMMemory.filter(
//                   el => el.entryMerchandiseId === reportData.originalDocumentId
//                 );
//                 if (assistantReportDataEM && assistantReportDataEM.length > 0) {
//                   assistantReportFull = assistantReportDataEM;
//                 } else {
//                   // ====== CASO B
//                   const assistantReportDataF = assistantReportDataEMMemory.filter(
//                     el => el.invoiceId === reportData.originalDocumentId
//                   );
//                   if (assistantReportDataF && assistantReportDataF.length > 0) {
//                     assistantReportFull = assistantReportDataF;
//                   }
//                 }
//                 // =========== Compruebo si existe data en cualquiera de los dos casos, entrada de mercancia o id factura para poder empezar a iterar y buscar la informacion de pagos
//                 if (assistantReportFull && assistantReportFull.length > 0) {
//                   // Iterar sobre el seguimiento de ordenes de Compra
//                   for await (const assistantReport of assistantReportFull) {
//                     objectInvoicePaymentGenerated.invoiceIdGenerated =
//                       assistantReport.invoiceId;
//                     objectInvoicePaymentGenerated.supplierIdGenerated =
//                       assistantReport.supplierId;
//                     objectInvoicePaymentGenerated.supplierNameGenerated =
//                       assistantReport.supplierName;
//                     objectInvoicePaymentGenerated.externalDocumentIdGenerated =
//                       assistantReport.externalDocumentId;
//                     objectInvoicePaymentGenerated.entryMerchandiseIdGenerated =
//                       assistantReport.entryMerchandiseId;
//                     objectInvoicePaymentGenerated.grossAmountCompanyCurrencyGenerated =
//                       assistantReport.grossAmountCompanyCurrency;
//                     objectInvoicePaymentGenerated.netAmountCompanyCurrencyGenerated =
//                       assistantReport.netAmountCompanyCurrency;
//                     objectInvoicePaymentGenerated.quantityGenerated =
//                       assistantReport.quantity;

//                     // Buscar el Id de la factura en PaymentExtras
//                     if (
//                       assistantReport.invoiceId &&
//                       assistantReport.invoiceId !== '#' &&
//                       assistantReport.invoiceId !== ''
//                     ) {
//                       const paymentExtraData = paymentExtraDataMemory.filter(
//                         el => el.documentId === assistantReport.invoiceId
//                       );

//                       // Iterar sobre los pagos que están asociados a esta factura
//                       for await (const paymentExtra of paymentExtraData) {
//                         // Obtener la información faltante del pago para completar la tabla

//                         if (
//                           paymentExtra.originalDocumentId &&
//                           paymentExtra.originalDocumentId !== '#' &&
//                           paymentExtra.originalDocumentId !== ''
//                         ) {
//                           const paymentOriginalData = paymentOriginalDataMemory.filter(
//                             el =>
//                               el.documentId === paymentExtra.originalDocumentId
//                           );
//                           // Iterar sobre la información completa del pago
//                           if (
//                             paymentOriginalData &&
//                             paymentOriginalData.length > 0
//                           ) {
//                             for await (const paymentOriginal of paymentOriginalData) {
//                               if (
//                                 paymentOriginal.businessPartnerName ===
//                                 assistantReport.supplierName
//                               ) {
//                                 objectInvoicePaymentGenerated.documentIdGenerated =
//                                   paymentOriginal.documentId;
//                                 objectInvoicePaymentGenerated.createdAtGenerated =
//                                   paymentOriginal.createdAt;
//                                 objectInvoicePaymentGenerated.pyamentMethodGenerated =
//                                   paymentOriginal.pyamentMethod;
//                                 objectInvoicePaymentGenerated.businessPartnerNameGenerated =
//                                   paymentOriginal.businessPartnerName;
//                                 objectInvoicePaymentGenerated.paymentAmountGenerated =
//                                   paymentOriginal.paymentAmount;
//                                 break;
//                               }
//                             }
//                           }
//                         }
//                       }
//                       arrayInvoicePaymentGenerated.push(
//                         objectInvoicePaymentGenerated
//                       );
//                       objectInvoicePaymentGenerated = {};
//                     }
//                   }
//                 }
//                 // ================================================================
//               }
//             }
//           }
//         } else {
//           //  =============================================================
//           //  ================== IMPORTANTE ES UNA VARIANTE DEL CASO 4 Y ES COPIA DEL CODIGO ANTERIOR

//           // ===== Buscar en el Assistant Report para armar información de facturas y pagos
//           // ===== Paso 4.

//           // ====== Importante, Comprobamos primero si existe el registro por entrada de mercancias, en caso contrario por factura
//           // ====== CASO A
//           let assistantReportFull = null;
//           const assistantReportDataEM = assistantReportDataEMMemory.filter(
//             el => el.entryMerchandiseId === reportData.originalDocumentId
//           );
//           if (assistantReportDataEM && assistantReportDataEM.length > 0) {
//             assistantReportFull = assistantReportDataEM;
//           } else {
//             // ====== CASO B
//             const assistantReportDataF = assistantReportDataEMMemory.filter(
//               el => el.invoiceId === reportData.originalDocumentId
//             );
//             if (assistantReportDataF && assistantReportDataF.length > 0) {
//               assistantReportFull = assistantReportDataF;
//             }
//           }
//           // =========== Compruebo si existe data en cualquiera de los dos casos, entrada de mercancia o id factura para poder empezar a iterar y buscar la informacion de pagos
//           if (assistantReportFull && assistantReportFull.length > 0) {
//             // Iterar sobre el seguimiento de ordenes de Compra
//             for await (const assistantReport of assistantReportFull) {
//               objectInvoicePaymentGenerated.invoiceIdGenerated =
//                 assistantReport.invoiceId;
//               objectInvoicePaymentGenerated.supplierIdGenerated =
//                 assistantReport.supplierId;
//               objectInvoicePaymentGenerated.supplierNameGenerated =
//                 assistantReport.supplierName;
//               objectInvoicePaymentGenerated.externalDocumentIdGenerated =
//                 assistantReport.externalDocumentId;
//               objectInvoicePaymentGenerated.entryMerchandiseIdGenerated =
//                 assistantReport.entryMerchandiseId;
//               objectInvoicePaymentGenerated.grossAmountCompanyCurrencyGenerated =
//                 assistantReport.grossAmountCompanyCurrency;
//               objectInvoicePaymentGenerated.netAmountCompanyCurrencyGenerated =
//                 assistantReport.netAmountCompanyCurrency;
//               objectInvoicePaymentGenerated.quantityGenerated =
//                 assistantReport.quantity;

//               // Buscar el Id de la factura en PaymentExtras
//               if (
//                 assistantReport.invoiceId &&
//                 assistantReport.invoiceId !== '#' &&
//                 assistantReport.invoiceId !== ''
//               ) {
//                 const paymentExtraData = paymentExtraDataMemory.filter(
//                   el => el.documentId === assistantReport.invoiceId
//                 );

//                 // Iterar sobre los pagos que están asociados a esta factura
//                 for await (const paymentExtra of paymentExtraData) {
//                   // Obtener la información faltante del pago para completar la tabla

//                   if (
//                     paymentExtra.originalDocumentId &&
//                     paymentExtra.originalDocumentId !== '#' &&
//                     paymentExtra.originalDocumentId !== ''
//                   ) {
//                     const paymentOriginalData = paymentOriginalDataMemory.filter(
//                       el => el.documentId === paymentExtra.originalDocumentId
//                     );
//                     // Iterar sobre la información completa del pago
//                     if (paymentOriginalData && paymentOriginalData.length > 0) {
//                       for await (const paymentOriginal of paymentOriginalData) {
//                         if (
//                           paymentOriginal.businessPartnerName ===
//                           assistantReport.supplierName
//                         ) {
//                           objectInvoicePaymentGenerated.documentIdGenerated =
//                             paymentOriginal.documentId;
//                           objectInvoicePaymentGenerated.createdAtGenerated =
//                             paymentOriginal.createdAt;
//                           objectInvoicePaymentGenerated.pyamentMethodGenerated =
//                             paymentOriginal.pyamentMethod;
//                           objectInvoicePaymentGenerated.businessPartnerNameGenerated =
//                             paymentOriginal.businessPartnerName;
//                           objectInvoicePaymentGenerated.paymentAmountGenerated =
//                             paymentOriginal.paymentAmount;
//                           break;
//                         }
//                       }
//                     }
//                   }
//                 }
//                 arrayInvoicePaymentGenerated.push(
//                   objectInvoicePaymentGenerated
//                 );
//                 objectInvoicePaymentGenerated = {};
//               }
//             }
//           }
//           // ================================================================
//         }
//       }
//       // console.log('Insertando el primer registro');

//       if (
//         arrayInvoicePaymentGenerated &&
//         arrayInvoicePaymentGenerated.length > 0
//       ) {
//         let count = 0;
//         arrayInvoicePaymentGenerated.forEach(elementInvoicePayment => {
//           let objectGeneratedToSave = { ...objectGenerated };
//           if (count > 0) {
//             objectGeneratedToSave.debtAmountCompanyCurrency = 0;
//             objectGeneratedToSave.creditAmountCompanyCurrency = 0;

//             objectGeneratedToSave.requestedAmountGenerated = 0;
//             objectGeneratedToSave.netPriceCompanyCurrencyGenerated = 0;
//             objectGeneratedToSave.deliveredQuantityGenerated = 0;
//             objectGeneratedToSave.deliveredValueGenerated = 0;
//             objectGeneratedToSave.deliveredValueCompanyCurrencyGenerated = 0;
//             objectGeneratedToSave.invoicedAmountGenerated = 0;
//             objectGeneratedToSave.invoicedValueGenerated = 0;
//             objectGeneratedToSave.invoicedValueCompanyCurrencyGenerated = 0;
//             objectGeneratedToSave.balanceQuantityEntryMerchandiseQuantitiesGenerated = 0;
//             objectGeneratedToSave.balanceQuantityEntryMerchandiseCurrenciesGenerated = 0;
//           }
//           objectGeneratedToSave.invoiceIdGenerated =
//             elementInvoicePayment.invoiceIdGenerated;
//           objectGeneratedToSave.supplierIdGenerated =
//             elementInvoicePayment.supplierIdGenerated;
//           objectGeneratedToSave.supplierNameGenerated =
//             elementInvoicePayment.supplierNameGenerated;
//           objectGeneratedToSave.externalDocumentIdGenerated =
//             elementInvoicePayment.externalDocumentIdGenerated;
//           objectGeneratedToSave.entryMerchandiseIdGenerated =
//             elementInvoicePayment.entryMerchandiseIdGenerated;
//           objectGeneratedToSave.grossAmountCompanyCurrencyGenerated =
//             elementInvoicePayment.grossAmountCompanyCurrencyGenerated;
//           objectGeneratedToSave.netAmountCompanyCurrencyGenerated =
//             elementInvoicePayment.netAmountCompanyCurrencyGenerated;
//           objectGeneratedToSave.quantityGenerated =
//             elementInvoicePayment.quantityGenerated;
//           objectGeneratedToSave.documentIdGenerated =
//             elementInvoicePayment.documentIdGenerated;
//           objectGeneratedToSave.createdAtGenerated =
//             elementInvoicePayment.createdAtGenerated;
//           objectGeneratedToSave.pyamentMethodGenerated =
//             elementInvoicePayment.pyamentMethodGenerated;
//           objectGeneratedToSave.businessPartnerNameGenerated =
//             elementInvoicePayment.businessPartnerNameGenerated;
//           objectGeneratedToSave.paymentAmountGenerated =
//             elementInvoicePayment.paymentAmountGenerated;
//           arrayGenerated.push(objectGeneratedToSave);
//           objectGeneratedToSave = {};
//           count += 1;
//         });
//       } else {
//         let objectGeneratedToSave = { ...objectGenerated };
//         arrayGenerated.push(objectGeneratedToSave);
//         objectGeneratedToSave = {};
//       }
//     }
//     const summaryLoadedData = new SummaryLoadedData('', 0);
//     console.log(
//       '>>>>>>>>> TIEMPO DE FINALIZACIÓN DE PROCESAMIENTO INFORMACION'
//     );
//     console.log(new Date());
//     console.log('Insert Data Init ', arrayGenerated.length);
//     // Actualizando información encabezado reporte
//     objectReportResume.state = 'entering_information';
//     objectReportResume.percentageCompletition = 66;
//     objectReportResume.counterRows = 0;
//     objectReportResume.message = 'Insertando Información';
//     await reportFunctionsUpdate.updateReportCreator(objectReportResume);

//     // Limpiando memoria general
//     masterReportData = null;
//     entryMerchandiseExtraDataMemory = null;
//     purchaseOrderTrackingDataMemory = null;
//     assistantReportDataEMMemory = null;
//     paymentExtraDataMemory = null;
//     paymentOriginalDataMemory = null;

//     await EntryMerchandiseAndServicesReportReport.collection
//       .insertMany(arrayGenerated)
//       .then(function() {
//         summaryLoadedData.message =
//           reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
//         summaryLoadedData.counter = arrayGenerated.length;
//         console.log('Insert Data Finish');
//         this.arrayGenerated = null;
//         async function finishReport() {
//           // Actualizando información encabezado reporte
//           objectReportResume.state = 'generated_report';
//           objectReportResume.percentageCompletition = 100;
//           objectReportResume.counterRows = arrayGenerated.length;
//           objectReportResume.message = 'Reporte cargado correctamente';
//           objectReportResume.endDate = new Date();
//           await reportFunctionsUpdate.updateReportCreator(objectReportResume);
//         }
//         finishReport();
//       })
//       .catch(function(error) {
//         // Limpiando memoria general
//         masterReportData = null;
//         entryMerchandiseExtraDataMemory = null;
//         purchaseOrderTrackingDataMemory = null;
//         assistantReportDataEMMemory = null;
//         paymentExtraDataMemory = null;
//         paymentOriginalDataMemory = null;
//         this.arrayGenerated = null;

//         summaryLoadedData.message =
//           reportGeneratorMessages.E_REPORT_GENERATOR_MS_03;
//         console.log('Insert Data Finish');
//         async function finishReport() {
//           // Actualizando información encabezado reporte
//           objectReportResume.state = 'error_report';
//           objectReportResume.percentageCompletition = 0;
//           objectReportResume.counterRows = 0;
//           objectReportResume.message =
//             'Ocurrió un error al generar el reporte de Entrada de Mercancias y Servicios. Por favor contácte a Soporte Técnico';
//           objectReportResume.endDate = new Date();
//           await reportFunctionsUpdate.updateReportCreator(objectReportResume);
//         }
//         finishReport();
//         console.log(error);
//       });
//     console.log(summaryLoadedData);
//     if (summaryLoadedData.counter > 0) {
//       console.log('voy a enviar de una vez la plantilla');
//       this.sendReportCSV(req, res);
//     }
//     return summaryLoadedData;
//   } catch (err) {
//     throw err;
//   }
// };

// =========== Function to count records of reports
exports.generateIvaReport = async (req, res) => {
  try {
    const objectReportResume = {};
    objectReportResume.code = 'EMEGR';
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
    await EntryMerchandiseAndServicesReportReport.collection.deleteMany({
      companyId: userInfo.companyId
    });
    const arrayGenerated = [];
    let objectGenerated = {};

    let arrayInvoicePaymentGenerated = [];
    let objectInvoicePaymentGenerated = {};

    console.log(' =========  Cargando en memoria');
    let masterReportData = await MasterReport.find({
      companyId: userInfo.companyId
      // ,       originalDocumentId: { $in: ['4747'] }
    }).lean();

    let entryMerchandiseExtraDataMemory = await EntryMerchandiseExtra.find({
      companyId: userInfo.companyId
    })
      .select({
        purchaseOrderId: 1,
        entryMerchandiseState: 1,
        entryMerchandiseId: 1
      })
      .lean();

    let purchaseOrderTrackingDataMemory = await PurchaseOrderTracking.find({
      companyId: userInfo.companyId
    })
      .select({
        requestedAmount: 1,
        netPriceCompanyCurrency: 1,
        deliveredQuantity: 1,
        deliveredValue: 1,
        deliveredValueCompanyCurrency: 1,
        invoicedAmount: 1,
        invoicedValue: 1,
        invoicedValueCompanyCurrency: 1,
        purchaseOrderId: 1
      })
      .lean();

    let assistantReportDataEMMemory = await AssistantReport.find({
      companyId: userInfo.companyId
    })
      .select({
        invoiceId: 1,
        supplierId: 1,
        supplierName: 1,
        externalDocumentId: 1,
        entryMerchandiseId: 1,
        grossAmountCompanyCurrency: 1,
        netAmountCompanyCurrency: 1,
        quantity: 1,
        supplierCoName: 1,
        supplierCoId: 1,
        refundCo: 1,
        originalPosition: 1,
        purchaseOrderId: 1
      })
      .lean();

    let paymentExtraDataMemory = await PaymentExtra.find({
      companyId: userInfo.companyId
    })
      .select({
        originalDocumentId: 1,
        documentId: 1
      })
      .lean();

    let paymentOriginalDataMemory = await PaymentOriginal.find({
      companyId: userInfo.companyId
    })
      .select({
        documentId: 1,
        createdAt: 1,
        pyamentMethod: 1,
        businessPartnerName: 1,
        paymentAmount: 1
      })
      .lean();

    // ===== ITERACION SOBRE MASTER REPORT ORIGINAL
    // ===== Paso 1.
    let temporaloriginalDocumentId = null;
    let temporaloriginalPosition = null;
    console.log('Cargada información Maestra en Memoria');
    let contador = 0;
    for await (const reportData of masterReportData) {
      objectGenerated = {};
      contador += 1;

      if (contador % 10000 === 0) {
        console.log(
          `En el registro:  ${contador}  con idDocumento:  ${reportData.originalDocumentId} -  ${reportData.originalPosition}-  ${reportData.operatingDocumentID} - ${reportData.operatingDocumentCounterpartID} `
        );
      }
      objectGenerated.seniorAccountantId = reportData.seniorAccountantId;
      objectGenerated.seniorAccountantName = reportData.seniorAccountantName;
      objectGenerated.postingDate = reportData.postingDate;
      objectGenerated.accountingSeat = reportData.accountingSeat;
      objectGenerated.externalReferenceId = reportData.externalReferenceId;
      objectGenerated.originalDocumentId = reportData.originalDocumentId;
      objectGenerated.accountingSeatType = reportData.accountingSeatType;
      objectGenerated.accountingSeatAnnulled =
        reportData.accountingSeatAnnulled;
      objectGenerated.originalDocumentAnnulledId =
        reportData.originalDocumentAnnulledId;
      objectGenerated.accountingSeatAnnulment =
        reportData.accountingSeatAnnulment;
      objectGenerated.extraOriginalDocumentAnulledId =
        reportData.extraOriginalDocumentAnulledId;
      objectGenerated.extraOriginalDocumentId =
        reportData.extraOriginalDocumentId;
      objectGenerated.originalDocumentPosition =
        reportData.originalDocumentPosition;

      objectGenerated.originalPosition = reportData.originalPosition;
      objectGenerated.operatingDocumentID = reportData.operatingDocumentID;
      objectGenerated.operatingDocumentCounterpartID =
        reportData.operatingDocumentCounterpartID;
      objectGenerated.thirdId = reportData.thirdId;
      objectGenerated.thirdName = reportData.thirdName;
      objectGenerated.businessPartnerID = reportData.businessPartnerID;
      objectGenerated.businessPartnerName = reportData.businessPartnerName;

      // NUEVOS CAMPOS DEL REPORT MASTER

      objectGenerated.originalDocumentDate = reportData.originalDocumentDate;
      objectGenerated.journalEntryHeaderText =
        reportData.journalEntryHeaderText;
      objectGenerated.accountingEntryItemText =
        reportData.accountingEntryItemText;

      objectGenerated.thirdIDExtra = reportData.thirdIDExtra;
      objectGenerated.thirdNameExtra = reportData.thirdNameExtra;

      objectGenerated.debtAmountCompanyCurrency =
        reportData.debtAmountCompanyCurrency;
      objectGenerated.creditAmountCompanyCurrency =
        reportData.creditAmountCompanyCurrency;
      objectGenerated.companyId = userInfo.companyId;
      objectGenerated.userId = userInfo._id;

      // Comprobamos si no es la primera iteracion para no volver a hacer el proceso
      if (
        temporaloriginalDocumentId === null &&
        temporaloriginalPosition === null
      ) {
        temporaloriginalDocumentId = reportData.originalDocumentId;
        temporaloriginalPosition = reportData.originalPosition;
      } else if (
        temporaloriginalDocumentId === reportData.originalDocumentId &&
        temporaloriginalPosition === reportData.originalPosition
      ) {
        // console.log('Es el mismo no voy a volver a buscar data');
        // console.log(objectGenerated);
        //console.table(arrayInvoicePaymentGenerated);

        if (
          arrayInvoicePaymentGenerated &&
          arrayInvoicePaymentGenerated.length > 0
        ) {
          let count = 0;
          arrayInvoicePaymentGenerated.forEach(elementInvoicePayment => {
            let objectGeneratedToSave = { ...objectGenerated };
            if (count > 0) {
              objectGeneratedToSave.debtAmountCompanyCurrency = 0;
              objectGeneratedToSave.creditAmountCompanyCurrency = 0;

              objectGeneratedToSave.requestedAmountGenerated = 0;
              objectGeneratedToSave.netPriceCompanyCurrencyGenerated = 0;
              objectGeneratedToSave.deliveredQuantityGenerated = 0;
              objectGeneratedToSave.deliveredValueGenerated = 0;
              objectGeneratedToSave.deliveredValueCompanyCurrencyGenerated = 0;
              objectGeneratedToSave.invoicedAmountGenerated = 0;
              objectGeneratedToSave.invoicedValueGenerated = 0;
              objectGeneratedToSave.invoicedValueCompanyCurrencyGenerated = 0;
              objectGeneratedToSave.balanceQuantityEntryMerchandiseQuantitiesGenerated = 0;
              objectGeneratedToSave.balanceQuantityEntryMerchandiseCurrenciesGenerated = 0;
            }
            objectGeneratedToSave.invoiceIdGenerated =
              elementInvoicePayment.invoiceIdGenerated;
            objectGeneratedToSave.supplierIdGenerated =
              elementInvoicePayment.supplierIdGenerated;
            objectGeneratedToSave.supplierNameGenerated =
              elementInvoicePayment.supplierNameGenerated;
            objectGeneratedToSave.externalDocumentIdGenerated =
              elementInvoicePayment.externalDocumentIdGenerated;
            objectGeneratedToSave.entryMerchandiseIdGenerated =
              elementInvoicePayment.entryMerchandiseIdGenerated;
            objectGeneratedToSave.grossAmountCompanyCurrencyGenerated =
              elementInvoicePayment.grossAmountCompanyCurrencyGenerated;
            objectGeneratedToSave.netAmountCompanyCurrencyGenerated =
              elementInvoicePayment.netAmountCompanyCurrencyGenerated;
            objectGeneratedToSave.quantityGenerated =
              elementInvoicePayment.quantityGenerated;
            objectGeneratedToSave.documentIdGenerated =
              elementInvoicePayment.documentIdGenerated;
            objectGeneratedToSave.createdAtGenerated =
              elementInvoicePayment.createdAtGenerated;
            objectGeneratedToSave.pyamentMethodGenerated =
              elementInvoicePayment.pyamentMethodGenerated;
            objectGeneratedToSave.businessPartnerNameGenerated =
              elementInvoicePayment.businessPartnerNameGenerated;
            objectGeneratedToSave.paymentAmountGenerated =
              elementInvoicePayment.paymentAmountGenerated;

            objectGeneratedToSave.supplierCoName =
              elementInvoicePayment.supplierCoName;
            objectGeneratedToSave.supplierCoId =
              elementInvoicePayment.supplierCoId;
            objectGeneratedToSave.refundCo = elementInvoicePayment.refundCo;
            objectGeneratedToSave.ivaCalculated =
              elementInvoicePayment.ivaCalculated;
            objectGeneratedToSave.ipoconsumoCalculated =
              elementInvoicePayment.ipoconsumoCalculated;

            objectGeneratedToSave.ivaValueCalculated =
              elementInvoicePayment.ivaValueCalculated;
            objectGeneratedToSave.ipoconsumoValueCalculated =
              elementInvoicePayment.ipoconsumoValueCalculated;

            arrayGenerated.push(objectGeneratedToSave);
            objectGeneratedToSave = {};
            count += 1;
          });
        } else {
          let objectGeneratedToSave = { ...objectGenerated };
          arrayGenerated.push(objectGeneratedToSave);
          objectGeneratedToSave = {};
        }

        continue;
      } else {
        // console.log('Pailas debo iterar nuevamente');
        arrayInvoicePaymentGenerated = [];
        // temporaloriginalPosition = null;

        // TENTATIVO MEJORAR PROCESAMIENTO
        temporaloriginalDocumentId = reportData.originalDocumentId;
        temporaloriginalPosition = reportData.originalPosition;

        // console.log('Finalizando insercion primer registro');
        // objectGenerated = {};
      }

      if (
        reportData.originalDocumentId &&
        reportData.originalDocumentId !== '#' &&
        reportData.originalDocumentId !== ''
      ) {
        // ===== Buscar Entrada de mercancias con el id Documento Original
        const entryMerchandiseExtraData = entryMerchandiseExtraDataMemory.filter(
          el => el.entryMerchandiseId === reportData.originalDocumentId
        );
        // ===== Comprobar si encontró mercancias con el id Documento original proporcionado
        if (entryMerchandiseExtraData && entryMerchandiseExtraData.length > 0) {
          // ===== Iteracion sobre la entrada de mercancias
          for await (const entryMerchandise of entryMerchandiseExtraData) {
            objectGenerated.entryMerchandiseStateGenerated =
              entryMerchandise.entryMerchandiseState;
            objectGenerated.purchaseOrderIdGenerated =
              entryMerchandise.purchaseOrderId;

            // ===== Buscar Serguimiento de Orden de compra
            // ===== Paso 2.
            if (
              entryMerchandise.purchaseOrderId &&
              reportData.purchaseOrderId !== '#' &&
              reportData.purchaseOrderId !== ''
            ) {
              const purchaseOrderTrackingData = purchaseOrderTrackingDataMemory.filter(
                el => el.purchaseOrderId === entryMerchandise.purchaseOrderId
              );

              if (
                purchaseOrderTrackingData &&
                purchaseOrderTrackingData.length > 0
              ) {
                // Iterar sobre el seguimiento de ordenes de Compra
                for await (const purchaseOrderTracking of purchaseOrderTrackingData) {
                  objectGenerated.requestedAmountGenerated =
                    purchaseOrderTracking.requestedAmount;
                  objectGenerated.netPriceCompanyCurrencyGenerated =
                    purchaseOrderTracking.netPriceCompanyCurrency;
                  objectGenerated.deliveredQuantityGenerated =
                    purchaseOrderTracking.deliveredQuantity;
                  objectGenerated.deliveredValueGenerated =
                    purchaseOrderTracking.deliveredValue;
                  objectGenerated.deliveredValueCompanyCurrencyGenerated =
                    purchaseOrderTracking.deliveredValueCompanyCurrency;
                  objectGenerated.invoicedAmountGenerated =
                    purchaseOrderTracking.invoicedAmount;
                  objectGenerated.invoicedValueGenerated =
                    purchaseOrderTracking.invoicedValue;
                  objectGenerated.invoicedValueCompanyCurrencyGenerated =
                    purchaseOrderTracking.invoicedValueCompanyCurrency;

                  // ===== Realizamos los calculos sociitados de sumas en cantidades con redondeo a dos decimales
                  // ===== Paso 3.
                  let deliveredQuantityNumber = 0;
                  let invoicedAmountNumber = 0;
                  let deliveredValueNumber = 0;
                  let invoicedValueNumber = 0;

                  if (objectGenerated.deliveredQuantityGenerated) {
                    deliveredQuantityNumber = parseFloat(
                      objectGenerated.deliveredQuantityGenerated
                    );
                  }

                  if (objectGenerated.invoicedAmountGenerated) {
                    invoicedAmountNumber = parseFloat(
                      objectGenerated.invoicedAmountGenerated
                    );
                  }

                  if (objectGenerated.deliveredValueGenerated) {
                    deliveredValueNumber = parseFloat(
                      objectGenerated.deliveredValueGenerated
                    );
                  }

                  if (objectGenerated.invoicedValueGenerated) {
                    invoicedValueNumber = parseFloat(
                      objectGenerated.invoicedValueGenerated
                    );
                  }

                  if (
                    !isNaN(deliveredQuantityNumber) &&
                    !isNaN(invoicedAmountNumber)
                  ) {
                    objectGenerated.balanceQuantityEntryMerchandiseQuantitiesGenerated = (
                      deliveredQuantityNumber - invoicedAmountNumber
                    ).toFixed(2);
                  }

                  if (
                    !isNaN(deliveredValueNumber) &&
                    !isNaN(invoicedValueNumber)
                  ) {
                    objectGenerated.balanceQuantityEntryMerchandiseCurrenciesGenerated = (
                      deliveredValueNumber - invoicedValueNumber
                    ).toFixed(2);
                  }

                  // ===== Buscar en el Assistant Report para armar información de facturas y pagos
                  // ===== Paso 4.

                  // ====== Importante, Comprobamos primero si existe el registro por entrada de mercancias, en caso contrario por factura
                  // ====== CASO A
                  let assistantReportFull = null;
                  const assistantReportDataEM = assistantReportDataEMMemory.filter(
                    el =>
                      el.entryMerchandiseId === reportData.originalDocumentId
                  );
                  if (
                    assistantReportDataEM &&
                    assistantReportDataEM.length > 0
                  ) {
                    assistantReportFull = assistantReportDataEM;
                  } else {
                    // ====== CASO B
                    // Comprobamos si existe data con el id de orden de compra basado en el id de documento operativo
                    let purchaseOrderId = '$$$$$'; // Defino un valor que nunca va a coincidir
                    const { operatingDocumentID } = reportData;
                    if (
                      operatingDocumentID &&
                      operatingDocumentID !== '#' &&
                      operatingDocumentID !== ''
                    ) {
                      purchaseOrderId = operatingDocumentID;
                    }
                    const assistantReportDataF = assistantReportDataEMMemory.filter(
                      el => el.purchaseOrderId === purchaseOrderId
                    );
                    if (
                      assistantReportDataF &&
                      assistantReportDataF.length > 0
                    ) {
                      assistantReportFull = assistantReportDataF;
                    } else {
                      // ====== CASO C
                      // Comprobamos si existe data con el id de orden de compra basado en el id de documento operativo de contrapartida
                      const { operatingDocumentCounterpartID } = reportData;
                      if (
                        operatingDocumentCounterpartID &&
                        operatingDocumentCounterpartID !== '#' &&
                        operatingDocumentCounterpartID !== ''
                      ) {
                        purchaseOrderId = operatingDocumentCounterpartID;
                      } else {
                        purchaseOrderId = '$$$$$';
                      }

                      const assistantReportDataX = assistantReportDataEMMemory.filter(
                        el => el.purchaseOrderId === purchaseOrderId
                      );
                      if (
                        assistantReportDataX &&
                        assistantReportDataX.length > 0
                      ) {
                        assistantReportFull = assistantReportDataX;
                      } else {
                        // ====== CASO C
                        // Comprobamos si existe data con el id de factura basado en el id de documento original
                        const assistantReportDataY = assistantReportDataEMMemory.filter(
                          el => el.invoiceId === reportData.originalDocumentId
                        );
                        if (
                          assistantReportDataY &&
                          assistantReportDataY.length > 0
                        ) {
                          assistantReportFull = assistantReportDataY;
                        }
                      }
                    }
                  }
                  // =========== Compruebo si existe data en cualquiera de los dos casos, entrada de mercancia o id factura para poder empezar a iterar y buscar la informacion de pagos
                  if (assistantReportFull && assistantReportFull.length > 0) {
                    // Iterar sobre el seguimiento de ordenes de Compra
                    let searchPosition = '';
                    let flagSelectIterate = false;
                    let flagBreakLoop = false;
                    for await (const assistantReport of assistantReportFull) {
                      const originalPositionToDestroy =
                        reportData.originalPosition;
                      // const originalPositionToDestroy = 'FP-8844-27.1';

                      if (searchPosition === '') {
                        let arrayOriginalPosition = originalPositionToDestroy.split(
                          '.'
                        );
                        if (arrayOriginalPosition.length > 1) {
                          flagSelectIterate = true;
                          const tempPosition = arrayOriginalPosition[0];
                          for (let i = tempPosition.length - 1; i > 0; i -= 1) {
                            const temp = tempPosition[i];
                            if (temp === '-') {
                              break;
                            } else {
                              searchPosition += temp;
                            }
                          }
                          searchPosition = searchPosition
                            .split('')
                            .reverse()
                            .join('');
                          flagSelectIterate = true;
                        } else {
                          arrayOriginalPosition = originalPositionToDestroy.split(
                            '-'
                          );
                          if (arrayOriginalPosition.length > 1) {
                            searchPosition = arrayOriginalPosition[1];
                            flagSelectIterate = true;
                          } else {
                            flagSelectIterate = false;
                          }
                        }
                      }
                      if (flagSelectIterate) {
                        if (
                          assistantReport.originalPosition !== searchPosition
                        ) {
                          continue;
                        } else {
                          searchPosition = '';
                          flagSelectIterate = false;
                          flagBreakLoop = true;
                        }
                      }

                      //-- FIN AJUSTE POSICIONES DE FACTURA
                      objectInvoicePaymentGenerated.invoiceIdGenerated =
                        assistantReport.invoiceId;
                      objectInvoicePaymentGenerated.supplierIdGenerated =
                        assistantReport.supplierId;
                      objectInvoicePaymentGenerated.supplierNameGenerated =
                        assistantReport.supplierName;
                      objectInvoicePaymentGenerated.externalDocumentIdGenerated =
                        assistantReport.externalDocumentId;
                      objectInvoicePaymentGenerated.entryMerchandiseIdGenerated =
                        assistantReport.entryMerchandiseId;
                      objectInvoicePaymentGenerated.grossAmountCompanyCurrencyGenerated =
                        assistantReport.grossAmountCompanyCurrency;
                      objectInvoicePaymentGenerated.netAmountCompanyCurrencyGenerated =
                        assistantReport.netAmountCompanyCurrency;
                      objectInvoicePaymentGenerated.quantityGenerated =
                        assistantReport.quantity;

                      // --- NUEVO AJUSTE PARA REEMBOLSOS 25/01/2021
                      objectInvoicePaymentGenerated.supplierCoName =
                        assistantReport.supplierCoName;
                      objectInvoicePaymentGenerated.supplierCoId =
                        assistantReport.supplierCoId;
                      objectInvoicePaymentGenerated.refundCo =
                        assistantReport.refundCo;
                      let grossAmountCompanyCurrency = 0;
                      let netAmountCompanyCurrency = 0;

                      if (assistantReport.grossAmountCompanyCurrency) {
                        grossAmountCompanyCurrency = parseFloat(
                          assistantReport.grossAmountCompanyCurrency
                        );
                      }

                      if (assistantReport.netAmountCompanyCurrency) {
                        netAmountCompanyCurrency = parseFloat(
                          assistantReport.netAmountCompanyCurrency
                        );
                      }

                      if (
                        !isNaN(grossAmountCompanyCurrency) &&
                        !isNaN(netAmountCompanyCurrency)
                      ) {
                        const taxCalculated = (
                          grossAmountCompanyCurrency - netAmountCompanyCurrency
                        ).toFixed(2);

                        // Determinando el porcentage del impuesto
                        const taxPercent = Math.round(
                          (taxCalculated * 100) / netAmountCompanyCurrency
                        );

                        if (taxPercent === 8) {
                          objectInvoicePaymentGenerated.ipoconsumoCalculated = taxPercent;
                          objectInvoicePaymentGenerated.ipoconsumoValueCalculated = taxCalculated;
                        } else {
                          objectInvoicePaymentGenerated.ivaCalculated = taxPercent;
                          objectInvoicePaymentGenerated.ivaValueCalculated = taxCalculated;
                        }
                      }
                      // --- FIN NUEVO AJUSTE

                      // Buscar el Id de la factura en PaymentExtras
                      if (
                        assistantReport.invoiceId &&
                        assistantReport.invoiceId !== '#' &&
                        assistantReport.invoiceId !== ''
                      ) {
                        const paymentExtraData = paymentExtraDataMemory.filter(
                          el => el.documentId === assistantReport.invoiceId
                        );

                        // Iterar sobre los pagos que están asociados a esta factura
                        for await (const paymentExtra of paymentExtraData) {
                          // Obtener la información faltante del pago para completar la tabla

                          if (
                            paymentExtra.originalDocumentId &&
                            paymentExtra.originalDocumentId !== '#' &&
                            paymentExtra.originalDocumentId !== ''
                          ) {
                            const paymentOriginalData = paymentOriginalDataMemory.filter(
                              el =>
                                el.documentId ===
                                paymentExtra.originalDocumentId
                            );
                            // Iterar sobre la información completa del pago
                            if (
                              paymentOriginalData &&
                              paymentOriginalData.length > 0
                            ) {
                              for await (const paymentOriginal of paymentOriginalData) {
                                if (
                                  paymentOriginal.businessPartnerName ===
                                  assistantReport.supplierName
                                ) {
                                  objectInvoicePaymentGenerated.documentIdGenerated =
                                    paymentOriginal.documentId;
                                  objectInvoicePaymentGenerated.createdAtGenerated =
                                    paymentOriginal.createdAt;
                                  objectInvoicePaymentGenerated.pyamentMethodGenerated =
                                    paymentOriginal.pyamentMethod;
                                  objectInvoicePaymentGenerated.businessPartnerNameGenerated =
                                    paymentOriginal.businessPartnerName;
                                  objectInvoicePaymentGenerated.paymentAmountGenerated =
                                    paymentOriginal.paymentAmount;
                                  break;
                                }
                              }
                            }
                          }
                        }
                        arrayInvoicePaymentGenerated.push(
                          objectInvoicePaymentGenerated
                        );
                        objectInvoicePaymentGenerated = {};
                        if (flagBreakLoop) {
                          flagBreakLoop = false;
                          break;
                        }
                      }
                    }
                  }
                  break;
                }
              } else {
                //console.log('No encontré seguimiento ');
                //  =============================================================
                //  ================== IMPORTANTE ES UNA VARIANTE DEL CASO 4 Y ES COPIA DEL CODIGO ANTERIOR

                // ===== Buscar en el Assistant Report para armar información de facturas y pagos
                // ===== Paso 4.

                // ====== Importante, Comprobamos primero si existe el registro por entrada de mercancias, en caso contrario por factura
                // ====== CASO A
                let assistantReportFull = null;
                const assistantReportDataEM = assistantReportDataEMMemory.filter(
                  el => el.entryMerchandiseId === reportData.originalDocumentId
                );
                if (assistantReportDataEM && assistantReportDataEM.length > 0) {
                  assistantReportFull = assistantReportDataEM;
                } else {
                  // ====== CASO B
                  // Comprobamos si existe data con el id de orden de compra basado en el id de documento operativo
                  let purchaseOrderId = '$$$$$'; // Defino un valor que nunca va a coincidir
                  const { operatingDocumentID } = reportData;
                  if (
                    operatingDocumentID &&
                    operatingDocumentID !== '#' &&
                    operatingDocumentID !== ''
                  ) {
                    purchaseOrderId = operatingDocumentID;
                  }
                  const assistantReportDataF = assistantReportDataEMMemory.filter(
                    el => el.purchaseOrderId === purchaseOrderId
                  );
                  if (assistantReportDataF && assistantReportDataF.length > 0) {
                    assistantReportFull = assistantReportDataF;
                  } else {
                    // ====== CASO C
                    // Comprobamos si existe data con el id de orden de compra basado en el id de documento operativo de contrapartida
                    const { operatingDocumentCounterpartID } = reportData;
                    if (
                      operatingDocumentCounterpartID &&
                      operatingDocumentCounterpartID !== '#' &&
                      operatingDocumentCounterpartID !== ''
                    ) {
                      purchaseOrderId = operatingDocumentCounterpartID;
                    } else {
                      purchaseOrderId = '$$$$$';
                    }

                    const assistantReportDataX = assistantReportDataEMMemory.filter(
                      el => el.purchaseOrderId === purchaseOrderId
                    );
                    if (
                      assistantReportDataX &&
                      assistantReportDataX.length > 0
                    ) {
                      assistantReportFull = assistantReportDataX;
                    } else {
                      // ====== CASO C
                      // Comprobamos si existe data con el id de factura basado en el id de documento original
                      const assistantReportDataY = assistantReportDataEMMemory.filter(
                        el => el.invoiceId === reportData.originalDocumentId
                      );
                      if (
                        assistantReportDataY &&
                        assistantReportDataY.length > 0
                      ) {
                        assistantReportFull = assistantReportDataY;
                      }
                    }
                  }
                }
                // =========== Compruebo si existe data en cualquiera de los dos casos, entrada de mercancia o id factura para poder empezar a iterar y buscar la informacion de pagos
                if (assistantReportFull && assistantReportFull.length > 0) {
                  // Iterar sobre el seguimiento de ordenes de Compra
                  let searchPosition = '';
                  let flagSelectIterate = false;
                  let flagBreakLoop = false;
                  for await (const assistantReport of assistantReportFull) {
                    const originalPositionToDestroy =
                      reportData.originalPosition;
                    // const originalPositionToDestroy = 'FP-8844-27.1';

                    if (searchPosition === '') {
                      let arrayOriginalPosition = originalPositionToDestroy.split(
                        '.'
                      );
                      if (arrayOriginalPosition.length > 1) {
                        flagSelectIterate = true;
                        const tempPosition = arrayOriginalPosition[0];
                        for (let i = tempPosition.length - 1; i > 0; i -= 1) {
                          const temp = tempPosition[i];
                          if (temp === '-') {
                            break;
                          } else {
                            searchPosition += temp;
                          }
                        }
                        searchPosition = searchPosition
                          .split('')
                          .reverse()
                          .join('');
                        flagSelectIterate = true;
                      } else {
                        arrayOriginalPosition = originalPositionToDestroy.split(
                          '-'
                        );
                        if (arrayOriginalPosition.length > 1) {
                          searchPosition = arrayOriginalPosition[1];
                          flagSelectIterate = true;
                        } else {
                          flagSelectIterate = false;
                        }
                      }
                    }
                    if (flagSelectIterate) {
                      if (assistantReport.originalPosition !== searchPosition) {
                        continue;
                      } else {
                        searchPosition = '';
                        flagSelectIterate = false;
                        flagBreakLoop = true;
                      }
                    }

                    //-- FIN AJUSTE POSICIONES DE FACTURA

                    objectInvoicePaymentGenerated.invoiceIdGenerated =
                      assistantReport.invoiceId;
                    objectInvoicePaymentGenerated.supplierIdGenerated =
                      assistantReport.supplierId;
                    objectInvoicePaymentGenerated.supplierNameGenerated =
                      assistantReport.supplierName;
                    objectInvoicePaymentGenerated.externalDocumentIdGenerated =
                      assistantReport.externalDocumentId;
                    objectInvoicePaymentGenerated.entryMerchandiseIdGenerated =
                      assistantReport.entryMerchandiseId;
                    objectInvoicePaymentGenerated.grossAmountCompanyCurrencyGenerated =
                      assistantReport.grossAmountCompanyCurrency;
                    objectInvoicePaymentGenerated.netAmountCompanyCurrencyGenerated =
                      assistantReport.netAmountCompanyCurrency;
                    objectInvoicePaymentGenerated.quantityGenerated =
                      assistantReport.quantity;

                    // --- NUEVO AJUSTE PARA REEMBOLSOS 25/01/2021
                    objectInvoicePaymentGenerated.supplierCoName =
                      assistantReport.supplierCoName;
                    objectInvoicePaymentGenerated.supplierCoId =
                      assistantReport.supplierCoId;
                    objectInvoicePaymentGenerated.refundCo =
                      assistantReport.refundCo;
                    let grossAmountCompanyCurrency = 0;
                    let netAmountCompanyCurrency = 0;

                    if (assistantReport.grossAmountCompanyCurrency) {
                      grossAmountCompanyCurrency = parseFloat(
                        assistantReport.grossAmountCompanyCurrency
                      );
                    }

                    if (assistantReport.netAmountCompanyCurrency) {
                      netAmountCompanyCurrency = parseFloat(
                        assistantReport.netAmountCompanyCurrency
                      );
                    }

                    if (
                      !isNaN(grossAmountCompanyCurrency) &&
                      !isNaN(netAmountCompanyCurrency)
                    ) {
                      const taxCalculated = (
                        grossAmountCompanyCurrency - netAmountCompanyCurrency
                      ).toFixed(2);

                      // Determinando el porcentage del impuesto
                      const taxPercent = Math.round(
                        (taxCalculated * 100) / netAmountCompanyCurrency
                      );

                      if (taxPercent === 8) {
                        objectInvoicePaymentGenerated.ipoconsumoCalculated = taxPercent;
                        objectInvoicePaymentGenerated.ipoconsumoValueCalculated = taxCalculated;
                      } else {
                        objectInvoicePaymentGenerated.ivaCalculated = taxPercent;
                        objectInvoicePaymentGenerated.ivaValueCalculated = taxCalculated;
                      }
                    }
                    // --- FIN NUEVO AJUSTE

                    // Buscar el Id de la factura en PaymentExtras
                    if (
                      assistantReport.invoiceId &&
                      assistantReport.invoiceId !== '#' &&
                      assistantReport.invoiceId !== ''
                    ) {
                      const paymentExtraData = paymentExtraDataMemory.filter(
                        el => el.documentId === assistantReport.invoiceId
                      );

                      // Iterar sobre los pagos que están asociados a esta factura
                      for await (const paymentExtra of paymentExtraData) {
                        // Obtener la información faltante del pago para completar la tabla

                        if (
                          paymentExtra.originalDocumentId &&
                          paymentExtra.originalDocumentId !== '#' &&
                          paymentExtra.originalDocumentId !== ''
                        ) {
                          const paymentOriginalData = paymentOriginalDataMemory.filter(
                            el =>
                              el.documentId === paymentExtra.originalDocumentId
                          );
                          // Iterar sobre la información completa del pago
                          if (
                            paymentOriginalData &&
                            paymentOriginalData.length > 0
                          ) {
                            for await (const paymentOriginal of paymentOriginalData) {
                              if (
                                paymentOriginal.businessPartnerName ===
                                assistantReport.supplierName
                              ) {
                                objectInvoicePaymentGenerated.documentIdGenerated =
                                  paymentOriginal.documentId;
                                objectInvoicePaymentGenerated.createdAtGenerated =
                                  paymentOriginal.createdAt;
                                objectInvoicePaymentGenerated.pyamentMethodGenerated =
                                  paymentOriginal.pyamentMethod;
                                objectInvoicePaymentGenerated.businessPartnerNameGenerated =
                                  paymentOriginal.businessPartnerName;
                                objectInvoicePaymentGenerated.paymentAmountGenerated =
                                  paymentOriginal.paymentAmount;
                                break;
                              }
                            }
                          }
                        }
                      }
                      arrayInvoicePaymentGenerated.push(
                        objectInvoicePaymentGenerated
                      );
                      objectInvoicePaymentGenerated = {};
                      if (flagBreakLoop) {
                        flagBreakLoop = false;
                        break;
                      }
                    }
                  }
                }
                // ================================================================
              }
            }
          }
        } else {
          //  =============================================================
          //  ================== IMPORTANTE ES UNA VARIANTE DEL CASO 4 Y ES COPIA DEL CODIGO ANTERIOR

          // ===== Buscar en el Assistant Report para armar información de facturas y pagos
          // ===== Paso 4.

          // ====== Importante, Comprobamos primero si existe el registro por entrada de mercancias, en caso contrario por factura
          // ====== CASO A
          let assistantReportFull = null;
          const assistantReportDataEM = assistantReportDataEMMemory.filter(
            el => el.entryMerchandiseId === reportData.originalDocumentId
          );
          if (assistantReportDataEM && assistantReportDataEM.length > 0) {
            assistantReportFull = assistantReportDataEM;
          } else {
            // ====== CASO B
            // Comprobamos si existe data con el id de orden de compra basado en el id de documento operativo
            let purchaseOrderId = '$$$$$'; // Defino un valor que nunca va a coincidir
            const { operatingDocumentID } = reportData;
            if (
              operatingDocumentID &&
              operatingDocumentID !== '#' &&
              operatingDocumentID !== ''
            ) {
              purchaseOrderId = operatingDocumentID;
            }
            const assistantReportDataF = assistantReportDataEMMemory.filter(
              el => el.purchaseOrderId === purchaseOrderId
            );
            if (assistantReportDataF && assistantReportDataF.length > 0) {
              assistantReportFull = assistantReportDataF;
            } else {
              // ====== CASO C
              // Comprobamos si existe data con el id de orden de compra basado en el id de documento operativo de contrapartida
              const { operatingDocumentCounterpartID } = reportData;
              if (
                operatingDocumentCounterpartID &&
                operatingDocumentCounterpartID !== '#' &&
                operatingDocumentCounterpartID !== ''
              ) {
                purchaseOrderId = operatingDocumentCounterpartID;
              } else {
                purchaseOrderId = '$$$$$';
              }

              const assistantReportDataX = assistantReportDataEMMemory.filter(
                el => el.purchaseOrderId === purchaseOrderId
              );
              if (assistantReportDataX && assistantReportDataX.length > 0) {
                assistantReportFull = assistantReportDataX;
              } else {
                // ====== CASO C
                // Comprobamos si existe data con el id de factura basado en el id de documento original
                const assistantReportDataY = assistantReportDataEMMemory.filter(
                  el => el.invoiceId === reportData.originalDocumentId
                );
                if (assistantReportDataY && assistantReportDataY.length > 0) {
                  assistantReportFull = assistantReportDataY;
                }
              }
            }
          }
          // =========== Compruebo si existe data en cualquiera de los dos casos, entrada de mercancia o id factura para poder empezar a iterar y buscar la informacion de pagos
          if (assistantReportFull && assistantReportFull.length > 0) {
            // Iterar sobre el seguimiento de ordenes de Compra
            let searchPosition = '';
            let flagSelectIterate = false;
            let flagBreakLoop = false;
            for await (const assistantReport of assistantReportFull) {
              const originalPositionToDestroy = reportData.originalPosition;
              // const originalPositionToDestroy = 'FP-8844-27.1';

              if (searchPosition === '') {
                let arrayOriginalPosition = originalPositionToDestroy.split(
                  '.'
                );
                if (arrayOriginalPosition.length > 1) {
                  flagSelectIterate = true;
                  const tempPosition = arrayOriginalPosition[0];
                  for (let i = tempPosition.length - 1; i > 0; i -= 1) {
                    const temp = tempPosition[i];
                    if (temp === '-') {
                      break;
                    } else {
                      searchPosition += temp;
                    }
                  }
                  searchPosition = searchPosition
                    .split('')
                    .reverse()
                    .join('');
                  flagSelectIterate = true;
                } else {
                  arrayOriginalPosition = originalPositionToDestroy.split('-');
                  if (arrayOriginalPosition.length > 1) {
                    searchPosition = arrayOriginalPosition[1];
                    flagSelectIterate = true;
                  } else {
                    flagSelectIterate = false;
                  }
                }
              }
              if (flagSelectIterate) {
                if (assistantReport.originalPosition !== searchPosition) {
                  continue;
                } else {
                  searchPosition = '';
                  flagSelectIterate = false;
                  flagBreakLoop = true;
                }
              }

              //-- FIN AJUSTE POSICIONES DE FACTURA

              objectInvoicePaymentGenerated.invoiceIdGenerated =
                assistantReport.invoiceId;
              objectInvoicePaymentGenerated.supplierIdGenerated =
                assistantReport.supplierId;
              objectInvoicePaymentGenerated.supplierNameGenerated =
                assistantReport.supplierName;
              objectInvoicePaymentGenerated.externalDocumentIdGenerated =
                assistantReport.externalDocumentId;
              objectInvoicePaymentGenerated.entryMerchandiseIdGenerated =
                assistantReport.entryMerchandiseId;
              objectInvoicePaymentGenerated.grossAmountCompanyCurrencyGenerated =
                assistantReport.grossAmountCompanyCurrency;
              objectInvoicePaymentGenerated.netAmountCompanyCurrencyGenerated =
                assistantReport.netAmountCompanyCurrency;
              objectInvoicePaymentGenerated.quantityGenerated =
                assistantReport.quantity;

              // --- NUEVO AJUSTE PARA REEMBOLSOS 25/01/2021
              objectInvoicePaymentGenerated.supplierCoName =
                assistantReport.supplierCoName;
              objectInvoicePaymentGenerated.supplierCoId =
                assistantReport.supplierCoId;
              objectInvoicePaymentGenerated.refundCo = assistantReport.refundCo;
              let grossAmountCompanyCurrency = 0;
              let netAmountCompanyCurrency = 0;

              if (assistantReport.grossAmountCompanyCurrency) {
                grossAmountCompanyCurrency = parseFloat(
                  assistantReport.grossAmountCompanyCurrency
                );
              }

              if (assistantReport.netAmountCompanyCurrency) {
                netAmountCompanyCurrency = parseFloat(
                  assistantReport.netAmountCompanyCurrency
                );
              }

              if (
                !isNaN(grossAmountCompanyCurrency) &&
                !isNaN(netAmountCompanyCurrency)
              ) {
                const taxCalculated = (
                  grossAmountCompanyCurrency - netAmountCompanyCurrency
                ).toFixed(2);

                // Determinando el porcentage del impuesto
                const taxPercent = Math.round(
                  (taxCalculated * 100) / netAmountCompanyCurrency
                );

                if (taxPercent === 8) {
                  objectInvoicePaymentGenerated.ipoconsumoCalculated = taxPercent;
                  objectInvoicePaymentGenerated.ipoconsumoValueCalculated = taxCalculated;
                } else {
                  objectInvoicePaymentGenerated.ivaCalculated = taxPercent;
                  objectInvoicePaymentGenerated.ivaValueCalculated = taxCalculated;
                }
              }
              // --- FIN NUEVO AJUSTE

              // Buscar el Id de la factura en PaymentExtras
              if (
                assistantReport.invoiceId &&
                assistantReport.invoiceId !== '#' &&
                assistantReport.invoiceId !== ''
              ) {
                const paymentExtraData = paymentExtraDataMemory.filter(
                  el => el.documentId === assistantReport.invoiceId
                );

                // Iterar sobre los pagos que están asociados a esta factura
                for await (const paymentExtra of paymentExtraData) {
                  // Obtener la información faltante del pago para completar la tabla

                  if (
                    paymentExtra.originalDocumentId &&
                    paymentExtra.originalDocumentId !== '#' &&
                    paymentExtra.originalDocumentId !== ''
                  ) {
                    const paymentOriginalData = paymentOriginalDataMemory.filter(
                      el => el.documentId === paymentExtra.originalDocumentId
                    );
                    // Iterar sobre la información completa del pago
                    if (paymentOriginalData && paymentOriginalData.length > 0) {
                      for await (const paymentOriginal of paymentOriginalData) {
                        if (
                          paymentOriginal.businessPartnerName ===
                          assistantReport.supplierName
                        ) {
                          objectInvoicePaymentGenerated.documentIdGenerated =
                            paymentOriginal.documentId;
                          objectInvoicePaymentGenerated.createdAtGenerated =
                            paymentOriginal.createdAt;
                          objectInvoicePaymentGenerated.pyamentMethodGenerated =
                            paymentOriginal.pyamentMethod;
                          objectInvoicePaymentGenerated.businessPartnerNameGenerated =
                            paymentOriginal.businessPartnerName;
                          objectInvoicePaymentGenerated.paymentAmountGenerated =
                            paymentOriginal.paymentAmount;
                          break;
                        }
                      }
                    }
                  }
                }
                arrayInvoicePaymentGenerated.push(
                  objectInvoicePaymentGenerated
                );
                objectInvoicePaymentGenerated = {};
              }
              if (flagBreakLoop) {
                flagBreakLoop = false;
                break;
              }
            }
          }
          // ================================================================
        }
      }
      // console.log('Insertando el primer registro');

      if (
        arrayInvoicePaymentGenerated &&
        arrayInvoicePaymentGenerated.length > 0
      ) {
        let count = 0;
        arrayInvoicePaymentGenerated.forEach(elementInvoicePayment => {
          let objectGeneratedToSave = { ...objectGenerated };
          if (count > 0) {
            objectGeneratedToSave.debtAmountCompanyCurrency = 0;
            objectGeneratedToSave.creditAmountCompanyCurrency = 0;

            objectGeneratedToSave.requestedAmountGenerated = 0;
            objectGeneratedToSave.netPriceCompanyCurrencyGenerated = 0;
            objectGeneratedToSave.deliveredQuantityGenerated = 0;
            objectGeneratedToSave.deliveredValueGenerated = 0;
            objectGeneratedToSave.deliveredValueCompanyCurrencyGenerated = 0;
            objectGeneratedToSave.invoicedAmountGenerated = 0;
            objectGeneratedToSave.invoicedValueGenerated = 0;
            objectGeneratedToSave.invoicedValueCompanyCurrencyGenerated = 0;
            objectGeneratedToSave.balanceQuantityEntryMerchandiseQuantitiesGenerated = 0;
            objectGeneratedToSave.balanceQuantityEntryMerchandiseCurrenciesGenerated = 0;
          }
          objectGeneratedToSave.invoiceIdGenerated =
            elementInvoicePayment.invoiceIdGenerated;
          objectGeneratedToSave.supplierIdGenerated =
            elementInvoicePayment.supplierIdGenerated;
          objectGeneratedToSave.supplierNameGenerated =
            elementInvoicePayment.supplierNameGenerated;
          objectGeneratedToSave.externalDocumentIdGenerated =
            elementInvoicePayment.externalDocumentIdGenerated;
          objectGeneratedToSave.entryMerchandiseIdGenerated =
            elementInvoicePayment.entryMerchandiseIdGenerated;
          objectGeneratedToSave.grossAmountCompanyCurrencyGenerated =
            elementInvoicePayment.grossAmountCompanyCurrencyGenerated;
          objectGeneratedToSave.netAmountCompanyCurrencyGenerated =
            elementInvoicePayment.netAmountCompanyCurrencyGenerated;
          objectGeneratedToSave.quantityGenerated =
            elementInvoicePayment.quantityGenerated;
          objectGeneratedToSave.documentIdGenerated =
            elementInvoicePayment.documentIdGenerated;
          objectGeneratedToSave.createdAtGenerated =
            elementInvoicePayment.createdAtGenerated;
          objectGeneratedToSave.pyamentMethodGenerated =
            elementInvoicePayment.pyamentMethodGenerated;
          objectGeneratedToSave.businessPartnerNameGenerated =
            elementInvoicePayment.businessPartnerNameGenerated;
          objectGeneratedToSave.paymentAmountGenerated =
            elementInvoicePayment.paymentAmountGenerated;

          objectGeneratedToSave.supplierCoName =
            elementInvoicePayment.supplierCoName;
          objectGeneratedToSave.supplierCoId =
            elementInvoicePayment.supplierCoId;
          objectGeneratedToSave.refundCo = elementInvoicePayment.refundCo;
          objectGeneratedToSave.ivaCalculated =
            elementInvoicePayment.ivaCalculated;
          objectGeneratedToSave.ipoconsumoCalculated =
            elementInvoicePayment.ipoconsumoCalculated;

          objectGeneratedToSave.ivaValueCalculated =
            elementInvoicePayment.ivaValueCalculated;
          objectGeneratedToSave.ipoconsumoValueCalculated =
            elementInvoicePayment.ipoconsumoValueCalculated;
          arrayGenerated.push(objectGeneratedToSave);
          objectGeneratedToSave = {};
          count += 1;
        });
      } else {
        let objectGeneratedToSave = { ...objectGenerated };
        arrayGenerated.push(objectGeneratedToSave);
        objectGeneratedToSave = {};
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
    entryMerchandiseExtraDataMemory = null;
    purchaseOrderTrackingDataMemory = null;
    assistantReportDataEMMemory = null;
    paymentExtraDataMemory = null;
    paymentOriginalDataMemory = null;

    await EntryMerchandiseAndServicesReportReport.collection
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
        entryMerchandiseExtraDataMemory = null;
        purchaseOrderTrackingDataMemory = null;
        assistantReportDataEMMemory = null;
        paymentExtraDataMemory = null;
        paymentOriginalDataMemory = null;
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
exports.deleteEntryMerchandiseAndServicesReport = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    await EntryMerchandiseAndServicesReportReport.collection.deleteMany({
      companyId: userInfo.companyId
    });

    // Defino objeto y variables estandar para el resumen de la carga
    const objectReportResume = {};
    objectReportResume.code = 'EOMS';
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
    objectReportResume.code = 'EMEGR';
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

    const reportData = await EntryMerchandiseAndServicesReportReport.find({
      companyId: userInfo.companyId
      // ,  originalDocumentId: { $in: ['4747'] }
    }).lean();

    const nameFile = 'ENTRADAS DE MERCANCIAS Y SERVICIOS';
    const pathTmp = path.resolve(__dirname, '../resources/uploads/');
    const pathx = `${pathTmp}//${nameFile}.csv`;

    const zip = new AdmZip();

    const csvWriter = createCsvWriter({
      path: pathx,
      fieldDelimiter: ';',
      header: [
        { id: 'seniorAccountantId', title: 'ID Cuenta de mayor' },
        { id: 'seniorAccountantName', title: 'Nombre Cuenta de mayor' },
        { id: 'postingDate', title: 'Fecha de contabilización' },
        { id: 'accountingSeat', title: 'Asiento contable' },
        { id: 'externalReferenceId', title: 'ID de referencia externa' },
        { id: 'originalDocumentId', title: 'ID de documento original' },

        { id: 'originalDocumentDate', title: 'Fecha de Documento Original' },
        { id: 'journalEntryHeaderText', title: 'Cabecera de Asiento Contable' },
        { id: 'accountingEntryItemText', title: 'Posicion Asiento Contable' },

        { id: 'thirdIDExtra', title: 'Id tercero extra' },
        { id: 'thirdNameExtra', title: 'Nombre tercero extra' },

        { id: 'accountingSeatType', title: 'Tipo de asiento contable' },

        { id: 'thirdId', title: 'ID Tercero' },
        { id: 'thirdName', title: 'Nombre Tercero' },
        { id: 'businessPartnerID', title: 'ID Socio Comercial' },
        { id: 'businessPartnerName', title: 'Nombre Socio Comercial' },

        { id: 'accountingSeatAnnulled', title: 'Asiento contable anulado' },
        { id: 'originalDocumentAnnulledId', title: 'ID de documento anulado' },
        {
          id: 'accountingSeatAnnulment',
          title: 'Asiento contable de anulación'
        },
        {
          id: 'extraOriginalDocumentAnulledId',
          title: 'ID de documento de anulación'
        },
        { id: 'extraOriginalDocumentId', title: 'ID doc.original' },
        {
          id: 'debtAmountCompanyCurrency',
          title: 'Importe en debe en moneda de empresa'
        },
        {
          id: 'creditAmountCompanyCurrency',
          title: 'Importe en haber en moneda de empresa'
        },
        // {
        //   id: 'entryMerchandiseIdGenerated',
        //   title: 'Id Entrada de Mercancias'
        // },
        // {
        //   id: 'entryMerchandiseStateGenerated',
        //   title: 'Estado Entrada de Mercancias y Servicios'
        // },
        // { id: 'purchaseOrderIdGenerated', title: 'Id pedido de compra' },
        // { id: 'requestedAmountGenerated', title: 'Cantidad Solicitada' },
        // {
        //   id: 'netPriceCompanyCurrencyGenerated',
        //   title: 'Precio Neto en moneda de la empresa'
        // },
        // { id: 'deliveredQuantityGenerated', title: 'Cantidad Entregada' },
        // { id: 'deliveredValueGenerated', title: 'Valor Entregado' },
        // {
        //   id: 'deliveredValueCompanyCurrencyGenerated',
        //   title: 'Valor entregado en Moneda de la Empresa'
        // },
        // { id: 'invoicedAmountGenerated', title: 'Cantidad Facturada' },
        // { id: 'invoicedValueGenerated', title: 'Valor Facturado' },
        // {
        //   id: 'invoicedValueCompanyCurrencyGenerated',
        //   title: 'Valor Facturado en Moneda de la Empresa'
        // },
        // {
        //   id: 'balanceQuantityEntryMerchandiseQuantitiesGenerated',
        //   title: 'Saldo de entrada de mercancias y servicios en cantidades'
        // },
        // {
        //   id: 'balanceQuantityEntryMerchandiseCurrenciesGenerated',
        //   title: 'Saldo de entrada de mercancias y servicios en pesos'
        // },
        { id: 'invoiceIdGenerated', title: 'Id Factura' },
        { id: 'supplierIdGenerated', title: 'Id proveedor' },
        { id: 'externalDocumentIdGenerated', title: 'Nombre proveedor' },
        { id: 'supplierNameGenerated', title: 'Id de documento Externo' },
        {
          id: 'grossAmountCompanyCurrencyGenerated',
          title: 'Valor bruto factura en Moneda de la empresa'
        },
        {
          id: 'netAmountCompanyCurrencyGenerated',
          title: 'Valor neto factura en Moneda de la empresa'
        },
        // { id: 'quantityGenerated', title: 'Cantidad Facturada Proveedor' },

        { id: 'supplierCoName', title: 'Reembolso' },
        { id: 'refundCo', title: 'Nombre Proveedor' },
        { id: 'supplierCoId', title: 'Id Proveedor' },
        { id: 'ivaValueCalculated', title: 'Valor Iva' },
        { id: 'ivaCalculated', title: '% Iva' },
        { id: 'ipoconsumoValueCalculated', title: 'Valor Ipoconsumo' },
        { id: 'ipoconsumoCalculated', title: '% Ipoconsumo' },

        { id: 'documentIdGenerated', title: 'Id pago' },
        { id: 'createdAtGenerated', title: 'Fecha de pago' },
        { id: 'pyamentMethodGenerated', title: 'Modalidad  de Pago' },
        { id: 'paymentAmountGenerated', title: 'Valor pagado' }
      ]
    });

    reportData.forEach(function(cursor, index, object) {
      cursor.postingDate = customValidator.stringFromDate(cursor.postingDate);
      cursor.createdAtGenerated = customValidator.stringFromDate(
        cursor.createdAtGenerated
      );
      if (cursor.seniorAccountantId === 'RESULTADO') {
        object.splice(index, 1);
      }

      if (cursor.supplierCoName === 'X') {
        if (cursor.supplierCoId && cursor.supplierCoId !== '#') {
          cursor.supplierNameGenerated = cursor.supplierCoId;
          cursor.supplierIdGenerated = cursor.refundCo;
        }
      }
    });

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

      zip.addLocalFile(pathx);
      const pathxZip = `${pathTmp}//${nameFile}.zip`;
      zip.writeZip(pathxZip);

      email.sendEmailWithAttachments({
        email: userInfo.email,
        subject: 'Generación de Reportes',
        message: message,
        path: pathxZip
      });
    });
  } catch (err) {
    throw err;
  }
};
