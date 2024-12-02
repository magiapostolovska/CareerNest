// Function to get the user ID from the URL
function getUserIdFromUrl() {
    const url = window.location.href;
    const pathParts = url.split('/');
    return pathParts[pathParts.length - 1]; // Assuming the URL is /profile/<userId>
}

// Fetch User Profile
async function fetchUserProfile() {
    const userId = getUserIdFromUrl();
    if (!userId) {
        console.error('User ID not found in the URL');
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

        if (!response.ok) {
            throw new Error(`Failed to fetch user profile. Status: ${response.status}`);
        }

        const userData = await response.json();
        if (userData) {
            displayUserProfile(userData);
            fetchUserCompanies(userData.username); // Fetch user-owned companies after profile
        } else {
            console.error('No user data found');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

function displayUserProfile(user) {
    // Display user data
    document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('user-handle').textContent = `@${user.username}`;
    
    let bioElement = document.getElementById('user-bio');
    bioElement.innerHTML = user.bio || 'No bio available';
    
    let profilePic = document.getElementById('userProfilePicture');
    profilePic.src = user.profilePicture || '/path/to/default/profile-pic.jpg';
    
    // Display student information if available
    if (user.student) {
        document.getElementById('user-university').textContent = user.student.university || 'N/A';
        document.getElementById('user-faculty').textContent = user.student.faculty || 'N/A';
    }
}

// Fetch User-Owned Companies using the username
async function fetchUserCompanies(username) {
    try {
        const response = await fetch(`/api/companies?admin=${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user companies');
        }

        const companies = await response.json();
        displayUserCompanies(companies); // Display all companies
    } catch (error) {
        console.error('Error fetching user companies:', error);
    }
}

// Function to display all user-owned companies
function displayUserCompanies(companies) {
    const companyListElement = document.getElementById('ownedCompanyCards');
    companyListElement.innerHTML = ''; // Clear previous list

    // Check if the user has any companies
    if (companies.length === 0) {
        companyListElement.innerHTML = '<p>No companies found for this user.</p>';
        return;
    }

    // Loop through all companies and display them
    companies.forEach(company => {
        const companyCard = document.createElement('div');
        companyCard.className = 'company-card';

        companyCard.innerHTML = `
            <img src="${company.companyProfilePicture || '/images/default-logo.jpg'}" 
                 alt="${company.companyName} Logo" 
                 class="company-logo">
            <h3 class="company-name">${company.companyName}</h3>
            <a href="/companies/${company._id}" class="small-blue-button">View Profile</a>
        `;
        companyListElement.appendChild(companyCard);
    });
}

// Initialize the fetching of user profile and companies
fetchUserProfile();