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
        const { companyId } = req.query;
        const filter = companyId ? { companyId } : {};

        // Fetch all internships, sorted by creation date
        const internships = await Internships.find(filter)
            .sort({ createdAt: -1 })
            .populate('companyId', 'companyName');

        res.status(200).json(internships);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get internships', error: err.message });
    }
}

async function getInternshipsFiltered(req, res) {
    try {
        let { industry = 'all', location = 'all', page = 1, limit = 10 } = req.query;

        // Convert to integers
        page = parseInt(page);
        limit = parseInt(limit);

        // Set default values in case of NaN or invalid parameters
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;

        // Debugging: Log current page and limit
        console.log(`Page: ${page}, Limit: ${limit}`);

        // Build the query object
        let query = {};
        if (industry !== 'all') query.industry = industry;
        if (location !== 'all') query.location = location;

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Fetch internships and count the total matching documents
        const [internships, totalInternships] = await Promise.all([
            Internships.find(query)
                .populate('companyId', 'companyName')  // Use 'companyId' for population
                .skip(skip)
                .limit(limit),
            Internships.countDocuments(query), // Count total matching documents
        ]);

        const totalPages = Math.ceil(totalInternships / limit);

        // Send the response with internships and pagination metadata
        res.status(200).json({
            internships,
            totalPages,
            currentPage: page,
        });
    } catch (err) {
        console.error('Error fetching internships:', err);  // Debugging error
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
async function searchInternships(req, res) {
    try {
        const query = req.query.query || '';  // Get the search query from the request
        // Search users by username only, ignore emails
        const internships = await Internships.find({
            title: { $regex: query, $options: 'i' } // Case-insensitive search for usernames
        })
        .select('title');  // Only return username and profilePicture fields

        res.status(200).json(internships);  // Return the filtered list of users
    } catch (err) {
        res.status(500).json({ message: 'Failed to get users', error: err.message });
    }
}
module.exports = {
    createInternship,
    getInternships,
    getInternshipById,
    updateInternship,
    deleteInternship,
    getInternshipsFiltered,
    searchInternships,
};
