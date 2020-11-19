// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const entryMerchandiseController = require('../controllers/entryMerchandiseController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  entryMerchandiseController.loadEntryMerchandises
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  entryMerchandiseController.deleteEntryMerchandises
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  entryMerchandiseController.countEntryMerchandises
);

router.get(
  '/getEntryMerchandise/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  entryMerchandiseController.getEntryMerchandise
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  entryMerchandiseController.getAllEntryMerchandises
);

module.exports = router;
