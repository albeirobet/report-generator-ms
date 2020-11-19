// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const ivaController = require('../controllers/ivaController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  ivaController.loadIvaData
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  ivaController.deleteIvaData
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  ivaController.countIvaData
);

router.get(
  '/getIvaData/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  ivaController.getIvaData
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  ivaController.getAllIvaData
);

module.exports = router;
