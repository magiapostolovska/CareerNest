const Internships = require('../scripts/models/internships');


async function createInternship(req, res) {
    try {
        const { title, description, requirements, startTime, duration, location, companyId, industry } = req.body;

        if (!title || !companyId) {
            return res.status(400).json({ message: 'Title and Company ID are required to create an internship' });
        }

        const newInternship = new Internships({
            title,
            description,
            requirements,
            startTime,
            duration,
            location,
            companyId,
            industry,
            createdAt: new Date(),
            createdBy: req.user.username,
        });

        const savedInternship = await newInternship.save();
        res.status(201).json({ message: 'Internship created successfully', internship: savedInternship });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create internship', error: err.message });
    }
}

async function getInternships(req, res) {
    try {
        const { companyId } = req.query; // Get companyId from query

        // If companyId is provided, filter internships by companyId
        const filter = companyId ? { companyId } : {};

        const internships = await Internships.find(filter).populate('companyId', 'companyName');
        res.status(200).json(internships);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get internships', error: err.message });
    }
}



async function getInternshipById(req, res) {
    try {
        const internship = await Internships.findById(req.params.id).populate('companyId', 'companyName');
        if (!internship) {
            return res.status(404).json({ message: 'Internship not found' });
        }
        res.status(200).json(internship);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get internship', error: err.message });
    }
}

async function updateInternship(req, res) {
    try {
        const { id } = req.params;
        const { title, description, requirements, startTime, duration, location, industry } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (requirements) updateData.requirements = requirements;
        if (startTime) updateData.startTime = startTime;
        if (duration) updateData.duration = duration;
        if (location) updateData.location = location;
        if (industry) updateData.industry = industry;

        updateData.updatedAt = new Date();
        updateData.updatedBy = req.user.username;

        const updatedInternship = await Internships.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedInternship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        res.status(200).json({ message: 'Internship updated successfully', internship: updatedInternship });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update internship', error: err.message });
    }
}

async function deleteInternship(req, res) {
    try {
        const { id } = req.params;

        const deletedInternship = await Internships.findByIdAndDelete(id);
        if (!deletedInternship) {
            return res.status(404).json({ message: 'Internship not found' });
        }

        res.status(200).json({ message: 'Internship deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete internship', error: err.message });
    }
}

module.exports = {
    createInternship,
    getInternships,
    getInternshipById,
    updateInternship,
    deleteInternship,
};
