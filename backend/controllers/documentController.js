const Document = require('../models/Document');

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private (Editor, Admin)
const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { title, description, tags, category } = req.body;
        
        // Extract metadata from Cloudinary upload
        const publicUrl = req.file.secure_url || req.file.path;
        const originalFilename = req.file.originalname || req.file.filename;
        const fileFormat = req.file.format || originalFilename.split('.').pop();
        
        // ✅ FIXED: Determine resourceType based on fileFormat if not provided
        let resourceType = req.file.resource_type;
        if (!resourceType || resourceType === 'auto') {
            const ext = fileFormat.toLowerCase();
            const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
            const videoExts = ['mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm'];
            const documentExts = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'];
            
            if (imageExts.includes(ext)) {
                resourceType = 'image';
            } else if (videoExts.includes(ext)) {
                resourceType = 'video';
            } else if (documentExts.includes(ext)) {
                resourceType = 'raw';
            } else {
                resourceType = 'raw';
            }
        }
        
        // Default MIME types mapping
        const mimeTypeMap = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'mp4': 'video/mp4',
            'webm': 'video/webm',
            'txt': 'text/plain',
        };
        
        const mimeType = mimeTypeMap[fileFormat] || 'application/octet-stream';
        
        console.log('✅ Upload metadata:', { fileFormat, resourceType, mimeType, originalFilename });

        // Check for existing document with same title
        const existingDoc = await Document.findOne({ title });

        if (existingDoc) {
            // Versioning logic - save current version to history
            existingDoc.history.push({
                version: existingDoc.version,
                fileUrl: existingDoc.fileUrl,
                originalFilename: existingDoc.originalFilename,
                fileFormat: existingDoc.fileFormat,
                resourceType: existingDoc.resourceType,
                updatedAt: existingDoc.updatedAt,
            });
            existingDoc.version += 1;
            existingDoc.fileUrl = publicUrl;
            existingDoc.originalFilename = originalFilename;
            existingDoc.fileFormat = fileFormat;
            existingDoc.resourceType = resourceType;
            existingDoc.mimeType = mimeType;
            existingDoc.description = description || existingDoc.description;
            existingDoc.tags = tags ? tags.split(',').map(t => t.trim()) : existingDoc.tags;
            existingDoc.category = category || existingDoc.category;
            existingDoc.uploadedBy = req.user._id;

            await existingDoc.save();
            res.status(200).json(existingDoc);
        } else {
            // Create new document
            const newDoc = await Document.create({
                title,
                description,
                tags: tags ? tags.split(',').map(t => t.trim()) : [],
                category,
                fileUrl: publicUrl,
                originalFilename: originalFilename,
                fileFormat: fileFormat,
                resourceType: resourceType,
                mimeType: mimeType,
                uploadedBy: req.user._id,
            });
            res.status(201).json(newDoc);
        }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all documents
// @route   GET /api/documents
// @access  Private (All)
const getDocuments = async (req, res) => {
    try {
        const { keyword, category } = req.query;
        let query = {};

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { tags: { $in: [new RegExp(keyword, 'i')] } },
            ];
        }

        if (category) {
            query.category = category;
        }

        const documents = await Document.find(query).populate('uploadedBy', 'username');
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private (Admin)
const deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Optional: Delete from Cloudinary using cloudinary.uploader.destroy(public_id)
        // For simplicity, we just delete the record from DB
        await Document.deleteOne({ _id: req.params.id });

        res.json({ message: 'Document removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single document
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
    try {
        console.log('Backend: getDocumentById called with ID:', req.params.id);
        const document = await Document.findById(req.params.id).populate('uploadedBy', 'username');

        if (document) {
            res.json(document);
        } else {
            console.log('Backend: Document not found');
            res.status(404).json({ message: 'Document not found' });
        }
    } catch (error) {
        console.error('Backend: Error in getDocumentById:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get document version history
// @route   GET /api/documents/:id/history
// @access  Private
const getDocumentHistory = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (document) {
            res.json(document.history);
        } else {
            res.status(404).json({ message: 'Document not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadDocument,
    getDocuments,
    deleteDocument,
    getDocumentById,
    getDocumentHistory,
};
