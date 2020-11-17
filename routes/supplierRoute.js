// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const supplierController = require('../controllers/supplierController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  supplierController.loadSuppliers
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  supplierController.deleteSuppliers
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  supplierController.countSuppliers
);

module.exports = router;
