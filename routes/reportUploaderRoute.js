// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const reportUploaderController = require('../controllers/reportUploaderController');
const authController = require('../controllers/common/authController');

const router = express.Router();
router.post(
  '/create',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  reportUploaderController.createReport
);

router.get(
  '/getReport/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin', 'reports'),
  reportUploaderController.getReport
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin', 'reports'),
  reportUploaderController.getAllAllReports
);

router.delete(
  '/deleteReport',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  reportUploaderController.deleteReport
);

module.exports = router;
