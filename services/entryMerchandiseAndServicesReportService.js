/* eslint-disable no-restricted-syntax */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-continue */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const ExcelJS = require('exceljs');
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
const ReportDownloader = require('../models/reportDownloaderModel');
const reportGeneratorMessages = require('../utils/constants/reportGeneratorMessages');
const reportFunctionsUpdate = require('../utils/functions/reportFunctionsUpdate');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const userService = require('./userService');
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
      companyId: userInfo.companyId
      //,      originalDocumentId: { $in: ['FP-51950', 'FP-51959', '32380'] }
      //originalDocumentId: { $in: ['32380'] }
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
      console.log(
        `En el registro:  ${contador}  con idDocumento:  ${reportData.originalDocumentId}`
      );
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
                console.log('No encontré seguimiento ');
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

    await EntryMerchandiseAndServicesReportReport.insertMany(arrayGenerated)
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
    return summaryLoadedData;
  } catch (err) {
    throw err;
  }
};

// =========== Function to delete MasterReport
exports.deleteEntryMerchandiseAndServicesReport = async (req, res) => {
  try {
    const userInfo = await userService.getUserInfo(req, res);
    await EntryMerchandiseAndServicesReportReport.deleteMany({
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

exports.downloadEntryMerchandiseAndServicesReport = async (req, res) => {
  const objectReportResume = {};
  objectReportResume.code = 'EMEGR';
  try {
    objectReportResume.startDate = new Date();
    const userInfo = await userService.getUserInfo(req, res);
    objectReportResume.companyId = userInfo.companyId;
    objectReportResume.generatorUserId = userInfo._id;
    const reportInfo = await ReportDownloader.find({
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

    const reportData = await EntryMerchandiseAndServicesReportReport.find({
      companyId: userInfo.companyId
    }).lean();
    console.log('Cargado información en memoría para generar reporte');
    // console.log(reportData);
    // Actualizando información encabezado reporte
    objectReportResume.state = 'processing';
    objectReportResume.percentageCompletition = 33;
    objectReportResume.counterRows = 0;
    objectReportResume.message = 'Procesando Información';
    objectReportResume.endDate = null;
    await reportFunctionsUpdate.updateReportDownloader(objectReportResume);
    const nameFile = 'ENTRADAS_DE_MERCANCIAS_Y_SERVICIOS';
    // NO PUEDE EXCEDER 31 CARACTERES
    const sheetName = 'MERCANCÍAS Y SERVICIOS';
    const reportTitle =
      'REPORTE SEGUIMIENTO ENTRADAS DE MERCANCÍAS Y SERVICIOS';
    const reportSubtitle = 'Reporte Generado para:  Massy SAS';
    const reportDate = `Reporte Generado el:  ${customValidator.stringFromDate(
      new Date()
    )}`;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'RunCode Ingeniería SAS';
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet(sheetName);

    /*TITLE*/
    worksheet.mergeCells('A2', 'H2');
    worksheet.getCell('A2').value = reportTitle;
    worksheet.getCell('A2').font = {
      name: 'Arial',
      size: 14,
      bold: true
    };

    /*SUBTITLE*/
    worksheet.mergeCells('A3', 'H3');
    worksheet.getCell('A3').value = reportSubtitle;
    worksheet.getCell('A3').font = {
      name: 'Arial',
      size: 11
    };

    /*DATE*/
    worksheet.mergeCells('A4', 'H4');
    worksheet.getCell('A4').value = reportDate;
    worksheet.getCell('A4').font = {
      name: 'Arial',
      size: 11
    };

    /*MARK*/
    worksheet.mergeCells('A5', 'H5');
    worksheet.getCell(
      'A5'
    ).value = `Generado en: RunCode Reports ${new Date().getFullYear()}`;
    worksheet.getCell('A5').font = {
      name: 'Arial',
      size: 9,
      bold: true
    };

    const rowsArray = [];
    console.log('Armando información para cargar en tabla excel');
    reportData.forEach(data => {
      delete data._id;
      const {
        seniorAccountantId = '',
        seniorAccountantName = '',
        postingDate = '',
        accountingSeat = '',
        externalReferenceId = '',
        originalDocumentId = '',
        accountingSeatType = '',
        accountingSeatAnnulled = '',
        originalDocumentAnnulledId = '',
        accountingSeatAnnulment = '',
        extraOriginalDocumentAnulledId = '',
        extraOriginalDocumentId = '',
        debtAmountCompanyCurrency = '',
        creditAmountCompanyCurrency = '',
        entryMerchandiseIdGenerated = '',
        entryMerchandiseStateGenerated = '',
        purchaseOrderIdGenerated = '',
        requestedAmountGenerated = '',
        netPriceCompanyCurrencyGenerated = '',
        deliveredQuantityGenerated = '',
        deliveredValueGenerated = '',
        deliveredValueCompanyCurrencyGenerated = '',
        invoicedAmountGenerated = '',
        invoicedValueGenerated = '',
        invoicedValueCompanyCurrencyGenerated = '',
        balanceQuantityEntryMerchandiseQuantitiesGenerated = '',
        balanceQuantityEntryMerchandiseCurrenciesGenerated = '',
        invoiceIdGenerated = '',
        supplierIdGenerated = '',
        supplierNameGenerated = '',
        externalDocumentIdGenerated = '',
        grossAmountCompanyCurrencyGenerated = '',
        netAmountCompanyCurrencyGenerated = '',
        quantityGenerated = '',
        documentIdGenerated = '',
        createdAtGenerated = '',
        pyamentMethodGenerated = '',
        paymentAmountGenerated = ''
      } = data;
      const dataFields = [];
      dataFields.push(
        seniorAccountantId,
        seniorAccountantName,
        customValidator.stringFromDate(postingDate),
        accountingSeat,
        externalReferenceId,
        originalDocumentId,
        accountingSeatType,
        accountingSeatAnnulled,
        originalDocumentAnnulledId,
        accountingSeatAnnulment,
        extraOriginalDocumentAnulledId,
        extraOriginalDocumentId,
        debtAmountCompanyCurrency,
        creditAmountCompanyCurrency,
        entryMerchandiseIdGenerated,
        entryMerchandiseStateGenerated,
        purchaseOrderIdGenerated,
        requestedAmountGenerated,
        netPriceCompanyCurrencyGenerated,
        deliveredQuantityGenerated,
        deliveredValueGenerated,
        deliveredValueCompanyCurrencyGenerated,
        invoicedAmountGenerated,
        invoicedValueGenerated,
        invoicedValueCompanyCurrencyGenerated,
        balanceQuantityEntryMerchandiseQuantitiesGenerated,
        balanceQuantityEntryMerchandiseCurrenciesGenerated,
        invoiceIdGenerated,
        supplierIdGenerated,
        supplierNameGenerated,
        externalDocumentIdGenerated,
        grossAmountCompanyCurrencyGenerated,
        netAmountCompanyCurrencyGenerated,
        quantityGenerated,
        documentIdGenerated,
        customValidator.stringFromDate(createdAtGenerated),
        pyamentMethodGenerated,
        paymentAmountGenerated
      );

      rowsArray.push(dataFields);
    });
    console.log('Insertando información  en tabla excel');
    // Actualizando información encabezado reporte
    objectReportResume.state = 'entering_information';
    objectReportResume.percentageCompletition = 66;
    objectReportResume.counterRows = rowsArray.length;
    objectReportResume.message = 'Insertando Información';
    await reportFunctionsUpdate.updateReportDownloader(objectReportResume);

    worksheet.addTable({
      name: 'EMEGR',
      ref: 'A7',
      headerRow: true,
      style: {
        theme: 'TableStyleLight9',
        showRowStripes: true
      },
      // Los nombres de las columnas no se puden repetir
      columns: [
        { name: 'ID Cuenta de mayor', filterButton: true },
        { name: 'Nombre Cuenta de mayor', filterButton: true },
        { name: 'Fecha de contabilización', filterButton: true },
        { name: 'Asiento contable', filterButton: true },
        { name: 'ID de referencia externa', filterButton: true },
        { name: 'ID de documento original', filterButton: true },
        { name: 'Tipo de asiento contable', filterButton: true },
        { name: 'Asiento contable anulado', filterButton: true },
        { name: 'ID de documento anulado', filterButton: true },
        { name: 'Asiento contable de anulación', filterButton: true },
        { name: 'ID de documento de anulación', filterButton: true },
        { name: 'ID doc.original', filterButton: true },
        { name: 'Importe en debe en moneda de empresa', filterButton: true },
        { name: 'Importe en haber en moneda de empresa', filterButton: true },
        { name: 'Id Entrada de Mercancias', filterButton: true },
        {
          name: 'Estado Entrada de Mercancias y Servicios',
          filterButton: true
        },
        { name: 'Id pedido de compra', filterButton: true },
        { name: 'Cantidad Solicitada', filterButton: true },
        { name: 'Precio Neto en moneda de la empresa', filterButton: true },
        { name: 'Cantidad Entregada', filterButton: true },
        { name: 'Valor Entregado', filterButton: true },
        { name: 'Valor entregado en Moneda de la Empresa', filterButton: true },
        { name: 'Cantidad Facturada', filterButton: true },
        { name: 'Valor Facturado', filterButton: true },
        { name: 'Valor Facturado en Moneda de la Empresa', filterButton: true },
        {
          name: 'Saldo de entrada de mercancias y servicios en cantidades',
          filterButton: true
        },
        {
          name: 'Saldo de entrada de mercancias y servicios en pesos',
          filterButton: true
        },
        { name: 'Id Factura', filterButton: true },
        { name: 'Id proveedor', filterButton: true },
        { name: 'Nombre proveedor', filterButton: true },
        { name: 'Id de documento Externo', filterButton: true },
        {
          name: 'Valor bruto factura en Moneda de la empresa',
          filterButton: true
        },
        {
          name: 'Valor neto factura en Moneda de la empresa',
          filterButton: true
        },
        { name: 'Cantidad Facturada Proveedor', filterButton: true },
        { name: 'Id pago', filterButton: true },
        { name: 'Fecha de pago', filterButton: true },
        { name: 'Modalidad  de Pago', filterButton: true },
        { name: 'Valor pagado', filterButton: true }
      ],

      rows: rowsArray
    });

    // eslint-disable-next-line no-unused-vars
    worksheet.columns.forEach(function(column, i) {
      column.width = 28;
    });

    // Actualizando información encabezado reporte
    objectReportResume.state = 'generated_report';
    objectReportResume.percentageCompletition = 100;
    objectReportResume.counterRows = rowsArray.length;
    objectReportResume.message =
      'Reporte generado correctamente. En proceso de Descarga';
    objectReportResume.endDate = new Date();
    await reportFunctionsUpdate.updateReportDownloader(objectReportResume);
    console.log('Generando archivo excel de respuesta');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${nameFile}.xlsx`
    );

    return workbook.xlsx.write(res).then(function() {
      res.status(200).end();
    });
  } catch (error) {
    // Actualizando información encabezado reporte
    objectReportResume.state = 'error_report';
    objectReportResume.percentageCompletition = 0;
    objectReportResume.counterRows = 0;
    objectReportResume.message =
      'Ocurrió un error al generar el reporte de Entrada de Mercancias y Servicios. Por favor contácte a Soporte Técnico';
    objectReportResume.endDate = new Date();
    await reportFunctionsUpdate.updateReportDownloader(objectReportResume);
    throw error;
  }
};
