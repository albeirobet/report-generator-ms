// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const express = require('express');
const notFoundController = require('../../controllers/common/notFoundController');

const router = express.Router();

router.route('*').all(notFoundController.notFound);

module.exports = router;
