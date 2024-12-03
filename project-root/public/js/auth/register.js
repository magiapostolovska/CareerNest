document.addEventListener('DOMContentLoaded', () => {


registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isStudent = document.getElementById("studentCheck").checked; 

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

    console.log('User Payload:', userPayload); 

    try {
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
        const userId = userData.userId; 

        if (isStudent) {
            const studentPayload = {
                userId,
                university: document.getElementById("university").value,
                faculty: document.getElementById("faculty").value,
                yearOfStudy: parseInt(document.getElementById("yearOfStudy").value, 10),
                index: document.getElementById("indexNumber").value
            };

            console.log('Student Payload:', studentPayload);

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
        window.location.href = 'login';

    } catch (error) {
        console.error(error); 
        displayError(loginErrorMessage, error.message); 
    }
});

window.toggleStudentFields = function () {
    const studentFields = document.getElementById("studentFields");
    studentFields.classList.toggle("hidden");
};

});