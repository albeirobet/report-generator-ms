// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const reportEnableController = require('../controllers/reportEnableController');
const authController = require('../controllers/common/authController');

const router = express.Router();
router.post(
  '/create',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  reportEnableController.createReport
);

router.get(
  '/getReport/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin', 'reports'),
  reportEnableController.getReport
);

router.get(
  '/getReportByCode/:code',
  authController.protectPath,
  authController.protectPathWithRoles('admin', 'reports'),
  reportEnableController.getReportByCode
);

router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin', 'reports'),
  reportEnableController.getAllAllReports
);

router.get(
  '/allByType',
  authController.protectPath,
  authController.protectPathWithRoles('admin', 'reports'),
  reportEnableController.getAllAllReportsByType
);
module.exports = router;
