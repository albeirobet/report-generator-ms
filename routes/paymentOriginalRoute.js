// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const paymentOriginalController = require('../controllers/paymentOriginalController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  paymentOriginalController.loadPaymentOriginalData
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  paymentOriginalController.deletePaymentOriginal
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  paymentOriginalController.countPaymentOriginal
);
router.get(
  '/getPaymentOriginal/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  paymentOriginalController.getPaymentOriginal
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  paymentOriginalController.getAllPaymentOriginal
);
module.exports = router;
