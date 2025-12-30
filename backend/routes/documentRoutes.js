const express = require('express');
const router = express.Router();
const { uploadDocument, getDocuments, deleteDocument, getDocumentById, getDocumentHistory } = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../utils/fileUpload');

router.post('/upload', protect, authorize('Editor', 'Admin'), upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
// place history route before :id to avoid route shadowing
router.get('/:id/history', protect, getDocumentHistory);
router.get('/:id', protect, getDocumentById);
router.delete('/:id', protect, authorize('Admin'), deleteDocument);

module.exports = router;
