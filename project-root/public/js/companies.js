let currentPage = 1; 
let totalPages = 5; 
let currentIndustry = 'all'; 
const itemsPerPage = 12; 

const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const currentPageBtn = document.getElementById('currentPageBtn');

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

function displayCompanies(companies) {
    const companyCardsContainer = document.getElementById('companyCards');
    companyCardsContainer.innerHTML = companies.length
        ? companies.map(company => `
            <div class="company-card">
                <img src="${company.companyProfilePicture || '/images/default-logo.jpg'}" alt="${company.companyName} Logo" class="company-logo">
                <h3>${company.companyName}</h3>
                <a href="/companyProfile/${company._id}" class="small-blue-button">View Profile</a>
            </div>
        `).join('')
        : `<p>No companies found.</p>`;
}

function updatePagination(totalPages, currentPage, industry) {
    currentPageBtn.textContent = currentPage;

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;

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

function displayInternships(internships) {
    const internshipCardsContainer = document.getElementById('internshipCards');
    internshipCardsContainer.innerHTML = internships.length
        ? internships.map(internship => `
            <div class="internship-card">
                <img src="https://i.ibb.co/6bzmc6y/briefcase.png" alt="Briefcase Icon" class="card-icon">
                <h3>${internship.title}</h3>
                <p>${internship.postedBy?.companyName || 'Company Not Available'}</p>
                <a href="javascript:void(0);" class="button apply-now-button" data-internship-id="${internship._id}">Apply Now</a>
            </div>
        `).join('')
        : `<p>No internships found.</p>`;

    const applyNowButtons = internshipCardsContainer.querySelectorAll('.apply-now-button');
    applyNowButtons.forEach(button => {
        button.addEventListener('click', function() {
            const internshipId = button.getAttribute('data-internship-id'); 
            const internshipTitle = button.closest('.internship-card').querySelector('h3').textContent; 
            openApplyModal(internshipId, internshipTitle); 
        });
    });
}

function openApplyModal(internshipId, internshipTitle) {
    document.getElementById("apply-internship-id").value = internshipId; 
    document.getElementById("applyNowModal").style.display = "block"; 

    document.getElementById('applyNowModal').querySelector('h2').innerText = `Apply for ${internshipTitle}`;
}


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

document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const industry = e.target.dataset.industry;
        currentIndustry = industry; 
        currentPage = 1; 
        fetchCompanies(industry, currentPage); 
        fetchInternships(industry, currentPage); 
    });
});

document.addEventListener('DOMContentLoaded', () => {
    fetchInternships(currentIndustry, currentPage); 
    fetchCompanies(currentIndustry, currentPage); 
});

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function updateDropdownMenu() {
    const dropdownMenu = document.getElementById('userDropdownMenu');
    const token = getAuthToken();

    if (token) {
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
            const profileLink = `/userProfile/${userData._id}`;

            dropdownMenu.innerHTML = `
                <a href="${profileLink}">My Profile</a>
                <a href="#" id="logoutButton">Logout</a>
            `;

            document.getElementById('logoutButton').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('authToken'); 
                alert('Logged out successfully.');
                window.location.reload(); 
            });
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            setLoggedOutMenu(dropdownMenu);
        });
    } else {
        setLoggedOutMenu(dropdownMenu);
    }
}

function setLoggedOutMenu(dropdownMenu) {
    dropdownMenu.innerHTML = `
        <a href="/login">Login</a>
        <a href="/signup">Sign Up</a>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    updateDropdownMenu(); 
    fetchCompanies(currentIndustry, currentPage); 
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchCompanies(currentIndustry, currentPage); 
        window.scrollTo(0, 0);
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchCompanies(currentIndustry, currentPage); 
        window.scrollTo(0, 0);
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));

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

    companyResultsContainer.innerHTML = '';

    if (companies.length === 0) {
        companyResultsContainer.innerHTML = '<p>No companies found.</p>';
        companyResultsContainer.classList.remove('show-dropdown');
        body.classList.remove('dim-background');
        return;
    }

    companyResultsContainer.classList.add('show-dropdown');
    body.classList.add('dim-background');

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

    document.addEventListener('click', (e) => {
        if (!companyResultsContainer.contains(e.target) && e.target.id !== 'companySearchInput') {
            companyResultsContainer.classList.remove('show-dropdown');
            body.classList.remove('dim-background');
        }
    });
}

document.querySelector('.apply-now-button').addEventListener('click', function(event) {
    const internshipId = event.target.getAttribute('data-internship-id'); 
    openModal(internshipId);  
});

async function openModal(internshipId) {
    const modal = document.getElementById('applyModal');
    const response = await fetch(`/api/internships/${internshipId}`);
    
    if (response.ok) {
        const internship = await response.json();
        
        document.getElementById('internship-title').textContent = internship.title;
        document.getElementById('internship-description').textContent = internship.description;
        document.getElementById('internship-start-time').textContent = internship.startTime;
        document.getElementById('internship-industry').textContent = internship.industry;

        modal.style.display = 'block';
    } else {
        console.error('Failed to fetch internship details');
    }
}

function closeModal() {
    const modal = document.getElementById('applyModal');
    modal.style.display = 'none';
}

document.getElementById('apply-btn').addEventListener('click', function() {
    const cvInput = document.getElementById('cv-upload');
    const cvFile = cvInput.files[0]; 
    if (cvFile) {
        const formData = new FormData();
        formData.append('cv', cvFile);

        fetch(`/api/internships/apply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`  
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert('Successfully applied for the internship!');
            closeModal();
        })
        .catch(error => {
            console.error('Error applying for internship:', error);
            alert('There was an error applying for the internship.');
        });
    } else {
        alert('Please upload your CV!');
    }
});


function openApplyModal(internshipId, internshipTitle) {
    document.getElementById("apply-internship-id").value = internshipId;
    document.getElementById("applyNowModal").style.display = "block"; 

    document.getElementById('applyNowModal').querySelector('h2').innerText = `Apply for ${internshipTitle}`;
}

function closeApplyModal() {
    document.getElementById("applyNowModal").style.display = "none";
}

async function submitApplication(event) {
    event.preventDefault(); 

    const formData = new FormData(document.getElementById("applyNowForm"));
    const applicationData = {
        internshipId: formData.get("internshipId"),
        coverLetter: formData.get("coverLetter"),
        resume: formData.get("resume"),
    };

    try {
        const response = await fetch('/api/applications', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(applicationData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to apply for internship:', errorText);
            throw new Error('Failed to apply');
        }

        const applicationResponse = await response.json();
        console.log('Application submitted successfully:', applicationResponse);
        alert('Your application has been submitted!');

        closeApplyModal(); 
    } catch (error) {
        console.error('Error submitting application:', error);
        alert('Failed to submit application. Please try again.');
    }
}

async function fetchInternshipDetails(internshipId) {
    try {
        const response = await fetch(`/api/internships/${internshipId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch internship details');
            return;
        }

        const internship = await response.json();
        populateForm(internship);
    } catch (error) {
        console.error('Error fetching internship details:', error);
    }
}

function populateForm(internship) {
    document.getElementById('internship-title').textContent = internship.title || 'No title available';
    document.getElementById('internship-description').textContent = internship.description || 'No description available';
    document.getElementById('internship-start-time').textContent = `Start Date: ${internship.startTime || 'N/A'}`;
    document.getElementById('internship-industry').textContent = `Industry: ${internship.industry || 'N/A'}`;

    document.getElementById('apply-internship-id').value = internship._id;
}

function openApplyModal(internshipId) {
    fetchInternshipDetails(internshipId);
    document.getElementById('applyNowModal').style.display = 'block';
}