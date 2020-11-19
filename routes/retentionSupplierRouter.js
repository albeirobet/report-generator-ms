// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const retentionSupplierController = require('../controllers/retentionSupplierController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  retentionSupplierController.loadRetentionSupplier
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  retentionSupplierController.deleteRetentionSupplier
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  retentionSupplierController.countRetentionSupplier
);

router.get(
  '/getRetentionSupplier/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  retentionSupplierController.getRetentionSupplier
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  retentionSupplierController.getAllRetentionSupplier
);

module.exports = router;
