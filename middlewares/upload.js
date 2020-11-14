const multer = require('multer');
const path = require('path');

const excelFilter = (req, file, cb) => {
  console.log(' >>>>>>>>>>> Aqui uno');
  if (
    file.mimetype.includes('excel') ||
    file.mimetype.includes('spreadsheetml')
  ) {
    console.log(' >>>>>>>>>>> Aqui dos');
    cb(null, true);
  } else {
    // TODO
    console.log(' >>>>>>>>>>> Aqui tres');
    cb('Please upload only excel file.', false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(' >>>>>>>>>>> Aqui cuatro');
    cb(null, path.resolve(__dirname, '../resources/uploads/'));
    console.log(' >>>>>>>>>>> Aqui cinco');
  },
  filename: (req, file, cb) => {
    console.log(' >>>>>>>>>>> Aqui seis');
    cb(null, `${Date.now()}-runcode-${file.originalname}`);
    console.log(' >>>>>>>>>>> Aqui siete');
  }
});

const uploadFile = multer({ storage: storage, fileFilter: excelFilter });
module.exports = uploadFile;
