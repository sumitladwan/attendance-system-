// Dynamically set API URL based on environment
const getAPIURL = () => {
  // If running locally (localhost or 127.0.0.1)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // For deployed version, use relative path or construct from current host
  // If backend is on same server as frontend (recommended for deployment)
  if (window.location.port === '8000' || window.location.port === '3000') {
    // Frontend is on 8000/3000, backend on 5000
    return `http://${window.location.hostname}:5000/api`;
  }
  
  // If API is on same domain/port (e.g., both under same server)
  return `${window.location.protocol}//${window.location.host}/api`;
};

const API_URL = getAPIURL();

// Log API URL for debugging
console.log('🔌 Using API URL:', API_URL);

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
    const parentPhone = document.getElementById('parentPhone').value.trim();
    const password = document.getElementById('registerPassword').value;

    if (!name || !email || !enrollmentNumber || !parentPhone || !password) {
        showAlert('Please fill all fields', 'error');
        return;
    }

    if (!/^[0-9]{10}$/.test(parentPhone)) {
        showAlert('Parent phone number must be 10 digits', 'error');
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
                parentPhone,
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
    console.log('📊 Loading dashboard for user:', currentUser.name);
    
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    
    // Set user info
    document.getElementById('studentName').textContent = currentUser.name;
    document.getElementById('enrollmentDisplay').textContent = currentUser.enrollmentNumber;
    document.getElementById('parentPhoneDisplay').textContent = currentUser.parentPhone;
    
    // Check API status
    checkAPIStatus();
    
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
    document.getElementById('parentPhone').value = '';
    document.getElementById('registerPassword').value = '';
}

// Check API Connection Status
async function checkAPIStatus() {
    try {
        const response = await fetch(`${API_URL.replace('/api', '')}/`, {
            method: 'GET'
        });
        const data = await response.json();
        console.log('✅ API Status: Connected', data);
        return true;
    } catch (error) {
        console.error('❌ API Status: Disconnected', error);
        return false;
    }
}

// Update button states explicitly
function updateButtonStates(status) {
    console.log(`🔘 Updating button states - Current status: ${status}`);
    
    const punchInBtn = document.getElementById('punchInBtn');
    const punchOutBtn = document.getElementById('punchOutBtn');
    
    if (status === 'punched-in') {
        // Punched in: disable punch-in, enable punch-out
        punchInBtn.disabled = true;
        punchOutBtn.disabled = false;
        console.log('✅ Punch In disabled, Punch Out ENABLED');
    } else if (status === 'punched-out') {
        // Punched out: enable punch-in, disable punch-out
        punchInBtn.disabled = false;
        punchOutBtn.disabled = true;
        console.log('✅ Punch In ENABLED, Punch Out disabled');
    } else {
        // Not checked in: enable punch-in, disable punch-out
        punchInBtn.disabled = false;
        punchOutBtn.disabled = true;
        console.log('✅ Punch In ENABLED, Punch Out disabled (no record)');
    }
}

// Load today's attendance
async function loadTodayAttendance() {
    try {
        console.log('⏳ Loading today\'s attendance...');
        
        const response = await fetch(`${API_URL}/attendance/today`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();
        console.log('📊 Attendance data:', data);
        
        const attendance = data.attendance;

        if (attendance) {
            const punchInTime = new Date(attendance.punchInTime);
            document.getElementById('statusDisplay').textContent = 
                attendance.status === 'punched-in' ? 'Punched In ✅' : 'Punched Out ⏹️';
            document.getElementById('punchInDisplay').textContent = 
                punchInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            
            if (attendance.punchOutTime) {
                const punchOutTime = new Date(attendance.punchOutTime);
                document.getElementById('punchOutDisplay').textContent = 
                    punchOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                document.getElementById('workingHoursDisplay').textContent = 
                    attendance.workingHours + ' hours';
            }

            // Update button states using new function
            updateButtonStates(attendance.status);
            
            console.log('✅ Attendance UI updated - Status: ' + attendance.status);
        } else {
            document.getElementById('statusDisplay').textContent = 'Not Checked In';
            document.getElementById('punchInDisplay').textContent = '-';
            document.getElementById('punchOutDisplay').textContent = '-';
            document.getElementById('workingHoursDisplay').textContent = '-';
            
            // Update button states
            updateButtonStates('not-checked-in');
            
            console.log('ℹ️ No attendance record for today');
        }
    } catch (error) {
        console.error('❌ Error loading attendance:', error);
        showAlert('Failed to load attendance: ' + error.message, 'error');
    }
}

// Punch In
async function punchIn() {
    console.log('🔄 Sending punch-in request to API...');
    console.log('📍 API URL:', API_URL);
    
    try {
        if (!authToken) {
            showAlert('Error: Not authenticated. Please login again.', 'error');
            return;
        }

        const punchInBtn = document.getElementById('punchInBtn');
        const punchOutBtn = document.getElementById('punchOutBtn');
        
        // Disable button to prevent double-click
        punchInBtn.disabled = true;
        console.log('🔒 Punch In button disabled to prevent double-click');

        const response = await fetch(`${API_URL}/attendance/punch-in`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('📡 Response:', response.status, data);

        if (response.ok) {
            console.log('✅ Punch-In successful - Record created');
            showAlert('✅ Punched in successfully!', 'success');
            
            // Wait a moment for database to be ready, then refresh
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log('🔄 Refreshing attendance data...');
            await loadTodayAttendance();
            
            // Double-check button states
            console.log(`🔘 Button states after refresh - Punch In disabled: ${punchInBtn.disabled}, Punch Out disabled: ${punchOutBtn.disabled}`);
        } else {
            console.error('❌ Punch-In failed:', data.message);
            showAlert(data.message || 'Punch in failed', 'error');
            punchInBtn.disabled = false; // Re-enable button on error
        }
    } catch (error) {
        console.error('❌ Punch-In Error:', error);
        showAlert('❌ Network error: ' + error.message + '\n\nCheck if API is running at: ' + API_URL, 'error');
        document.getElementById('punchInBtn').disabled = false; // Re-enable button on error
    }
}

// Punch Out
async function punchOut() {
    console.log('🔄 Sending punch-out request to API...');
    
    try {
        const punchInBtn = document.getElementById('punchInBtn');
        const punchOutBtn = document.getElementById('punchOutBtn');
        
        // Disable button to prevent double-click
        punchOutBtn.disabled = true;
        console.log('🔒 Punch Out button disabled to prevent double-click');

        const response = await fetch(`${API_URL}/attendance/punch-out`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('📡 Response:', response.status, data);

        if (response.ok) {
            console.log('✅ Punch-Out successful');
            showAlert('✅ Punched out successfully!', 'success');
            
            // Display WhatsApp notification status
            if (data.parentNotification) {
                const notificationDiv = document.getElementById('whatsappNotification');
                const notificationMsg = document.getElementById('whatsappMessage');
                
                if (data.parentNotification.sent) {
                    notificationDiv.className = 'whatsapp-notification';
                    notificationMsg.textContent = `✅ ${data.parentNotification.message}`;
                    console.log('📱 WhatsApp message sent successfully');
                } else {
                    notificationDiv.className = 'whatsapp-notification error';
                    notificationMsg.textContent = `⚠️ ${data.parentNotification.message}`;
                    console.log('📱 WhatsApp message failed:', data.parentNotification.message);
                }
                notificationDiv.style.display = 'block';
            }
            
            // Wait a moment for database to be ready, then refresh
            await new Promise(resolve => setTimeout(resolve, 500));
            
            console.log('🔄 Refreshing attendance data...');
            await loadTodayAttendance();
            await loadAttendanceHistory();
            
            // Double-check button states
            console.log(`🔘 Button states after refresh - Punch In disabled: ${punchInBtn.disabled}, Punch Out disabled: ${punchOutBtn.disabled}`);
        } else {
            console.error('❌ Punch-Out failed:', data.message);
            showAlert(data.message || 'Punch out failed', 'error');
            punchOutBtn.disabled = false; // Re-enable button on error
        }
    } catch (error) {
        console.error('❌ Punch-Out Error:', error);
        showAlert('Server error: ' + error.message, 'error');
        document.getElementById('punchOutBtn').disabled = false; // Re-enable button on error
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
