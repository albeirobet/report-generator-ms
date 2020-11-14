const multer = require('multer');
const path = require('path');

const excelFilter = (req, file, cb) => {
  if (
    file.mimetype.includes('excel') ||
    file.mimetype.includes('spreadsheetml')
  ) {
    cb(null, true);
  } else {
    // TODO
    cb('Please upload only excel file.', false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../resources/uploads/'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-runcode-${file.originalname}`);
  }
});

const uploadFile = multer({ storage: storage, fileFilter: excelFilter });
module.exports = uploadFile;
