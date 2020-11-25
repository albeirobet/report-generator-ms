// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const reportCreatorController = require('../controllers/reportCreatorController');
const authController = require('../controllers/common/authController');

const router = express.Router();
router.get(
  '/generateEntryMerchandiseAndServicesReport',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  reportCreatorController.generateEntryMerchandiseAndServicesReport
);

router.post(
  '/create',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  reportCreatorController.createReport
);

router.get(
  '/getReport/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  reportCreatorController.getReport
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  reportCreatorController.getAllAllReports
);

module.exports = router;
