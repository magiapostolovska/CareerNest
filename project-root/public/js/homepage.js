async function fetchCompanies() {
    try {
        const response = await fetch('/api/companies', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // If using JWT
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch companies');
        }

        const companies = await response.json();
        displayCompanies(companies.slice(0, 4)); // Display only the first 4 companies
    } catch (error) {
        console.error('Error fetching companies:', error);
    }
}

function displayCompanies(companies) {
    const companyCardsContainer = document.getElementById('companyCards'); // The container for company cards

    companyCardsContainer.innerHTML = ''; // Clear previous content

    companies.forEach(company => {
        const companyCard = document.createElement('div');
        companyCard.className = 'company-card'; // Add a class for styling

        companyCard.innerHTML = `
            <img src="${company.companyProfilePicture || 'path/to/default/logo.jpg'}" alt="${company.companyName} Logo" class="company-logo">
            <h3 class="company-name">${company.companyName}</h3>
            <a href="/companies/${company._id}" class="small-blue-button">View Profile</a>
        `;

        companyCardsContainer.appendChild(companyCard);
    });
}

// Call the fetchCompanies function to load companies on page load
document.addEventListener('DOMContentLoaded', fetchCompanies);
