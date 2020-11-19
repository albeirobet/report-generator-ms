// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const assistantReportController = require('../controllers/assistantReportController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  assistantReportController.loadAssistantReportData
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  assistantReportController.deleteAssistantReport
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  assistantReportController.countAssistantReport
);

router.get(
  '/getAssistantReport/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  assistantReportController.getAssistantReport
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  assistantReportController.getAllAssistantReports
);

module.exports = router;
