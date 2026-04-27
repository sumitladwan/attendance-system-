# Quick Start Guide

Follow these steps to run the Student Attendance System:

## Step 1: Prepare MongoDB
- Download and install MongoDB from https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (cloud) at https://www.mongodb.com/cloud/atlas
- Make sure MongoDB is running (local installation should start automatically)

## Step 2: Start Backend Server

1. Open terminal/PowerShell and navigate to the backend folder:
   ```powershell
   cd "d:\internship project\attendence massseg\backend"
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start the server:
   ```powershell
   npm start
   ```

   You should see: `Server is running on port 5000`

## Step 3: Start Frontend Server

1. Open another terminal/PowerShell and navigate to the frontend folder:
   ```powershell
   cd "d:\internship project\attendence massseg\frontend"
   ```

2. Start a simple HTTP server. Choose one based on what you have installed:

   **Option A: Using Python 3**
   ```powershell
   python -m http.server 8000
   ```

   **Option B: Using Python 2**
   ```powershell
   python -m SimpleHTTPServer 8000
   ```

   **Option C: Using Node.js (if installed)**
   ```powershell
   npx http-server
   ```

## Step 4: Access the Application

Open your browser and go to:
- **Frontend**: http://localhost:8000
- **Backend API**: http://localhost:5000

## Step 5: Create an Account & Test

1. Click "Register here" on the login page
2. Fill in the registration form:
   - Name: Your full name
   - Email: Your email address
   - Enrollment Number: Your student ID (e.g., STU001)
   - Password: Any password with 6+ characters
3. Click "Register"
4. You'll automatically be logged in
5. Click "Punch In" to clock in
6. Click "Punch Out" to clock out
7. View your attendance history in the table below

## Troubleshooting

### Backend won't start
- Make sure port 5000 is not in use
- Check MongoDB is running
- Check .env file has correct MONGODB_URI

### Frontend shows "Cannot reach server"
- Make sure backend is running on http://localhost:5000
- Check browser console for errors (F12)
- Verify CORS is enabled in backend

### MongoDB connection fails
- For local: Install and run MongoDB Community Edition
- For Atlas: Update MONGODB_URI in .env with your connection string
  Example: `mongodb+srv://username:password@cluster.mongodb.net/attendance_system`

## Default Setup

- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:8000
- **Database**: mongodb://localhost:27017/attendance_system
- **JWT Secret**: your_super_secret_jwt_key_change_this_in_production (change in production!)

## Next Steps

1. Keep both terminal windows open while using the app
2. Check the attendance records in MongoDB
3. Test punch in/out functionality
4. Customize the styling in frontend/styles.css as needed

Enjoy! 🎉
