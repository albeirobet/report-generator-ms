// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const invoiceClientController = require('../controllers/invoiceClientController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  invoiceClientController.loadInvoiceClients
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  invoiceClientController.deleteInvoiceClients
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  invoiceClientController.countInvoiceClients
);

module.exports = router;
