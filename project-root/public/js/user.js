// Function to decode JWT and extract the user ID
function getUserIdFromToken() {
    const token = localStorage.getItem('authToken'); // Get the token from localStorage
    if (!token) {
        console.error('No auth token found');
        return null;
    }

    try {
        // Decode the JWT to extract the payload (assuming it's a JWT with a standard structure)
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT to get the payload
        return payload.userId; // Assuming the user ID is stored in 'userId' field
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

function getUsernameFromToken() {
    const token = localStorage.getItem('authToken'); // Get the token from localStorage
    if (!token) {
        console.error('No auth token found');
        return null;
    }

    try {
        // Decode the JWT to extract the payload
        const payload = JSON.parse(atob(token.split('.')[1])); // Decode the payload from Base64
        return payload.username; // Assuming the username is stored in the 'username' field
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

// Fetch User Profile
async function fetchUserProfile() {
    const userId = getUserIdFromToken(); // Get the user ID from the token
    if (!userId) {
        console.error('User ID not found in the token');
        return;
    }

    try {
        // Fetch user data (which also includes student data)
        const response = await fetch(`/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Ensure token is present in localStorage
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch user profile. Status: ${response.status}`);
        }

        const userData = await response.json();

        // If user and student data exist, display it
        if (userData) {
            displayUserProfile(userData); // If user data exists, display it
        } else {
            console.error('No user data found');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

function displayUserProfile(user) {
    // Check if user data exists before displaying it
    if (user) {
        // Display username and handle
        document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
        document.getElementById('user-handle').textContent = `@${user.username}`;
        
        // Bio display logic
        let combinedBio = user.bio || ''; // Default to empty string if no bio
        const bioElement = document.getElementById('user-bio');
        if (bioElement) {
            bioElement.innerHTML = combinedBio; // Add the bio content here
        }

        // Display Profile Picture
        const profilePic = user.profilePicture || '/path/to/default/profile-pic.jpg';
        const profileImage = document.getElementById('userProfilePicture');
        if (profileImage) {
            profileImage.src = profilePic;
        }

        // Display University and Faculty in the student-info section
        const universityElement = document.getElementById('user-university');
        const facultyElement = document.getElementById('user-faculty');
        const studentInfoSection = document.querySelector('.student-info');

        if (user.student) {
            // Check if university and faculty exist
            if (user.student.university) {
                universityElement.textContent = user.student.university;
            } else {
                // Hide the university section if not available
                universityElement.parentElement.style.display = 'none';
            }

            if (user.student.faculty) {
                facultyElement.textContent = user.student.faculty;
            } else {
                // Hide the faculty section if not available
                facultyElement.parentElement.style.display = 'none';
            }

            // Show the student-info section if we have valid university/faculty data
            studentInfoSection.style.display = 'block';
        } else {
            // If no student data exists, hide the student-info section
            studentInfoSection.style.display = 'none';
        }
    } else {
        console.error('Invalid user data');
    }
}

// Automatically fetch user profile when the page loads
fetchUserProfile();

async function fetchAndDisplayUserCompanies() {
    const username = getUsernameFromToken(); // Get the username from the token
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
        displayOwnedCompanies(companies); // Render the owned companies
    } catch (error) {
        console.error('Error fetching owned companies:', error);
    }
}

function displayOwnedCompanies(companies) {
    const ownedCompanyCardsContainer = document.getElementById('ownedCompanyCards');
    ownedCompanyCardsContainer.innerHTML = ''; // Clear existing content

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
            <a href="/companies/${company._id}" class="small-blue-button">View Profile</a>
        `;

        ownedCompanyCardsContainer.appendChild(companyCard);
    });
}

// Automatically fetch owned companies when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayUserCompanies);

// Open the edit profile modal
function openEditProfile() {
    document.getElementById("editProfileModal").style.display = "block";
}

// Close the edit profile modal
function closeEditProfile() {
    document.getElementById("editProfileModal").style.display = "none";
}

// Open the create company modal
function openCreateCompany() {
    document.getElementById("createCompanyModal").style.display = "block";
}

// Close the create company modal
function closeCreateCompany() {
    document.getElementById("createCompanyModal").style.display = "none";
}

// General modal click handler to close modals when clicking outside of them
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
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(document.getElementById("createCompanyForm"));

    const companyData = {
        admin: formData.get("admin"),
        companyName: formData.get("companyName"),
        description: formData.get("description"), // Adding description
        website: formData.get("website"),
        contactEmail: formData.get("contactEmail"), // Adding contact email
        address: formData.get("address"),
        companyProfilePicture: formData.get("companyProfilePicture"), // Profile picture
        industry: formData.get("industry"),
    };

    try {
        // Send a POST request to create the company
        const response = await fetch('/api/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
            body: JSON.stringify(companyData),
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get error message from response body
            console.error('Failed to create company:', errorText);
            throw new Error('Failed to create company');
        }

        const createdCompany = await response.json();
        console.log('Company created successfully:', createdCompany);
        alert('Company created successfully!');
        closeCreateCompany(); // Close the modal after the company is created
    } catch (error) {
        console.error('Error creating company:', error);
        alert('Failed to create company. Please try again.');
    }
}
