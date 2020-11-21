// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const entryMerchandiseExtraController = require('../controllers/entryMerchandiseExtraController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  entryMerchandiseExtraController.loadEntryMerchandiseExtra
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  entryMerchandiseExtraController.deleteEntryMerchandiseExtra
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  entryMerchandiseExtraController.countEntryMerchandiseExtra
);

router.get(
  '/getService/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  entryMerchandiseExtraController.getEntryMerchandiseExtra
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  entryMerchandiseExtraController.getAllEntryMerchandiseExtra
);

module.exports = router;
