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
    companyCardsContainer.innerHTML = ''; // Clear previous content

    companies.forEach(company => {
        const companyCard = document.createElement('div');
        companyCard.className = 'company-card';

        companyCard.innerHTML = `
            <img src="${company.companyProfilePicture || '/images/default-logo.jpg'}" alt="${company.companyName} Logo" class="company-logo">
            <h3 class="company-name">${company.companyName}</h3>
            <a href="/companies/${company._id}" class="small-blue-button">View Profile</a>
        `; // Corrected string interpolation and wrapped in backticks

        companyCardsContainer.appendChild(companyCard);
    });
}

// Fetch Internships (Client-side)
async function fetchInternships() {
    try {
        const response = await fetch('/api/internships', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // Corrected string interpolation
            },
        });

        if (!response.ok) throw new Error('Failed to fetch internships');

        const internships = await response.json();
        displayInternships(internships.slice(0, 4)); // Display only the first 4 internships
    } catch (error) {
        console.error('Error fetching internships:', error);
    }
}

function displayInternships(internships) {
    const internshipCardsContainer = document.getElementById('internshipCards');
    internshipCardsContainer.innerHTML = ''; // Clear previous content

    internships.forEach(internship => {
        const internshipCard = document.createElement('div');
        internshipCard.className = 'internship-card';

        internshipCard.innerHTML = `
            <img src="https://i.ibb.co/6bzmc6y/briefcase.png" alt="Briefcase Icon" class="card-icon">
            <h3>${internship.title}</h3>
            <p>${internship.companyId?.companyName || 'Company Not Available'} - ${internship.location || 'Location Not Available'}</p>
            <a href="/internships/${internship._id}" class="small-blue-button">Apply Now</a>
        `; // Corrected string interpolation and wrapped in backticks

        internshipCardsContainer.appendChild(internshipCard);
    });
}

// Helper: Get the auth token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Update dropdown menu based on login status
function updateDropdownMenu() {
    const dropdownMenu = document.getElementById('userDropdownMenu');
    const token = getAuthToken(); // Get the auth token from localStorage

    if (token) {
        // Fetch user details
        fetch('/api/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Pass the token for authorization
            },
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch user data');
            return response.json();
        })
        .then(userData => {
            // Generate the profile link dynamically using the userId
            const profileLink = `/userProfile/${userData._id}`;

            // Update dropdown for logged-in user
            dropdownMenu.innerHTML = `
                <a href="${profileLink}">My Profile</a> <!-- Dynamic profile link -->
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
            setLoggedOutMenu(dropdownMenu); // Set logged-out menu if there's an error
        });
    } else {
        // Set menu for logged-out users
        setLoggedOutMenu(dropdownMenu);
    }
}


function setLoggedOutMenu(dropdownMenu) {
    dropdownMenu.innerHTML = `
        <a href="/login">Login</a>
        <a href="/register">Register</a>
    `;
}

// Call these functions to populate the homepage with company and internship data
fetchCompanies();
fetchInternships();
updateDropdownMenu();
document.getElementById('userSearchInput').addEventListener('input', async function (event) {
    const query = event.target.value.trim();  // Get the search query from input
    const userResultsContainer = document.getElementById('userResults');
    const inputElement = document.getElementById('userSearchInput');
    
    if (query.length > 0) {
        // Make API call to search users
        try {
            const response = await fetch(`/api/search-users?query=${query}`);
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            const users = await response.json(); // Get the user data from the response
            displayUserResults(users); // Display the users in the results container
            userResultsContainer.classList.add('show-dropdown'); // Show the dropdown with results
            
            // Adjust the position of the dropdown relative to the input field
            const inputRect = inputElement.getBoundingClientRect();  // Get the position of the input field
            userResultsContainer.style.top = `${inputRect.bottom + window.scrollY}px`;  // Position it just below the input

        } catch (error) {
            console.error('Error searching users:', error);
        }
    } else {
        // If the search query is empty, clear the results container and hide it
        userResultsContainer.innerHTML = '';
        userResultsContainer.classList.remove('show-dropdown');
    }
});

// Function to display the search results
// Function to display the search results
function displayUserResults(users) {
    const userResultsContainer = document.getElementById('userResults');
    const body = document.body;

    // Clear previous results
    userResultsContainer.innerHTML = '';

    // Check if there are users to display
    if (users.length === 0) {
        userResultsContainer.innerHTML = '<p>No users found.</p>';
        userResultsContainer.classList.remove('show-dropdown'); // Hide dropdown
        body.classList.remove('dim-background'); // Remove dim effect
        return;
    }

    // Add dim background effect and show dropdown
    userResultsContainer.classList.add('show-dropdown');
    body.classList.add('dim-background');

    // Loop through the users and create a card for each one
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.classList.add('user-card'); // Add CSS class for styling

        userCard.innerHTML = `
            <img class="profile-pic" src="${user.profilePicture || '/images/default-avatar.png'}" alt="Profile Picture">
            <span class="username">${user.username}</span>
            <a href="/users/${user._id}">View Profile</a>
        `;
        userResultsContainer.appendChild(userCard);
    });

    // Add an event listener to the document to remove the dropdown and dim effect when clicking outside
    document.addEventListener('click', (e) => {
        if (!userResultsContainer.contains(e.target) && e.target.id !== 'userSearchInput') {
            userResultsContainer.classList.remove('show-dropdown'); // Hide dropdown
            body.classList.remove('dim-background'); // Remove dim effect
        }
    });
}

// Function to extract the user ID from the URL
function getUserIdFromURL() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1]; // Extract the userId from URL
}

// Function to fetch the user data from the backend
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

// Function to update the user profile on the page
function updateUserProfileUI(user) {
    document.getElementById('profile-pic').src = user.profilePicture || '/images/default-avatar.png';
    document.getElementById('user-name').innerText = `${user.firstName} ${user.lastName}`;
    document.getElementById('user-bio').innerText = user.bio || 'No bio provided.';
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayUserProfile);
