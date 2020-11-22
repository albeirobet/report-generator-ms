// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const reportCreatorController = require('../controllers/reportCreatorController');
const authController = require('../controllers/common/authController');

const router = express.Router();
router.get(
  '/generateIvaReport',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  reportCreatorController.generateIvaReport
);

module.exports = router;
