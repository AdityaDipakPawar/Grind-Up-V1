const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
exports.uploadToCloudinary = async (file, resourceType = 'raw') => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    // Extract file extension
    const fileExt = file.originalname.split('.').pop().toLowerCase();
    const timestamp = Date.now();
    const publicId = `placement-records/placement-${timestamp}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        public_id: publicId,
        format: fileExt, // Preserve the original format
        attachment: true, // Force download
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to cloudinary
    const stream = Readable.from(file.buffer);
    stream.pipe(uploadStream);
  });
};

// Delete file from Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw', // Most files are stored as 'raw'
    });
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Generate download URL with forced download
exports.getDownloadUrl = (url) => {
  if (!url) return null;
  // Add fl_attachment parameter to force download
  return url.replace('/upload/', '/upload/fl_attachment/');
};
