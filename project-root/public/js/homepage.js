async function fetchCompanies() {
    try {
        const response = await fetch('/api/companies', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Corrected string interpolation
            },
        });

        if (!response.ok) throw new Error('Failed to fetch companies');

        const companies = await response.json();
        displayCompanies(companies.slice(0, 4)); // Display only the first 4 companies
    } catch (error) {
        console.error('Error fetching companies:', error);
    }
}

function displayCompanies(companies) {
    const companyCardsContainer = document.getElementById('companyCards');
    companyCardsContainer.innerHTML = ''; 

    companies.forEach(company => {
        const companyCard = document.createElement('div');
        companyCard.className = 'company-card';

        companyCard.innerHTML = `
            <img src="${company.companyProfilePicture || '/images/default-logo.jpg'}" alt="${company.companyName} Logo" class="company-logo">
            <h3 class="company-name">${company.companyName}</h3>
            <a href="/companyProfile/${company._id}" class="small-blue-button">View Profile</a>
        `; 
        companyCardsContainer.appendChild(companyCard);
    });
}

async function fetchInternships() {
    try {
        const response = await fetch('/api/internships', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`, 
            },
        });

        if (!response.ok) throw new Error('Failed to fetch internships');

        const internships = await response.json();
        displayInternships(internships.slice(0, 4)); 
    } catch (error) {
        console.error('Error fetching internships:', error);
    }
}

function displayInternships(internships) {
    const internshipCardsContainer = document.getElementById('internshipCards');
    internshipCardsContainer.innerHTML = ''; 
    internships.forEach(internship => {
        const internshipCard = document.createElement('div');
        internshipCard.className = 'internship-card';

        internshipCard.innerHTML = `
            <img src="https://i.ibb.co/6bzmc6y/briefcase.png" alt="Briefcase Icon" class="card-icon">
            <h3>${internship.title}</h3>
            <p>${internship.companyId?.companyName || 'Company Not Available'}</p>
            <a href="javascript:void(0);" class="button apply-now-button" data-internship-id="${internship._id}">Apply Now</a>        `; // Corrected string interpolation and wrapped in backticks

        internshipCardsContainer.appendChild(internshipCard);
        const applyNowButton = internshipCard.querySelector('.apply-now-button');
        applyNowButton.addEventListener('click', function() {
            openApplyModal(internship._id, internship.title); 
        });
    });
}

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
                <a href="${profileLink}">My Profile</a> <!-- Dynamic profile link -->
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
        <a href="/register">Register</a>
    `;
}

fetchCompanies();
fetchInternships();
updateDropdownMenu();
document.getElementById('userSearchInput').addEventListener('input', async function (event) {
    const query = event.target.value.trim();  
    const userResultsContainer = document.getElementById('userResults');
    const inputElement = document.getElementById('userSearchInput');
    
    if (query.length > 0) {
        try {
            const response = await fetch(`/api/search-users?query=${query}`);
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const users = await response.json(); 
            displayUserResults(users); 
            userResultsContainer.classList.add('show-dropdown'); 
            
            const inputRect = inputElement.getBoundingClientRect(); 
            userResultsContainer.style.top = `${inputRect.bottom + window.scrollY}px`;  

        } catch (error) {
            console.error('Error searching users:', error);
        }
    } else {
        userResultsContainer.innerHTML = '';
        userResultsContainer.classList.remove('show-dropdown');
    }
});


function displayUserResults(users) {
    const userResultsContainer = document.getElementById('userResults');
    const body = document.body;

    userResultsContainer.innerHTML = '';

    if (users.length === 0) {
        userResultsContainer.innerHTML = '<p>No users found.</p>';
        userResultsContainer.classList.remove('show-dropdown'); 
        body.classList.remove('dim-background'); 
        return;
    }

    userResultsContainer.classList.add('show-dropdown');
    body.classList.add('dim-background');

    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card'); 
        userCard.innerHTML = `
            <img class="profile-pic" src="${user.profilePicture || '/images/default-avatar.png'}" alt="Profile Picture">
            <span class="username">${user.username}</span>
            <a href="/users/${user._id}">View Profile</a>
        `;
        userResultsContainer.appendChild(userCard);
    });

    document.addEventListener('click', (e) => {
        if (!userResultsContainer.contains(e.target) && e.target.id !== 'userSearchInput') {
            userResultsContainer.classList.remove('show-dropdown'); 
            body.classList.remove('dim-background'); 
        }
    });
}

function getUserIdFromURL() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1];
}

async function fetchAndDisplayUserProfile() {
    const userId = getUserIdFromURL();
    if (!userId) {
        console.error('No user ID found in the URL');
        return;
    }

    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!response.ok) throw new Error('Failed to fetch user profile');

        const user = await response.json();
        updateUserProfileUI(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

function updateUserProfileUI(user) {
    document.getElementById('profile-pic').src = user.profilePicture || '/images/default-avatar.png';
    document.getElementById('user-name').innerText = `${user.firstName} ${user.lastName}`;
    document.getElementById('user-bio').innerText = user.bio || 'No bio provided.';
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayUserProfile);

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