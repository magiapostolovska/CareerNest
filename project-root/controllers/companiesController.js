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
        const filter = {};

        if (req.query.admin) {
            filter.admin = req.query.admin; 
        }

        const companies = await Companies.find(filter).populate('admin', 'username');

        res.status(200).json(companies);  
    } catch (err) {
        res.status(500).json({ message: 'Failed to get companies', error: err.message });
    }
}


async function getCompaniesFiltered(req, res) {
    try {
        let { industry = 'all', page = 1, limit = 12 } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        if (isNaN(page) || page < 1) page = 1;  
        if (isNaN(limit) || limit < 1) limit = 10;  

        console.log(`Page: ${page}, Limit: ${limit}`);

        let query = {};
        if (industry !== 'all') {
            query.industry = industry;
        }

        const skip = (page - 1) * limit;

        const [companies, totalCompanies] = await Promise.all([
            Companies.find(query)
                .populate('admin', 'username')
                .skip(skip)
                .limit(limit),
            Companies.countDocuments(query), 
        ]);

        const totalPages = Math.ceil(totalCompanies / limit);

        res.status(200).json({
            companies,
            totalPages,
            currentPage: page,
        });
    } catch (err) {
        console.error('Error fetching companies:', err); 
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
        const query = req.query.query || '';  
        const companies = await Companies.find({
            companyName: { $regex: query, $options: 'i' } 
        })
        .select('companyName companyProfilePicture');  

        res.status(200).json(companies);  
    } catch (err) {
        res.status(500).json({ message: 'Failed to get users', error: err.message });
    }
}
async function getCompaniesbyAdmin(req, res) {
    try {
        const adminUsername = req.query.admin; 

        if (!adminUsername) {
            return res.status(400).json({ message: 'Admin username is required' });
        }

        const companies = await Companies.find({ admin: adminUsername }).populate('admin', 'username');

        if (!companies || companies.length === 0) {
            return res.status(404).json({ message: 'No companies found for this admin' });
        }

        res.status(200).json(companies); 
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
