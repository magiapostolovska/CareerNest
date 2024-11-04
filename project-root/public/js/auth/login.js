document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const findAccountForm = document.getElementById('findAccountForm');
    const securityCodeForm = document.getElementById('securityCodeForm');
    const newPasswordForm = document.getElementById('newPasswordForm');
    const loginErrorMessage = document.getElementById('loginErrorMessage');
    const securityErrorMessage = document.getElementById('securityErrorMessage');
    const accountErrorMessage = document.getElementById('accountErrorMessage');
    const loginLink = document.getElementById('loginLink');
    const registerLink = document.getElementById('registerLink');
    const myProfileLink = document.getElementById('myProfile');
    const logoutLink = document.getElementById('logout');

    // Debugging log to check if the forms are loaded
    console.log('Login Form:', loginForm);
    console.log('Find Account Form:', findAccountForm);
    console.log('Security Code Form:', securityCodeForm);
    console.log('New Password Form:', newPasswordForm);

    // Function to display error messages
    function displayError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
    }

    // Handle Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();
                if (response.ok) {
                    window.location.href = '/homepage'; // Redirect to homepage on successful login
                } else {
                    displayError(loginErrorMessage, data.message || 'Invalid email or password!');
                }
            } catch (error) {
                displayError(loginErrorMessage, 'An error occurred. Please try again.');
            }
        });
    } else {
        console.error('Login form not found!');
    }

    // Forgot Password - Show Find Account Form
    const forgotPasswordLink = document.getElementById('forgotPassword');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.classList.add('hidden');
            findAccountForm.classList.remove('hidden');
        });
    }

    // Cancel Find Account
    const cancelFindAccountButton = document.getElementById('cancelFindAccount');
    if (cancelFindAccountButton) {
        cancelFindAccountButton.addEventListener('click', () => {
            findAccountForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }
    const cancelSecurityCode = document.getElementById('cancelSecurityCode');
    if (cancelSecurityCode) {
        cancelSecurityCode.addEventListener('click', () => {
            securityCodeForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
        });
    }

    // Send Recovery Code
    const searchAccountButton = document.getElementById('searchAccount');
    if (searchAccountButton) {
        searchAccountButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('accountEmail').value;

            try {
                const response = await fetch('/api/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Recovery code sent to your email.');
                    findAccountForm.classList.add('hidden');
                    securityCodeForm.classList.remove('hidden');
                    securityCodeForm.dataset.email = email; // Store email for recovery code verification
                } else {
                    displayError(accountErrorMessage, data.message || 'Failed to send recovery code.');
                }
            } catch (error) {
                displayError(accountErrorMessage, 'An error occurred. Please try again.');
            }
        });
    }

    // Verify Code
    const verifyCodeButton = document.getElementById('verifyCode');
    if (verifyCodeButton) {
        verifyCodeButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = securityCodeForm.dataset.email; // Retrieve stored email
            const recoveryCode = document.getElementById('code').value.trim();

            try {
                const response = await fetch('/api/verify-recovery-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, recoveryCode }),
                });

                const data = await response.json();
                if (response.ok) {
                    securityCodeForm.classList.add('hidden');
                    newPasswordForm.classList.remove('hidden');
                    newPasswordForm.dataset.email = email; // Store email for password reset
                    newPasswordForm.dataset.recoveryCode = recoveryCode; // Store recovery code for password reset
                } else {
                    displayError(securityErrorMessage, data.message || 'Invalid recovery code.');
                }
            } catch (error) {
                displayError(securityErrorMessage, 'An error occurred. Please try again.');
            }
        });
    }

    // Reset Password
    const resetPasswordButton = document.getElementById('resetPassword');
    if (resetPasswordButton) {
        resetPasswordButton.addEventListener('click', async (e) => {
            e.preventDefault();

            const email = newPasswordForm.dataset.email; // Retrieve stored email
            const recoveryCode = newPasswordForm.dataset.recoveryCode; // Store recovery code from the previous steps
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Clear previous error message
            const newPasswordErrorMessage = document.getElementById('newPasswordErrorMessage');
            newPasswordErrorMessage.style.display = 'none';

            if (newPassword !== confirmPassword) {
                displayError(newPasswordErrorMessage, 'Passwords do not match!');
                return;
            }

            try {
                const response = await fetch('/api/change-password', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, recoveryCode, newPassword }), // Include email and recovery code
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Password reset successfully.'); // You might want to keep this or change it to a message
                    newPasswordForm.classList.add('hidden');
                    loginForm.classList.remove('hidden');
                } else {
                    displayError(newPasswordErrorMessage, data.message || 'Failed to reset password.');
                }
            } catch (error) {
                displayError(newPasswordErrorMessage, 'An error occurred. Please try again.');
            }
        });
    }

    // Handle user registration
    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
    
        const isStudent = document.getElementById("studentCheck").checked; // Check if user is a student
    
        const userPayload = {
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            username: document.getElementById("username").value,
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            city: document.getElementById("city").value,
            isStudent
        };
        userPayload.role = isStudent ? 'student' : 'user';
    
        console.log('User Payload:', userPayload); // Log user data for debugging
    
        try {
            // Step 1: Register the user
            const userResponse = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userPayload)
            });
    
            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                throw new Error(errorData.message || 'Failed to create user');
            }
    
            const userData = await userResponse.json();
            const userId = userData.userId; // Get user ID from the response
    
            // Step 2: Handle student-specific fields if the user is a student
            if (isStudent) {
                const studentPayload = {
                    userId,
                    university: document.getElementById("university").value,
                    faculty: document.getElementById("faculty").value,
                    yearOfStudy: parseInt(document.getElementById("yearOfStudy").value, 10),
                    index: document.getElementById("indexNumber").value
                };
    
                console.log('Student Payload:', studentPayload); // Log student data for debugging
    
                const studentResponse = await fetch('/api/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(studentPayload),
                });
    
                if (!studentResponse.ok) {
                    const errorData = await studentResponse.json();
                    throw new Error(errorData.message || 'Failed to create student');
                }
            }
    
            alert("Registration successful!");
            window.location.href = 'login.html';
    
        } catch (error) {
            console.error(error); // Log the error for debugging
            displayError(loginErrorMessage, error.message); // Ensure this element exists in your HTML
        }
    });
    
    // Toggle student fields visibility
    window.toggleStudentFields = function () {
        const studentFields = document.getElementById("studentFields");
        studentFields.classList.toggle("hidden");
    };
    
});