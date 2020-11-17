// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const masterReportController = require('../controllers/masterReportController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  masterReportController.loadMasterReportData
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  masterReportController.deleteMasterReport
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  masterReportController.countMasterReport
);

module.exports = router;
