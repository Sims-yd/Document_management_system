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
        // Cloudinary returns the URL in req.file.path
        const publicUrl = req.file.path;

        // Check for existing document with same title
        const existingDoc = await Document.findOne({ title });

        if (existingDoc) {
            // Versioning logic
            existingDoc.history.push({
                version: existingDoc.version,
                fileUrl: existingDoc.fileUrl,
                updatedAt: existingDoc.updatedAt,
            });
            existingDoc.version += 1;
            existingDoc.fileUrl = publicUrl;
            existingDoc.description = description || existingDoc.description;
            existingDoc.tags = tags ? tags.split(',') : existingDoc.tags;
            existingDoc.category = category || existingDoc.category;
            existingDoc.uploadedBy = req.user._id;

            await existingDoc.save();
            res.status(200).json(existingDoc);
        } else {
            // Create new document
            const newDoc = await Document.create({
                title,
                description,
                tags: tags ? tags.split(',') : [],
                category,
                fileUrl: publicUrl,
                uploadedBy: req.user._id,
            });
            res.status(201).json(newDoc);
        }
    } catch (error) {
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
