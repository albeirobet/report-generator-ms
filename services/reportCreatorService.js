/* eslint-disable no-continue */
/* eslint-disable no-loop-func */
/* eslint-disable no-undef */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-restricted-syntax */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS

const MasterReport = require('../models/masterReportModel');
const AssistantReport = require('../models/assistantReportModel');
const EntryMerchandiseExtra = require('../models/entryMerchandiseExtraModel');
const PurchaseOrderTracking = require('../models/purchaseOrderTrackingModel');
const MassyMasterReport = require('../models/massyMasterReportModel');
const PaymentOriginal = require('../models/paymentOriginalModel');
const PaymentExtra = require('../models/paymentExtraModel');
const reportGeneratorMessages = require('../utils/constants/reportGeneratorMessages');
const SummaryLoadedData = require('../dto/summaryLoadedDataDTO');
const userService = require('./userService');

// =========== Function to count records of reports
exports.generateIvaReport = async (req, res) => {
  try {
    console.time('>>>>>>>>> TIEMPO DE INICIO');
    console.log(new Date());
    const userInfo = await userService.getUserInfo(req, res);
    const arrayGenerated = [];
    const objectGenerated = {};

    let arrayInvoicePaymentGenerated = [];
    let objectInvoicePaymentGenerated = {};

    const masterReportData = await MasterReport.find({
      companyId: userInfo.companyId
      // originalDocumentId: { $in: [32572, 33139] }
    }).lean();

    // ===== ITERACION SOBRE MASTER REPORT ORIGINAL
    // ===== Paso 1.
    let temporaloriginalDocumentId = null;
    console.log('Cargada información Maestra en Memoria');
    for await (const reportData of masterReportData) {
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

        if (arrayInvoicePaymentGenerated) {
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
      if (entryMerchandiseExtraData) {
        // ===== Iteracion sobre la entrada de mercancias
        for await (const entryMerchandise of entryMerchandiseExtraData) {
          objectGenerated.entryMerchandiseStateGenerated =
            entryMerchandise.entryMerchandiseState;
          objectGenerated.purchaseOrderIdGenerated =
            entryMerchandise.purchaseOrderId;

          // ===== Buscar Serguimiento de Orden de compra
          // ===== Paso 2.
          const purchaseOrderTrackingData = await PurchaseOrderTracking.find({
            companyId: userInfo.companyId,
            purchaseOrderId: entryMerchandise.purchaseOrderId
          })
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
          if (purchaseOrderTrackingData) {
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

              if (!isNaN(deliveredValueNumber) && !isNaN(invoicedValueNumber)) {
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
              if (assistantReportDataEM) {
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
                if (assistantReportDataF) {
                  assistantReportFull = assistantReportDataF;
                }
              }
              // =========== Compruebo si existe data en cualquiera de los dos casos, entrada de mercancia o id factura para poder empezar a iterar y buscar la informacion de pagos
              if (assistantReportFull) {
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
                    if (paymentOriginalData) {
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
              break;
            }
          }
        }
      }
      // console.log('Insertando el primer registro');

      if (arrayInvoicePaymentGenerated) {
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
    console.time(
      '>>>>>>>>> TIEMPO DE FINALIZACIÓN DE PROCESAMIENTO INFORMACION'
    );
    console.log(new Date());
    console.log('Insert Data Init ', arrayGenerated.length);
    await MassyMasterReport.insertMany(arrayGenerated)
      .then(function() {
        summaryLoadedData.message =
          reportGeneratorMessages.M_REPORT_GENERATOR_MS_01;
        summaryLoadedData.counter = arrayGenerated.length;
        console.log('Insert Data Finish');
        console.time(
          '>>>>>>>>> TIEMPO DE FINALIZACIÓN DE INSERCION INFORMACION'
        );
        console.log(new Date());
      })
      .catch(function(error) {
        summaryLoadedData.message =
          reportGeneratorMessages.E_REPORT_GENERATOR_MS_03;
        console.log(error);
      });

    return summaryLoadedData;
  } catch (err) {
    throw err;
  }
};
