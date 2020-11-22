// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const purchaseOrderTrackingController = require('../controllers/purchaseOrderTrackingController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  purchaseOrderTrackingController.loadPurchaseOrderTracking
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  purchaseOrderTrackingController.deletePurchaseOrder
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  purchaseOrderTrackingController.countPurchaseOrder
);

router.get(
  '/getService/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  purchaseOrderTrackingController.getPurchaseOrder
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  purchaseOrderTrackingController.getAllPurchaseOrders
);

module.exports = router;
