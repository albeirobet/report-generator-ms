// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const invoiceSupplierController = require('../controllers/invoiceSupplierController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  invoiceSupplierController.loadInvoiceSupplier
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  invoiceSupplierController.deleteInvoiceSupplier
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  invoiceSupplierController.countInvoiceSupplier
);

router.get(
  '/getInvoiceSupplier/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  invoiceSupplierController.getInvoiceSupplier
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  invoiceSupplierController.getAllInvoiceSuppliers
);
module.exports = router;
