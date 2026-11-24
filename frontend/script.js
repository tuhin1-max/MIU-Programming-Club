function toggleDesignation() {
    const role = document.getElementById('role').value;
    const designationInput = document.getElementById('designation');
    const passkeyInput = document.getElementById('admin_passkey'); 
    
    if (role === 'Admin') {
        designationInput.style.display = 'block'; 
        designationInput.required = true; 
        passkeyInput.style.display = 'block'; 
        passkeyInput.required = true; 
    } else {
        designationInput.style.display = 'none'; 
        designationInput.required = false;
        designationInput.value = ''; 
        passkeyInput.style.display = 'none'; 
        passkeyInput.required = false;
        passkeyInput.value = ''; 
    }
}

function registerNewMember(event) {
    event.preventDefault();

    let roleValue = document.getElementById('role').value;
    let designationValue = document.getElementById('designation').value;
    let passkeyValue = document.getElementById('admin_passkey') ? document.getElementById('admin_passkey').value : ''; 

    const SECRET_PASSKEY = "MIU-ADMIN-2026"; 

    if (roleValue === 'Member') {
        designationValue = 'General Member';
    } else if (roleValue === 'Admin') {
        if (designationValue.trim() === '') {
            alert("Please provide a designation for Admin role.");
            return; 
        }
        if (passkeyValue !== SECRET_PASSKEY) {
            alert("❌ Incorrect Admin Passkey! You are not authorized to register as an Admin.");
            return; 
        }
    }

    const studentId = document.getElementById('student_id').value;

    const newMember = {
        student_id: studentId,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        email: document.getElementById('email').value,
        cf_handle: document.getElementById('cf_handle').value,
        role: roleValue,
        designation: designationValue
    };

    fetch('https://miu-club-backend.onrender.com/add-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
    })
    .then(response => response.text())
    .then(data => {
        alert("Registration Successful! Welcome to the Dashboard. 🎉");

        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('user_role', roleValue); 
        localStorage.setItem('admin_id', studentId);
        
        window.location.href = 'dashboard.html';
    })
    .catch(error => {
        console.log("Error:", error);
        alert("Failed to register. Server might be down.");
    });
}

function handleLogin(event) {
    event.preventDefault();
    const loginData = {
        student_id: document.getElementById('login_id').value,
        email: document.getElementById('login_email').value
    };

    fetch('https://miu-club-backend.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
    })
    .then(response => response.text())
    .then(data => {
        if (data === "Success") {
            localStorage.setItem('admin_logged_in', 'true');
            localStorage.setItem('user_role', 'Admin'); 
            localStorage.setItem('admin_id', loginData.student_id);
            window.location.href = 'dashboard.html'; 
        } else if (data === "NotAdmin") {
            localStorage.setItem('admin_logged_in', 'true'); 
            localStorage.setItem('user_role', 'Member');
            localStorage.setItem('admin_id', loginData.student_id);
            alert("Logged in as Member! You have limited view-only access for some sections.");
            window.location.href = 'dashboard.html';
        } else {
            alert("Invalid Student ID or Email! Please try again.");
        }
    })
    .catch(error => {
        console.log("Error:", error);
        alert("Failed to connect to server.");
    });
}