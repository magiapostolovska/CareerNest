const Applications = require('../scripts/models/applications');


async function createApplication(req, res) {
    try {
        const { studentId, internshipId, cv, coverLetter } = req.body;

        if (!studentId || !internshipId) {
            return res.status(400).json({ message: 'Student ID and Internship ID are required' });
        }

        const newApplication = new Applications({
            studentId,
            internshipId,
            cv,
            coverLetter,
            appliedAt: new Date()
        });

        const savedApplication = await newApplication.save();
        res.status(201).json({ message: 'Application created successfully', application: savedApplication });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create application', error: err.message });
    }
}

async function getApplications(req, res) {
    try {
        const applications = await Applications.find().populate('studentId', 'username').populate('internshipId', 'title');
        res.status(200).json(applications);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get applications', error: err.message });
    }
}

async function getApplicationById(req, res) {
    try {
        const application = await Applications.findById(req.params.id)
            .populate('studentId', 'username')
            .populate('internshipId', 'title');
        
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        res.status(200).json(application);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get application', error: err.message });
    }
}

async function updateApplication(req, res) {
    try {
        const { id } = req.params;
        const { cv, coverLetter, status } = req.body;

        const updateData = {};
        if (cv) updateData.cv = cv;
        if (coverLetter) updateData.coverLetter = coverLetter;
        if (status) updateData.status = status;

        updateData.updatedAt = new Date();

        const updatedApplication = await Applications.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedApplication) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.status(200).json({ message: 'Application updated successfully', application: updatedApplication });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update application', error: err.message });
    }
}

async function deleteApplication(req, res) {
    try {
        const { id } = req.params;

        const deletedApplication = await Applications.findByIdAndDelete(id);
        if (!deletedApplication) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.status(200).json({ message: 'Application deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete application', error: err.message });
    }
}

module.exports = {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    deleteApplication,
};
