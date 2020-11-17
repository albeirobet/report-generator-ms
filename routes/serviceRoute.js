// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const serviceController = require('../controllers/serviceController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  serviceController.loadServices
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  serviceController.deleteServices
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  serviceController.countServices
);

module.exports = router;
