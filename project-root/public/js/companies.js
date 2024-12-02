// Pagination Variables
let currentPage = 1; // Start at page 1
let totalPages = 5; // This will be updated dynamically from the API response
let currentIndustry = 'all'; // Default industry is 'all'
const itemsPerPage = 12; // Set number of items per page

const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageBtn = document.getElementById('currentPageBtn');

// Function to fetch companies (filtered by industry) with pagination
async function fetchCompanies(industry = 'all', page = 1) {
    try {
        const url = `/api/companies/filtered?industry=${industry}&page=${page}&limit=${itemsPerPage}`;
        console.log(`Fetching companies from: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!response.ok) throw new Error('Failed to fetch companies');

        const { companies, totalPages, currentPage } = await response.json();
        displayCompanies(companies);
        updatePagination(totalPages, currentPage, industry);
    } catch (error) {
        console.error('Error fetching companies:', error);
    }
}

// Function to display companies
function displayCompanies(companies) {
    const companyCardsContainer = document.getElementById('companyCards');
    companyCardsContainer.innerHTML = companies.length
        ? companies.map(company => `
            <div class="company-card">
                <img src="${company.companyProfilePicture || '/images/default-logo.jpg'}" alt="${company.companyName} Logo" class="company-logo">
                <h3>${company.companyName}</h3>
                <a href="/companies/${company._id}" class="small-blue-button">View Profile</a>
            </div>
        `).join('')
        : `<p>No companies found.</p>`;
}

// Function to update the pagination controls
function updatePagination(totalPages, currentPage, industry) {
    // Update the page number displayed on the button
    currentPageBtn.textContent = currentPage;

    // Disable the Prev/Next buttons based on the current page
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    // Save the current industry to persist the filter
    prevPageBtn.onclick = () => {
        if (currentPage > 1) {
            fetchCompanies(industry, currentPage - 1);
        }
    };
    nextPageBtn.onclick = () => {
        if (currentPage < totalPages) {
            fetchCompanies(industry, currentPage + 1);
        }
    };
}

// Function to fetch internships (filtered by industry) with pagination
async function fetchInternships(industry = 'all', page = 1) {
    try {
        const url = `/api/internships/filtered?industry=${industry}&page=${page}&limit=${itemsPerPage}`;
        console.log(`Fetching internships from: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!response.ok) throw new Error('Failed to fetch internships');

        const { internships, totalPages, currentPage } = await response.json();
        displayInternships(internships);
        updateInternshipPagination(totalPages, currentPage, industry);
    } catch (error) {
        console.error('Error fetching internships:', error);
    }
}

// Function to display internships
function displayInternships(internships) {
    const internshipCardsContainer = document.getElementById('internshipCards');
    internshipCardsContainer.innerHTML = internships.length
        ? internships.map(internship => `
            <div class="internship-card">
                <img src="https://i.ibb.co/6bzmc6y/briefcase.png" alt="Briefcase Icon" class="card-icon">
                <h3>${internship.title}</h3>
                <p>${internship.postedBy?.companyName || 'Company Not Available'}</p>
                <a href="/internships/${internship._id}" class="small-blue-button">Apply Now</a>
            </div>
        `).join('')
        : `<p>No internships found.</p>`;
}

// Function to update the pagination controls for internships
function updateInternshipPagination(totalPages, currentPage, industry) {
    currentPageBtn.textContent = currentPage;

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

    prevPageBtn.onclick = () => {
        if (currentPage > 1) {
            fetchInternships(industry, currentPage - 1);
        }
    };
    nextPageBtn.onclick = () => {
        if (currentPage < totalPages) {
            fetchInternships(industry, currentPage + 1);
        }
    };
}

// Event listener for the filter buttons
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const industry = e.target.dataset.industry;
        currentIndustry = industry; // Update the current industry
        currentPage = 1; // Reset to page 1 when a new filter is applied
        fetchCompanies(industry, currentPage); // Fetch companies based on the selected industry
        fetchInternships(industry, currentPage); // Fetch internships based on the selected industry
    });
});

// Initialize internships and companies on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchInternships(currentIndustry, currentPage); 
    fetchCompanies(currentIndustry, currentPage); // Initial fetch with all companies or the selected industry
});

// Helper: Get the auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Update dropdown menu based on login status
function updateDropdownMenu() {
    const dropdownMenu = document.getElementById('userDropdownMenu');
    const token = getAuthToken();

    if (token) {
        // Fetch user details
        fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch user data');
            return response.json();
        })
        .then(userData => {
            // Update dropdown for logged-in user
            dropdownMenu.innerHTML = `
                <a href="/profile">My Profile</a>
                <a href="#" id="logoutButton">Logout</a>
            `;

            // Attach logout functionality
            document.getElementById('logoutButton').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('authToken'); // Clear token
                alert('Logged out successfully.');
                window.location.reload(); // Reload to update UI
            });
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            setLoggedOutMenu(dropdownMenu);
        });
    } else {
        // Set menu for logged-out users
        setLoggedOutMenu(dropdownMenu);
    }
}

function setLoggedOutMenu(dropdownMenu) {
    dropdownMenu.innerHTML = `
        <a href="/login">Login</a>
        <a href="/signup">Sign Up</a>
    `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateDropdownMenu(); // Update dropdown menu
    fetchCompanies(currentIndustry, currentPage); // Initial fetch with all companies or the selected industry
});

// Event listeners for Prev/Next buttons for companies
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchCompanies(currentIndustry, currentPage); // Fetch data for the previous page
        window.scrollTo(0, 0);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchCompanies(currentIndustry, currentPage); // Fetch data for the next page
        window.scrollTo(0, 0);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove the 'active' class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add the 'active' class to the clicked button
            button.classList.add('active');
        });
    });
});

document.getElementById('internshipSearchInput').addEventListener('input', async function (event) {
    const query = event.target.value.trim();
    const iResultsContainer = document.getElementById('iResultsContainer');
    const inputElement = document.getElementById('internshipSearchInput');
    
    if (query.length > 0) {
        try {
            const response = await fetch(`/api/search-internships?query=${query}`);
            if (!response.ok) {
                throw new Error('Failed to fetch internships');
            }
            const internships = await response.json();
            displayInternshipResults(internships);
            iResultsContainer.classList.add('show-dropdown');
            
            const inputRect = inputElement.getBoundingClientRect();
            iResultsContainer.style.top = `${inputRect.bottom + window.scrollY}px`;

        } catch (error) {
            console.error('Error searching internships:', error);
        }
    } else {
        iResultsContainer.innerHTML = '';
        iResultsContainer.classList.remove('show-dropdown');
    }
});

function displayInternshipResults(internships) {
    const iResultsContainer = document.getElementById('iResultsContainer');
    const body = document.body;

    iResultsContainer.innerHTML = '';

    if (internships.length === 0) {
        iResultsContainer.innerHTML = '<p>No internships found.</p>';
        iResultsContainer.classList.remove('show-dropdown');
        body.classList.remove('dim-background');
        return;
    }

    iResultsContainer.classList.add('show-dropdown');
    body.classList.add('dim-background');

    internships.forEach(internship => {
        const internshipCard = document.createElement('div');
        internshipCard.classList.add('i-card');

        internshipCard.innerHTML = `
            <img class="profile-pic" src="https://i.ibb.co/6bzmc6y/briefcase.png" alt="Internship Picture">
            <span class="i-name">${internship.title}</span>
            <a href="/internship/${internship._id}">View Details</a>
        `;
        iResultsContainer.appendChild(internshipCard);
    });

    document.addEventListener('click', (e) => {
        if (!iResultsContainer.contains(e.target) && e.target.id !== 'internshipSearchInput') {
            iResultsContainer.classList.remove('show-dropdown');
            body.classList.remove('dim-background');
        }
    });
}

document.getElementById('companySearchInput').addEventListener('input', async function (event) {
    const query = event.target.value.trim();
    const companyResultsContainer = document.getElementById('companyResults');
    const inputElement = document.getElementById('companySearchInput');
    
    if (query.length > 0) {
        try {
            const response = await fetch(`/api/search-companies?query=${query}`);
            if (!response.ok) {
                throw new Error('Failed to fetch companies');
            }
            const companies = await response.json();
            displayCompanyResults(companies);
            companyResultsContainer.classList.add('show-dropdown');
            
            const inputRect = inputElement.getBoundingClientRect();
            companyResultsContainer.style.top = `${inputRect.bottom + window.scrollY}px`;
        } catch (error) {
            console.error('Error searching companies:', error);
        }
    } else {
        companyResultsContainer.innerHTML = '';
        companyResultsContainer.classList.remove('show-dropdown');
    }
});

function displayCompanyResults(companies) {
    const companyResultsContainer = document.getElementById('companyResults');
    const body = document.body;

    // Clear previous results
    companyResultsContainer.innerHTML = '';

    if (companies.length === 0) {
        companyResultsContainer.innerHTML = '<p>No companies found.</p>';
        companyResultsContainer.classList.remove('show-dropdown');
        body.classList.remove('dim-background');
        return;
    }

    // Show dropdown and background dimming
    companyResultsContainer.classList.add('show-dropdown');
    body.classList.add('dim-background');

    // Render each company
    companies.forEach(company => {
        const companyCard = document.createElement('div');
        companyCard.classList.add('company-card');

        companyCard.innerHTML = `
            <img class="profile-pic" src="${company.companyProfilePicture || '/images/default-avatar.png'}" alt="${company.companyName}">
            <span class="company-name">${company.companyName}</span>
            <a href="/company/${company._id}" class="view-profile">View Profile</a>
        `;
        companyResultsContainer.appendChild(companyCard);
    });

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!companyResultsContainer.contains(e.target) && e.target.id !== 'companySearchInput') {
            companyResultsContainer.classList.remove('show-dropdown');
            body.classList.remove('dim-background');
        }
    });
}
