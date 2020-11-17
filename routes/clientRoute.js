// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const clientController = require('../controllers/clientController');
const authController = require('../controllers/common/authController');
const upload = require('../middlewares/upload');

const router = express.Router();

router.post(
  '/load',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  upload.single('file'),
  clientController.loadClients
);
router.delete(
  '/delete',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  clientController.deleteClients
);
router.get(
  '/count',
  authController.protectPath,
  authController.protectPathWithRoles('admin'),
  clientController.countClients
);

module.exports = router;
