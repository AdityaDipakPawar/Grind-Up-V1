const multer = require('multer');

// Configure multer for in-memory storage
const storage = multer.memoryStorage();

// File filter to accept only Excel files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/x-xlsx',
    'text/csv', // allow CSV uploads as well
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only Excel files (.xls, .xlsx) are allowed'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
