const API_URL = 'http://localhost:5000/api';
let authToken = null;
let currentUser = null;

// Toggle between login and register forms
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    loginForm.classList.toggle('active');
    registerForm.classList.toggle('active');
}

// Register new user
async function register() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const enrollmentNumber = document.getElementById('enrollmentNumber').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!name || !email || !enrollmentNumber || !password) {
        showAlert('Please fill all fields', 'error');
        return;
    }

    if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                email,
                enrollmentNumber,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showAlert('Registration successful! Logging in...', 'success');
            setTimeout(() => showDashboard(), 1000);
        } else {
            showAlert(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        showAlert('Server error: ' + error.message, 'error');
    }
}

// Login user
async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showAlert('Please enter email and password', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showAlert('Login successful!', 'success');
            setTimeout(() => showDashboard(), 500);
        } else {
            showAlert(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showAlert('Server error: ' + error.message, 'error');
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        showLoginForm();
    }
}

// Show dashboard
function showDashboard() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    
    // Set user info
    document.getElementById('studentName').textContent = currentUser.name;
    document.getElementById('enrollmentDisplay').textContent = currentUser.enrollmentNumber;
    
    // Load attendance data
    loadTodayAttendance();
    loadAttendanceHistory();
}

// Show login form
function showLoginForm() {
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
    
    // Clear inputs
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('enrollmentNumber').value = '';
    document.getElementById('registerPassword').value = '';
}

// Load today's attendance
async function loadTodayAttendance() {
    try {
        const response = await fetch(`${API_URL}/attendance/today`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        const attendance = data.attendance;

        if (attendance) {
            const punchInTime = new Date(attendance.punchInTime);
            document.getElementById('statusDisplay').textContent = 
                attendance.status === 'punched-in' ? 'Punched In' : 'Punched Out';
            document.getElementById('punchInDisplay').textContent = 
                punchInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            
            if (attendance.punchOutTime) {
                const punchOutTime = new Date(attendance.punchOutTime);
                document.getElementById('punchOutDisplay').textContent = 
                    punchOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                document.getElementById('workingHoursDisplay').textContent = 
                    attendance.workingHours + ' hours';
            }

            // Update button states
            document.getElementById('punchInBtn').disabled = attendance.status === 'punched-in';
            document.getElementById('punchOutBtn').disabled = attendance.status === 'punched-out';
        } else {
            document.getElementById('statusDisplay').textContent = 'Not Checked In';
            document.getElementById('punchInBtn').disabled = false;
            document.getElementById('punchOutBtn').disabled = true;
        }
    } catch (error) {
        console.error('Error loading attendance:', error);
    }
}

// Punch In
async function punchIn() {
    try {
        const response = await fetch(`${API_URL}/attendance/punch-in`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Punched in successfully!', 'success');
            loadTodayAttendance();
        } else {
            showAlert(data.message || 'Punch in failed', 'error');
        }
    } catch (error) {
        showAlert('Server error: ' + error.message, 'error');
    }
}

// Punch Out
async function punchOut() {
    try {
        const response = await fetch(`${API_URL}/attendance/punch-out`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('Punched out successfully!', 'success');
            loadTodayAttendance();
            loadAttendanceHistory();
        } else {
            showAlert(data.message || 'Punch out failed', 'error');
        }
    } catch (error) {
        showAlert('Server error: ' + error.message, 'error');
    }
}

// Load attendance history
async function loadAttendanceHistory() {
    try {
        const response = await fetch(`${API_URL}/attendance/history`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        const attendance = data.attendance || [];

        const tbody = document.getElementById('attendanceBody');
        tbody.innerHTML = '';

        if (attendance.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">No attendance records</td></tr>';
            return;
        }

        attendance.forEach(record => {
            const date = new Date(record.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            const punchInTime = new Date(record.punchInTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            const punchOutTime = record.punchOutTime
                ? new Date(record.punchOutTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                })
                : '-';

            const workingHours = record.workingHours > 0 ? record.workingHours + ' hrs' : '-';

            const statusBadge = `<span class="status-badge ${record.status === 'punched-in' ? 'status-punched-in' : 'status-punched-out'}">
                ${record.status === 'punched-in' ? 'Punched In' : 'Punched Out'}
            </span>`;

            const row = `
                <tr>
                    <td>${date}</td>
                    <td>${punchInTime}</td>
                    <td>${punchOutTime}</td>
                    <td>${workingHours}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;

            tbody.innerHTML += row;
        });
    } catch (error) {
        console.error('Error loading attendance history:', error);
    }
}

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.form-container') || document.querySelector('.dashboard');
    if (container.firstChild) {
        container.insertBefore(alertDiv, container.firstChild);
    } else {
        container.appendChild(alertDiv);
    }

    setTimeout(() => alertDiv.remove(), 3000);
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('currentUser');

    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showDashboard();
    }
});
