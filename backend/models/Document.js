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
            updatedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
