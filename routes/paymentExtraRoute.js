// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const paymentExtraController = require('../controllers/paymentExtraController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  paymentExtraController.loadPaymentExtraData
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  paymentExtraController.deletePaymentExtra
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  paymentExtraController.countPaymentExtra
);

module.exports = router;
