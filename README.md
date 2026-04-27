# Student Attendance Tracking System

A simple web application for students to create accounts and track their attendance with punch in/punch out functionality.

## Features

✅ User Registration & Login
✅ Secure Password Storage (bcrypt)
✅ JWT Authentication
✅ Punch In/Out Functionality
✅ Attendance History
✅ Working Hours Calculation
✅ Responsive Design
✅ MongoDB Database

## Project Structure

```
attendance_massseg/
├── backend/
│   ├── models/
│   │   ├── User.js (User schema)
│   │   └── Attendance.js (Attendance schema)
│   ├── routes/
│   │   ├── auth.js (Login/Register routes)
│   │   └── attendance.js (Punch in/out routes)
│   ├── middleware/
│   │   └── auth.js (JWT authentication)
│   ├── server.js (Main server file)
│   ├── package.json
│   └── .env (Environment variables)
│
└── frontend/
    ├── index.html
    ├── styles.css
    └── script.js
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### 1. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/attendance_system
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   NODE_ENV=development
   ```

4. Make sure MongoDB is running on your machine

5. Start the backend server:
   ```bash
   npm start
   ```
   or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000`

### 2. Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Open `index.html` in a web browser or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Python 2
   python -m SimpleHTTPServer 8000
   
   # Using Node.js
   npx http-server
   ```

3. Access the application at `http://localhost:8000` (or the port shown)

## How to Use

### For Students

1. **Create Account**
   - Click "Register here" on the login page
   - Fill in your Name, Email, Enrollment Number, and Password
   - Click Register

2. **Login**
   - Enter your email and password
   - Click Login

3. **Track Attendance**
   - Click "Punch In" when you arrive
   - Click "Punch Out" when you leave
   - View your attendance history below

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Attendance Routes
- `POST /api/attendance/punch-in` - Punch in (requires auth)
- `POST /api/attendance/punch-out` - Punch out (requires auth)
- `GET /api/attendance/today` - Get today's attendance (requires auth)
- `GET /api/attendance/history` - Get all attendance records (requires auth)

## MongoDB Collections

### users
```json
{
  "_id": ObjectId,
  "name": "Student Name",
  "email": "student@example.com",
  "password": "hashed_password",
  "enrollmentNumber": "ENR123456",
  "createdAt": ISODate
}
```

### attendances
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "studentName": "Student Name",
  "date": ISODate,
  "punchInTime": ISODate,
  "punchOutTime": ISODate,
  "status": "punched-in" | "punched-out",
  "workingHours": 8.5,
  "createdAt": ISODate
}
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check the `MONGODB_URI` in `.env`
- For MongoDB Atlas, update the connection string with your credentials

### CORS Error
- The backend has CORS enabled for all origins by default
- If needed, update `cors()` in `server.js`

### Port Already in Use
- Change the `PORT` in `.env` (backend)
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

## Future Enhancements

- Admin dashboard to view all students' attendance
- Monthly attendance reports
- Email notifications
- Mobile app version
- Geolocation based punch in/out
- Leave management system
- Export attendance to PDF/Excel

## License

This project is open source and available under the MIT License.

## Support

For any issues or questions, please create an issue in the repository.
