// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const counterController = require('../controllers/counterController');
const authController = require('../controllers/common/authController');

const router = express.Router();
router.get(
  '/',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  counterController.reportRecordCounter
);

module.exports = router;
