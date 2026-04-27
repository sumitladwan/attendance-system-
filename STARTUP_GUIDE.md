# 🚀 Quick Start Guide - Student Attendance System

## Prerequisites
- Node.js installed
- MongoDB running (local or Atlas)
- Python 3 installed
- All dependencies installed in backend folder

---

## ✨ 3 Ways to Start the Application

### **Method 1: Batch File (Easiest for Windows)**

1. Double-click **`start.bat`** in the project root
2. Two terminal windows will open automatically
3. Backend starts on `http://localhost:5000`
4. Frontend starts on `http://localhost:8000`
5. **Open browser to:** `http://localhost:8000`

✅ **Easiest way** - Just double-click and go!

---

### **Method 2: PowerShell Script**

1. Right-click on **`start.ps1`**
2. Select "Run with PowerShell"
3. If you get an execution policy error, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
4. Run the script again
5. **Open browser to:** `http://localhost:8000`

✅ **Good for Windows users** - Color-coded output

---

### **Method 3: Manual Commands (Full Control)**

#### Terminal 1 - Backend:
```powershell
cd "d:\internship project\attendence massseg\backend"
npm install  # Only needed first time
npm start
```

#### Terminal 2 - Frontend:
```powershell
cd "d:\internship project\attendence massseg\frontend"
python -m http.server 8000
```

#### Then open browser:
```
http://localhost:8000
```

✅ **Most control** - Run each part separately

---

### **Method 4: NPM Scripts (If you prefer)**

From root directory:
```powershell
cd "d:\internship project\attendence massseg"
npm run install-all   # First time setup
npm start             # Start both backend and frontend
```

**Note:** Frontend uses Python server, so output may vary.

---

## 🎯 Quick Reference

| Method | Command | Time | Ease |
|--------|---------|------|------|
| Batch File | Double-click `start.bat` | Fast | ⭐⭐⭐⭐⭐ |
| PowerShell | Run `start.ps1` | Fast | ⭐⭐⭐⭐ |
| Manual | Run 2 terminals | Flexible | ⭐⭐⭐ |
| NPM Scripts | `npm start` | Standard | ⭐⭐ |

---

## ✅ Verify Everything is Running

### Check Backend:
```
Open: http://localhost:5000
Should see: "Student Attendance Tracking System API"
```

### Check Frontend:
```
Open: http://localhost:8000
Should see: Login/Register page
```

---

## 🛑 Stopping the Services

### Batch File Method:
- Close both terminal windows

### PowerShell Method:
- Close both terminal windows

### Manual Method:
- Terminal 1: Press `Ctrl + C`
- Terminal 2: Press `Ctrl + C`

### NPM Method:
- Press `Ctrl + C` in terminal

---

## ⚠️ Troubleshooting

### "Cannot find Python"
- Make sure Python 3 is installed and in PATH
- Try: `python --version`
- If not working, install Python from https://www.python.org

### "Port 5000 already in use"
- Kill process on port 5000:
  ```powershell
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```
- Or change port in `backend/.env`

### "Port 8000 already in use"
- Kill process on port 8000:
  ```powershell
  netstat -ano | findstr :8000
  taskkill /PID <PID> /F
  ```
- Or change port in the Python command

### "MongoDB connection error"
- Ensure MongoDB is running
- Check `backend/.env` has correct `MONGODB_URI`
- For MongoDB Atlas: Use your connection string

### "Modules not installed"
- Run: `npm run install-all` (from root)
- Or manually:
  ```powershell
  cd backend
  npm install
  cd ../frontend
  # No npm install needed for frontend
  ```

---

## 📚 File Structure Reference

```
attendence massseg/
├── start.bat              ← Double-click this (Windows)
├── start.ps1              ← Run with PowerShell
├── package.json           ← Root npm configuration
├── backend/
│   ├── server.js          ← Express server
│   ├── package.json       ← Backend dependencies
│   └── .env               ← MongoDB connection
└── frontend/
    ├── index.html         ← Main page
    ├── styles.css         ← Styling
    └── script.js          ← JavaScript logic
```

---

## 🎓 First Time Setup

1. **Clone or download the project**
   ```powershell
   cd "d:\internship project\attendence massseg"
   ```

2. **Install all dependencies**
   ```powershell
   npm run install-all
   ```

3. **Start the application** (choose one method above)

4. **Create a test account**
   - Register with test data
   - Parent Phone: `9876543210` (10 digits)
   - Password: `test123`

5. **Test features**
   - Click "Punch In"
   - Click "Punch Out"
   - View attendance history

---

## 🔗 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `http://localhost:8000` | Student UI |
| Backend API | `http://localhost:5000` | API server |
| API Docs | See README.md | API endpoints |
| GitHub | https://github.com/sumitladwan/attendance-system- | Source code |

---

## 💡 Recommended Setup

For best experience:
1. **Use Method 1 (Batch File)** - Easiest
2. Keep both windows open side-by-side
3. Use browser DevTools (F12) for debugging
4. Check MongoDB for data verification

---

## 📝 Common Commands

```powershell
# Go to backend
cd backend

# Go to frontend
cd frontend

# Go to root
cd ..

# Check if services running
netstat -ano | findstr :5000
netstat -ano | findstr :8000

# View logs
# Check terminal windows where services are running

# Stop services
# Close terminal windows or Ctrl + C
```

---

**Happy Testing! 🎉**

If you face any issues, check the terminal output for error messages.
