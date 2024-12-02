const Companies = require('../scripts/models/companies');

async function createCompany(req, res) {
    try {
        const { admin, companyName, description, website, contactEmail, address, companyProfilePicture, industry } = req.body;

        if (!admin || !companyName || !website || !contactEmail || !address || !industry) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        const newCompany = new Companies({
            admin: req.user.username,
            companyName,
            description,
            website,
            contactEmail,
            address,
            companyProfilePicture,
            industry,
            createdAt: new Date(),
            createdBy: req.user.username,  
        });

        const savedCompany = await newCompany.save();
        res.status(201).json({ message: 'Company created successfully', company: savedCompany });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create company', error: err.message });
    }
}
async function getCompanies(req, res) {
    try {
        const filter = {}; // Initialize an empty filter object

        // If the request includes a query parameter for admin (e.g., ?admin=username)
        if (req.query.admin) {
            filter.admin = req.query.admin; // Filter by admin from query parameters
        }

        // Get the companies based on the filter
        const companies = await Companies.find(filter).populate('admin', 'username');

        res.status(200).json(companies);  // Return the filtered or unfiltered list of companies
    } catch (err) {
        res.status(500).json({ message: 'Failed to get companies', error: err.message });
    }
}


async function getCompaniesFiltered(req, res) {
    try {
        let { industry = 'all', page = 1, limit = 12 } = req.query;

        // Convert to integers
        page = parseInt(page);
        limit = parseInt(limit);

        // Set default values in case of NaN or invalid parameters
        if (isNaN(page) || page < 1) page = 1;  // Default page = 1
        if (isNaN(limit) || limit < 1) limit = 10;  // Default limit = 10

        console.log(`Page: ${page}, Limit: ${limit}`);  // Debugging

        // Build the query object
        let query = {};
        if (industry !== 'all') {
            query.industry = industry;
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Fetch companies with pagination and populate the 'admin' field
        const [companies, totalCompanies] = await Promise.all([
            Companies.find(query)
                .populate('admin', 'username')
                .skip(skip)
                .limit(limit), // Use parsed limit
            Companies.countDocuments(query), // Count total matching documents
        ]);

        const totalPages = Math.ceil(totalCompanies / limit);

        // Respond with companies and pagination metadata
        res.status(200).json({
            companies,
            totalPages,
            currentPage: page,
        });
    } catch (err) {
        console.error('Error fetching companies:', err);  // Debugging error
        res.status(500).json({ message: 'Failed to get companies', error: err.message });
    }
}



async function getCompanyById(req, res) {
    try {
        const company = await Companies.findById(req.params.id).populate('admin', 'username');
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.status(200).json(company);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get company', error: err.message });
    }
}

async function updateCompany(req, res) {
    try {
        const { id } = req.params;
        const { companyName, description, website, contactEmail, address, companyProfilePicture, industry } = req.body;

        const updateData = {};
        if (companyName) updateData.companyName = companyName;
        if (description) updateData.description = description;
        if (website) updateData.website = website;
        if (contactEmail) updateData.contactEmail = contactEmail;
        if (address) updateData.address = address;
        if (companyProfilePicture) updateData.companyProfilePicture = companyProfilePicture;
        if (industry) updateData.industry = industry;

        updateData.updatedAt = new Date();
        updateData.updatedBy = req.user.username;

        const updatedCompany = await Companies.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedCompany) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.status(200).json({ message: 'Company updated successfully', company: updatedCompany });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update company', error: err.message });
    }
}

async function deleteCompany(req, res) {
    try {
        const { id } = req.params;

        const deletedCompany = await Companies.findByIdAndDelete(id);
        if (!deletedCompany) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete company', error: err.message });
    }
}

async function searchCompanies(req, res) {
    try {
        const query = req.query.query || '';  // Get the search query from the request
        // Search users by username only, ignore emails
        const companies = await Companies.find({
            companyName: { $regex: query, $options: 'i' } // Case-insensitive search for usernames
        })
        .select('companyName companyProfilePicture');  // Only return username and profilePicture fields

        res.status(200).json(companies);  // Return the filtered list of users
    } catch (err) {
        res.status(500).json({ message: 'Failed to get users', error: err.message });
    }
}
// Filter companies by admin username
async function getCompaniesbyAdmin(req, res) {
    try {
        const adminUsername = req.query.admin; // Get the admin query parameter

        if (!adminUsername) {
            return res.status(400).json({ message: 'Admin username is required' });
        }

        // Find companies filtered by admin username
        const companies = await Companies.find({ admin: adminUsername }).populate('admin', 'username');

        if (!companies || companies.length === 0) {
            return res.status(404).json({ message: 'No companies found for this admin' });
        }

        res.status(200).json(companies); // Return the filtered list of companies
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch companies', error: err.message });
    }
}





module.exports = {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
    getCompaniesFiltered,
    searchCompanies,
    getCompaniesbyAdmin,
};
