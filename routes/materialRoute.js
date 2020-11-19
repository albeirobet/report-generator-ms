// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const materialController = require('../controllers/materialController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  materialController.loadMaterials
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  materialController.deleteMaterials
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  materialController.countMaterials
);

router.get(
  '/getMaterial/:id',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  materialController.getMaterial
);
router.get(
  '/all',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  materialController.getAllMaterials
);

module.exports = router;
