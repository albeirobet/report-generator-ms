// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const reportDownloaderController = require('../controllers/reportDownloaderController');
const authController = require('../controllers/common/authController');

const router = express.Router();
router.post(
  '/create',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  reportDownloaderController.createReport
);

router.get(
  '/getReport/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  reportDownloaderController.getReport
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  reportDownloaderController.getAllAllReports
);

module.exports = router;
