const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applicationsController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');
const upload = require('../middleware/fileUpload');
const Application = require('../scripts/models/applications');



router.get('/applications/:id', authenticateToken, authorizeRole(['admin', 'user','student']), applicationsController.getApplicationById);
router.put('/applications/:id', authenticateToken, authorizeRole(['admin', 'user','student']), applicationsController.updateApplication);
router.delete('/applications/:id', authenticateToken, authorizeRole(['admin', 'user','student']), applicationsController.deleteApplication);
router.post('/applications', upload.single('cv'), async (req, res) => {
    try {
        const { internshipId, userId, coverLetter } = req.body;
        const cvFile = req.file;

        if (!internshipId || !userId || !coverLetter || !cvFile) {
            return res.status(400).json({ message: 'All fields are required (CV, Internship ID, User ID, and Cover Letter)' });
        }

        console.log('Internship ID:', internshipId);
        console.log('User ID:', userId);
        console.log('Cover Letter:', coverLetter);
        console.log('CV File:', cvFile);

        const application = await Application.create({
            internshipId,
            userId,
            coverLetter,
            cvFile: {
                filename: cvFile.filename, 
                path: cvFile.path,        
                mimetype: cvFile.mimetype 
            },
        });

        res.status(201).json({ message: 'Application submitted successfully', application });
    } catch (error) {
        console.error('Error saving application:', error);
        res.status(500).json({ message: 'Failed to submit application', error: error.message });
    }
});

module.exports = router;
