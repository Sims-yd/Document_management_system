const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Custom params function to determine resource_type based on file extension
const params = async (req, file) => {
    const extension = file.originalname.split('.').pop().toLowerCase();
    
    // Determine resource type based on file extension
    let resourceType = 'raw';
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const videoExts = ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm'];
    const documentExts = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'];
    
    if (imageExts.includes(extension)) {
        resourceType = 'image';
    } else if (videoExts.includes(extension)) {
        resourceType = 'video';
    } else if (documentExts.includes(extension)) {
        resourceType = 'raw';
    }
    
    return {
        folder: 'dms_documents',
        resource_type: resourceType,
        type: 'upload',
        access_mode: 'public',
        use_filename: true, // Preserve original filename
        unique_filename: true, // Ensure uniqueness if duplicates exist
    };
};

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: params,
});

module.exports = { cloudinary, storage };
