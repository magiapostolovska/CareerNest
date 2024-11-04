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
        const companies = await Companies.find().populate('admin', 'username');  
        res.status(200).json(companies);
    } catch (err) {
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

module.exports = {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany,
};
