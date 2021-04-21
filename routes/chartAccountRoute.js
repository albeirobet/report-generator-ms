// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const controler = require('../controllers/chartAccountController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  controler.load
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  controler.delete
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  controler.count
);

router.get(
  '/getService/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  controler.get
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  controler.getAll
);

module.exports = router;
