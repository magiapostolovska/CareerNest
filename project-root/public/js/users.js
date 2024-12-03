function getUserIdFromUrl() {
    const url = window.location.href;
    const pathParts = url.split('/');
    return pathParts[pathParts.length - 1]; 
}

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
            fetchUserCompanies(userData.username); 
        } else {
            console.error('No user data found');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

function displayUserProfile(user) {
    document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('user-handle').textContent = `@${user.username}`;
    
    let bioElement = document.getElementById('user-bio');
    bioElement.innerHTML = user.bio || 'No bio available';
    
    let profilePic = document.getElementById('userProfilePicture');
    profilePic.src = user.profilePicture || '/path/to/default/profile-pic.jpg';
    
    if (user.student) {
        document.getElementById('user-university').textContent = user.student.university || 'N/A';
        document.getElementById('user-faculty').textContent = user.student.faculty || 'N/A';
    }
}

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
        displayUserCompanies(companies); 
    } catch (error) {
        console.error('Error fetching user companies:', error);
    }
}

function displayUserCompanies(companies) {
    const companyListElement = document.getElementById('ownedCompanyCards');
    companyListElement.innerHTML = ''; 

    if (companies.length === 0) {
        companyListElement.innerHTML = '<p>No companies found for this user.</p>';
        return;
    }

    companies.forEach(company => {
        const companyCard = document.createElement('div');
        companyCard.className = 'company-card';

        companyCard.innerHTML = `
            <img src="${company.companyProfilePicture || '/images/default-logo.jpg'}" 
                 alt="${company.companyName} Logo" 
                 class="company-logo">
            <h3 class="company-name">${company.companyName}</h3>
            <a href="/companyProfile/${company._id}" class="small-blue-button">View Profile</a>
        `;
        companyListElement.appendChild(companyCard);
    });
}

fetchUserProfile();