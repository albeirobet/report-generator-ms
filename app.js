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
  max: 100,
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
// 6. Purchase Orders
app.use('/api/v1/entryMerchandises', entryMerchandiseRoute);
// ... End Not Found Route
app.all('*', notFoundRoute);

module.exports = app;
