const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = new Map([['.jpeg', 'image/jpeg'], ['.jpg', 'image/jpeg'], ['.png', 'image/png'], ['.webp', 'image/webp']]);
  const ext = path.extname(file.originalname).toLowerCase();
  const extName = allowedTypes.has(ext);
  const mimeType = allowedTypes.get(ext) === file.mimetype;

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, webp, svg) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

module.exports = upload;
