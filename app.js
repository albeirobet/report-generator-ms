// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const cors = require('cors');
const notFoundRoute = require('./routes/common/notFoundRoute');
const clientRoute = require('./routes/clientRoute');
const supplierRoute = require('./routes/supplierRoute');
const serviceRoute = require('./routes/serviceRoute');
const materialRoute = require('./routes/materialRoute');
const purchaseOrderRoute = require('./routes/purchaseOrderRoute');
const entryMerchandiseRoute = require('./routes/entryMerchandiseRoute');
const invoiceSupplierRoute = require('./routes/invoiceSupplierRouter');
const retentionSupplierRoute = require('./routes/retentionSupplierRouter');
const invoiceClientRoute = require('./routes/invoiceClientRoute');
const masterReportRoute = require('./routes/masterReportRoute');
const assistantReportRoute = require('./routes/assistantReportRoute');
const paymentOriginalRoute = require('./routes/paymentOriginalRoute');
const paymentExtraRoute = require('./routes/paymentExtraRoute');
const counterRoute = require('./routes/counterRoute');
const ivaRoute = require('./routes/ivaRoute');
const entryMerchandiseExtraRoute = require('./routes/entryMerchandiseExtraRoute');
const reportCreatorRoute = require('./routes/reportCreatorRoute');
const reportUploaderRoute = require('./routes/reportUploaderRoute');
const purchaseOrderTrackingRoute = require('./routes/purchaseOrderTrackingRoute');
const reportDownloaderRoute = require('./routes/reportDownloaderRoute');
const reportEnableRoute = require('./routes/reportEnableRoute');
const withHoldingNotesRoute = require('./routes/withHoldingNotesRoute');
const chartAccountRoute = require('./routes/chartAccountRoute');

const app = express();

// 1) GLOBAL MIDDLEWARES
// Cors
app.use(cors());
// Permit All
app.options('*', cors());
// Select Permit
// app.use(
//   cors({
//     origin: 'http://localhost:4200'
//   })
// );

// Set security HTTP headers
app.use(helmet());
// 1. Morgan, middleware to get url of request, only on dev enviroment Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000, // One Hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json());

// To compress text response to clients
app.use(compression());

// 2. Ignore call favicon
app.use((req, res, next) => {
  if (req.url === '/favicon.ico') {
    res.status(204).json({ nope: true });
  } else {
    next();
  }
});

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// ================= ROUTES DEFINITION
// 1. Clients Route
app.use('/api/v1/clients', clientRoute);
// 2. Suppliers Route
app.use('/api/v1/suppliers', supplierRoute);
// 3. Services Route
app.use('/api/v1/services', serviceRoute);
// 4. Materials Route
app.use('/api/v1/materials', materialRoute);
// 5. Purchase Orders
app.use('/api/v1/purchaseOrders', purchaseOrderRoute);
// 6. Entry Merchandise
app.use('/api/v1/entryMerchandises', entryMerchandiseRoute);
// 7. Invoice Supplier
app.use('/api/v1/invoiceSupplier', invoiceSupplierRoute);
// 8. Retention Supplier
app.use('/api/v1/retentionSupplier', retentionSupplierRoute);
// 9. Invoice Clients
app.use('/api/v1/invoiceClient', invoiceClientRoute);
// 10. Master Report
app.use('/api/v1/masterReport', masterReportRoute);
// 11. Assistant Report
app.use('/api/v1/assistantReport', assistantReportRoute);
// 12. Payment Original
app.use('/api/v1/paymentOriginal', paymentOriginalRoute);
// 13. Payment Extra
app.use('/api/v1/paymentExtra', paymentExtraRoute);
// 14. Counter
app.use('/api/v1/counter', counterRoute);
// 15. Iva
app.use('/api/v1/iva', ivaRoute);
// 16. Entry Merchandise Extra
app.use('/api/v1/entryMerchandiseExtra', entryMerchandiseExtraRoute);
// 17. Report Creator
app.use('/api/v1/reportCreator', reportCreatorRoute);
// 18. Purchase order tracking
app.use('/api/v1/purchaseOrderTracking', purchaseOrderTrackingRoute);
// 19. Upload Reports
app.use('/api/v1/reportUploader', reportUploaderRoute);
// 20. Download Reports
app.use('/api/v1/reportDownloader', reportDownloaderRoute);
// 20. Enabled Reports
app.use('/api/v1/reportEnable', reportEnableRoute);
// 21. WithHolding Notes
app.use('/api/v1/withHoldingNotes', withHoldingNotesRoute);
// 22. Chart Account
app.use('/api/v1/chartAccounts', chartAccountRoute);

// ... End Not Found Route
app.all('*', notFoundRoute);

module.exports = app;
