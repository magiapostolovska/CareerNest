function getUserIdFromToken() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        console.error('No auth token found');
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1])); 
        return payload.userId; 
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

function getUsernameFromToken() {
    const token = localStorage.getItem('authToken'); 
    if (!token) {
        console.error('No auth token found');
        return null;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1])); 
        return payload.username; 
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

async function fetchUserProfile() {
    const userId = getUserIdFromToken();
    if (!userId) {
        console.error('User ID not found in the token');
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
        } else {
            console.error('No user data found');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

function displayUserProfile(user) {
    if (user) {
        document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('user-handle').textContent = `@${user.username}`;
        
        let combinedBio = user.bio || ''; 
        const bioElement = document.getElementById('user-bio');
        if (bioElement) {
            bioElement.innerHTML = combinedBio; 
        }

        const profilePic = user.profilePicture || '/path/to/default/profile-pic.jpg';
        const profileImage = document.getElementById('userProfilePicture');
        if (profileImage) {
            profileImage.src = profilePic;
        }

        const universityElement = document.getElementById('user-university');
        const facultyElement = document.getElementById('user-faculty');
        const studentInfoSection = document.querySelector('.student-info');

        if (user.student) {
            if (user.student.university) {
                universityElement.textContent = user.student.university;
            } else {
                universityElement.parentElement.style.display = 'none';
            }

            if (user.student.faculty) {
                facultyElement.textContent = user.student.faculty;
            } else {
                facultyElement.parentElement.style.display = 'none';
            }

            studentInfoSection.style.display = 'block';
        } else {
            studentInfoSection.style.display = 'none';
        }
    } else {
        console.error('Invalid user data');
    }
}

fetchUserProfile();

async function fetchAndDisplayUserCompanies() {
    const username = getUsernameFromToken(); 
    if (!username) {
        console.error('Username could not be fetched');
        return;
    }

    try {
        const response = await fetch(`/api/companies?admin=${username}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch owned companies');

        const companies = await response.json();
        displayOwnedCompanies(companies); 
    } catch (error) {
        console.error('Error fetching owned companies:', error);
    }
}

function displayOwnedCompanies(companies) {
    const ownedCompanyCardsContainer = document.getElementById('ownedCompanyCards');
    ownedCompanyCardsContainer.innerHTML = ''; 

    if (companies.length === 0) {
        ownedCompanyCardsContainer.innerHTML = `<p>You haven't created any companies yet. Start by clicking "Create a page for your company".</p>`;
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
            <a href="/companyForMe/${company._id}" class="small-blue-button">View Profile</a>
        `;

        ownedCompanyCardsContainer.appendChild(companyCard);
    });
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayUserCompanies);

function openEditProfile() {
    document.getElementById("editProfileModal").style.display = "block";
}

function closeEditProfile() {
    document.getElementById("editProfileModal").style.display = "none";
}

function openCreateCompany() {
    document.getElementById("createCompanyModal").style.display = "block";
}

function closeCreateCompany() {
    document.getElementById("createCompanyModal").style.display = "none";
}

window.onclick = function(event) {
    const modals = ['editProfileModal', 'createCompanyModal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
};

async function submitCompanyProfileChanges(event) {
    event.preventDefault(); 

    const formData = new FormData(document.getElementById("createCompanyForm"));

    const companyData = {
        admin: formData.get("admin"),
        companyName: formData.get("companyName"),
        description: formData.get("description"), 
        website: formData.get("website"),
        contactEmail: formData.get("contactEmail"), 
        address: formData.get("address"),
        companyProfilePicture: formData.get("companyProfilePicture"), 
        industry: formData.get("industry"),
    };

    try {
        const response = await fetch('/api/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(companyData),
        });

        if (!response.ok) {
            const errorText = await response.text(); 
            console.error('Failed to create company:', errorText);
            throw new Error('Failed to create company');
        }

        const createdCompany = await response.json();
        console.log('Company created successfully:', createdCompany);
        alert('Company created successfully!');
        closeCreateCompany(); 
    } catch (error) {
        console.error('Error creating company:', error);
        alert('Failed to create company. Please try again.');
    }
}

function openEditProfile() {
    document.getElementById("editProfileModal").style.display = "block";
}

function closeEditProfile() {
    document.getElementById("editProfileModal").style.display = "none";
}

window.onclick = function(event) {
    const modal = document.getElementById("editProfileModal");
    if (event.target == modal) {
        closeEditProfile();
    }
};

function populateUserData(user) {
    document.getElementById('email').value = user.email || '';
    document.getElementById('username').value = user.username || '';
    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('profilePicture').value = user.profilePicture || '';
    document.getElementById('bio').value = user.bio || ''; 

    if (user.student) {
        document.getElementById('university').value = user.student.university || '';
        document.getElementById('faculty').value = user.student.faculty || '';
    }
}

async function submitProfileChanges(event) {
    event.preventDefault(); 

    const userId = getUserIdFromToken(); 
    if (!userId) {
        console.error('User ID not found in the token');
        return;
    }

    const userPayload = {
        username: document.getElementById('username').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        profilePicture: document.getElementById('profilePicture').value,
        bio: document.getElementById('bio').value,
    };

    try {
        const response = await fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`, 
            },
            body: JSON.stringify(userPayload),
        });

        if (!response.ok) {
            throw new Error('Failed to update user profile');
        }

        const updatedUser = await response.json();
        console.log('User profile updated successfully:', updatedUser);
        alert('Profile updated successfully!');
        closeEditProfile(); 
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
    }
}

async function fetchUserProfileAndPopulate() {
    const userId = getUserIdFromToken(); 
    if (!userId) {
        console.error('User ID not found in the token');
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
            populateUserData(userData);  
        } else {
            console.error('No user data found');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

function confirmDeleteAccount() {
    const confirmation = confirm("Are you sure you want to delete your account? This action cannot be undone.");

    if (confirmation) {
        deleteUserAccount();
    }
}

function deleteUserAccount() {
    const userId = getUserIdFromToken(); 

    if (!userId) {
        alert("Unable to retrieve user ID. Please log in again.");
        return;
    }

    const deleteUrl = `/api/users/${userId}`;

    fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert("Your account has been deleted successfully.");
            window.location.href = '/homepage';  
        } else {
            response.json().then(error => {
                console.error("Error:", error);
                alert(`Error: ${error.message}`);
            });
        }
    })
    .catch(error => {
        console.error("Error deleting user:", error);
        alert("An error occurred while deleting your account.");
    });
}