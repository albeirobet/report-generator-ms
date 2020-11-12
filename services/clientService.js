// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
const readXlsxFile = require('read-excel-file/node');
const path = require('path');
const fs = require('fs');
const ApiError = require('../dto/commons/response/apiErrorDTO');
const ServiceException = require('../utils/errors/serviceException');
const commonErrors = require('../utils/constants/commonErrors');
const reportGeneratorMessages = require('../utils/constants/reportGeneratorMessages');
const Client = require('../models/clientModel');
const httpCodes = require('../utils/constants/httpCodes');
const constants = require('../utils/constants/constants');

// =========== Function to loadClients
exports.loadClients = async (req, res) => {
  try {
    if (req.file === undefined) {
      throw new ServiceException(
        commonErrors.E_COMMON_01,
        new ApiError(
          `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_01}`,
          `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_01}`,
          'E_REPORT_GENERATOR_MS_01',
          httpCodes.BAD_REQUEST
        )
      );
    }
    const pathTmp = path.resolve(__dirname, '../resources/uploads/');
    const pathx = `${pathTmp}//${req.file.filename}`;
    const clients = [];
    let count = 0;
    await readXlsxFile(pathx).then(rows => {
      rows.forEach(row => {
        if (count === 0) {
          const fileTitle = row[0];
          console.log(fileTitle);
          if (fileTitle !== constants.CLIENT_TEMPLATE_TITLE) {
            throw new ServiceException(
              commonErrors.E_COMMON_01,
              new ApiError(
                `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_02}`,
                `${reportGeneratorMessages.E_REPORT_GENERATOR_MS_02}`,
                'E_REPORT_GENERATOR_MS_02',
                httpCodes.BAD_REQUEST
              )
            );
          }
        }

        if (count > constants.CLIENT_TEMPLATE_ROW_INIT) {
          const client = {
            state: row[0],
            client: row[1],
            name: row[2],
            address: row[3],
            city: row[4],
            email: row[5],
            department: row[6],
            identificationNumber: row[7],
            country: row[8]
          };
          clients.push(client);
        }
        count += 1;
      });
    });

    await Client.insertMany(clients)
      .then(function() {
        console.log('Data inserted');
      })
      .catch(function(error) {
        console.log(error);
      });

    fs.unlink(pathx, function(err) {
      if (err) throw err;
      console.log('File deleted!');
    });
  } catch (error) {
    throw error;
  }
};
