// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const purchaseOrderController = require('../controllers/purchaseOrderController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  purchaseOrderController.loadPurchaseOrders
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  purchaseOrderController.deletePurchaseOrders
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  purchaseOrderController.countPurchaseOrders
);

router.get(
  '/getPurchaseOrder/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  purchaseOrderController.getPurchaseOrder
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  purchaseOrderController.getAllPurchaseOrder
);

module.exports = router;
