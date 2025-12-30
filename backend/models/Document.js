const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    tags: {
        type: [String],
    },
    category: {
        type: String,
    },
    fileUrl: {
        type: String,
        required: true,
    },
    originalFilename: {
        type: String,
    },
    mimeType: {
        type: String,
    },
    fileFormat: {
        type: String, // e.g., 'pdf', 'jpg', 'png', 'mp4', 'docx'
    },
    resourceType: {
        type: String, // 'image', 'video', 'raw', etc.
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    version: {
        type: Number,
        default: 1,
    },
    history: [
        {
            version: Number,
            fileUrl: String,
            originalFilename: String,
            fileFormat: String,
            resourceType: String,
            updatedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
