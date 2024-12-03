function getCompanyIdFromUrl() {
    const url = window.location.href;
    const pathParts = url.split('/');
    return pathParts[pathParts.length - 1]; 
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
async function fetchCompanyProfile() {
    const companyId = getCompanyIdFromUrl();
    if (!companyId) {
        console.error('Company ID not found in the URL');
        return;
    }

    try {
        const response = await fetch(`/api/companies/${companyId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch company profile. Status: ${response.status}`);
        }

        const companyData = await response.json();
        if (companyData) {
            displayCompanyProfile(companyData);
            fetchActiveInternships(companyData._id); 
        } else {
            console.error('No company data found');
        }
    } catch (error) {
        console.error('Error fetching company profile:', error);
    }
}

async function displayCompanyProfile(company) {
    document.getElementById('company-name').textContent = company.companyName || 'Company Name';
    document.getElementById('company-tagline').textContent = company.industry || '"No tagline available"';
    document.getElementById('company-bio').innerHTML = company.description || 'No bio available';
    document.getElementById('companyLogo').src = company.companyProfilePicture || '/path/to/default/logo.jpg';

    if (company.admin) {
        const user = await fetchUserByUsername(company.admin); 
        if (user) {
            document.getElementById('admin-username').innerHTML = `
                @<a href="/users/${user._id}">${company.admin}</a>
            `;
            document.getElementById('admin-profile-pic').src = user.profilePicture || '/path/to/default/profile-pic.jpg';
        } else {
            document.getElementById('admin-username').textContent = `@${company.admin}`;
            document.getElementById('admin-profile-pic').src = '/path/to/default/profile-pic.jpg';
        }
    }
}

async function fetchUserByUsername(username) {
    try {
        const response = await fetch(`/api/users?username=${username}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            console.error(`Failed to fetch user details for username: ${username}`);
            return null;
        }

        const users = await response.json();
        if (users.length > 0) {
            return users[0];
        } else {
            console.warn(`No user found for username: ${username}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
}


async function fetchActiveInternships() {
    const companyId = getCompanyIdFromUrl();
    if (!companyId) {
        console.error('Company ID not found in the URL');
        return;
    }

    try {
        const response = await fetch(`/api/internships?companyId=${companyId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`, 
            },
        });

        if (!response.ok) throw new Error('Failed to fetch active internships');

        const internships = await response.json();
        displayActiveInternships(internships.slice(0, 4)); 
    } catch (error) {
        console.error('Error fetching active internships:', error);
    }
}

function displayActiveInternships(internships) {
    const internshipCardsContainer = document.getElementById('activeInternshipCards');
    internshipCardsContainer.innerHTML = ''; 

    if (internships.length === 0) {
        internshipCardsContainer.innerHTML = '<p>No active internships available for this company.</p>';
        return;
    }

    internships.forEach(internship => {
        const internshipCard = document.createElement('div');
        internshipCard.className = 'internship-card';

        internshipCard.innerHTML = `
            <img src="https://i.ibb.co/6bzmc6y/briefcase.png" alt="Briefcase Icon" class="card-icon">
            <h3>${internship.title}</h3>
            <p>${internship.companyId?.companyName || 'Company Not Available'}</p>
            <a href="javascript:void(0);" class="button apply-now-button" data-internship-id="${internship._id}">Apply Now</a>
        `;

        internshipCardsContainer.appendChild(internshipCard);

        const applyNowButton = internshipCard.querySelector('.apply-now-button');
        applyNowButton.addEventListener('click', function() {
            openApplyModal(internship._id, internship.title); 
        });
    });
}


fetchActiveInternships();

fetchCompanyProfile();

document.querySelector('.apply-now-button').addEventListener('click', function(event) {
    const internshipId = event.target.getAttribute('data-internship-id');
    const userId = localStorage.getItem('userId'); 
    
    if (internshipId && userId) {
        openApplyModal(internshipId, userId);  
    } else {
        alert('Internship ID or User ID is missing!');
    }
});


function openApplyModal(internshipId, userId) {
    fetchInternshipDetails(internshipId);

    document.getElementById('user-id').value = userId;

    document.getElementById('applyNowModal').style.display = 'block';
}

function closeApplyModal() {
    document.getElementById('applyNowModal').style.display = 'none';
}

document.getElementById('applyNowForm').addEventListener('submit', function(event) {
    event.preventDefault();  

    const cvInput = document.getElementById('cv-upload');
    const coverLetterInput = document.getElementById('coverLetter');
    const internshipIdInput = document.getElementById('internship-id');
    const userIdInput = document.getElementById('user-id');

    const cvFile = cvInput.files[0]; 
    const coverLetter = coverLetterInput.value; 
    const internshipId = internshipIdInput.value; 
    const userId = userIdInput.value; 

    console.log('Form Data:', {
        'cvFile': cvFile,
        'coverLetter': coverLetter,
        'internshipId': internshipId,
        'userId': userId
    });

    if (!cvFile) {
        alert('Please upload your CV.');
        return;
    }

    if (!userId || !internshipId) {
        alert('User or Internship information is missing.');
        return;
    }

    const formData = new FormData();
    formData.append('cv', cvFile); 
    formData.append('coverLetter', coverLetter); 
    formData.append('internshipId', internshipId); 
    formData.append('userId', userId);
    fetch('/api/applications', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`  
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response:', data);
        if (data.success) {
            alert('Your application has been submitted successfully!');
            closeApplyModal(); 
        } else {
            alert('Failed to submit the application.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error submitting your application.');
    });
});


function openEditCompanyProfile() {
    document.getElementById("editCompanyProfileModal").style.display = "block";
}

function closeEditCompanyProfile() {
    document.getElementById("editCompanyProfileModal").style.display = "none";
}

function submitCompanyProfileChanges(event) {
    event.preventDefault();

    const companyName = document.getElementById("companyName").value;
    const industry = document.getElementById("industry").value;
    const website = document.getElementById("website").value;
    const contactEmail = document.getElementById("contactEmail").value;
    const address = document.getElementById("address").value;
    const companyProfilePicture = document.getElementById("companyProfilePicture").value;
    const description = document.getElementById("description").value;

    const companyId = getCompanyIdFromUrl();

    const companyData = {
        companyName,
        industry,
        website,
        contactEmail,
        address,
        companyProfilePicture,
        description
    };

    fetch(`/api/companies/${companyId}`, {
        method: 'PUT', 
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.message || 'Error updating company profile');
            });
        }
        return response.json();
    })
    .then(data => {
        alert('Company profile updated successfully!');
        closeEditCompanyProfile();
    })
    .catch(error => {
        alert('Error updating company profile: ' + error.message);
    });
}

function openAddInternship() {
    document.getElementById("addInternshipModal").style.display = "block";
}

function closeAddInternship() {
    document.getElementById("addInternshipModal").style.display = "none";
}

function getCompanyIdFromUrl() {
    const url = window.location.href;
    const pathParts = url.split('/');
    return pathParts[pathParts.length - 1]; 
}

function submitNewInternship(event) {
    event.preventDefault();

    const title = document.getElementById("title").value;
    const location = document.getElementById("location").value;
    const startTime = document.getElementById("startTime").value;
    const duration = document.getElementById("duration").value;
    const description = document.getElementById("description").value;
    const requirements = document.getElementById("requirements").value;

    const companyId = getCompanyIdFromUrl();

    const internshipData = {
        title,
        location,
        startTime,
        duration,
        description,
        requirements,
        companyId 
    };

    fetch('/api/internships', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(internshipData)
    })
    .then(response => response.json())
    .then(data => {
        alert('Internship added successfully!');
        closeAddInternship();
    })
    .catch(error => {
        alert('Error adding internship: ' + error.message);
    });
}

function confirmDeleteCompany() {
    const confirmation = confirm("Are you sure you want to delete this company? This action cannot be undone.");

    if (confirmation) {
        deleteCompanyAccount();
    }
}

function deleteCompanyAccount() {
    const companyId = getCompanyIdFromUrl(); 

    if (!companyId) {
        alert("Unable to retrieve company ID. Please try again.");
        return;
    }

    const deleteUrl = `/api/companies/${companyId}`; 

    fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (response.ok) {
            alert("The company has been deleted successfully.");
            window.history.back();  
        } else {
            response.json().then(error => {
                console.error("Error:", error);
                alert(`Error: ${error.message}`);
                window.history.back();  
            });
        }
    })
    .catch(error => {
        console.error("Error deleting company:", error);
        alert("An error occurred while deleting the company.");
        window.history.back();  
    });
}

const deleteButton = document.querySelector('.delete-button');
if (deleteButton) {
    deleteButton.addEventListener('click', confirmDeleteCompany);
}

