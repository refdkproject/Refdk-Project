import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define upload types and their paths
export const UPLOAD_TYPES = {
  PROFILE_PIC: 'profilePic',
  VOLUNTEER_PIC: 'volunteerPic',
  EVENT_PIC: 'eventPic'
};

// Configure storage
const storage = (uploadType) => multer.diskStorage({
  destination: function (req, file, cb) {
    // Create base path for restaurant
    const basePath = path.join('uploads', 'users', req.user._id.toString());

    // Create nested directories based on upload type
    const uploadPath = path.join(basePath, uploadType);

    // Create directories if they don't exist
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// Validate file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, and WEBP files are allowed.'), false);
  }
};

// Create upload middleware for different types
const createUploader = (uploadType) => multer({
  storage: storage(uploadType),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Export different upload middlewares here
export const uploadProfilePic = createUploader(UPLOAD_TYPES.PROFILE_PIC).single(UPLOAD_TYPES.PROFILE_PIC);
export const uploadVolunteerPic = createUploader(UPLOAD_TYPES.VOLUNTEER_PIC).single(UPLOAD_TYPES.VOLUNTEER_PIC);
export const uploadEventPic = createUploader(UPLOAD_TYPES.EVENT_PIC).single(UPLOAD_TYPES.EVENT_PIC);
