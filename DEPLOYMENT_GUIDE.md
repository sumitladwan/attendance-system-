# 🚀 Deployment Guide - Student Attendance System

## ✅ What Was Fixed

**Issue**: Punch-in/out not working when deployed
**Root Cause**: 
- API URL hardcoded to `localhost:5000`
- Missing CORS headers for cross-origin requests
- Insufficient error logging for debugging

**Solution**: 
✅ Dynamic API URL detection
✅ Improved CORS configuration  
✅ Enhanced error logging
✅ Better debugging information

---

## 📋 Pre-Deployment Checklist

- [ ] All npm dependencies installed (`npm install` in backend and frontend)
- [ ] MongoDB Atlas connection configured in `.env`
- [ ] JWT_SECRET set in `.env`
- [ ] WHATSAPP_ENABLED=true in `.env`
- [ ] WhatsApp QR code scanned (if using WhatsApp notifications)
- [ ] Git changes committed and pushed

---

## 🌍 Deployment Scenarios

### Scenario 1: Both Frontend & Backend on Same Server (Recommended)

**Setup:**
```
Server (e.g., example.com)
├── /api → Backend (Node.js on port 5000)
└── / → Frontend (Static files on port 80/443)
```

**Backend (.env):**
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
WHATSAPP_ENABLED=true
```

**Frontend (automatic detection):**
The frontend will automatically detect and use:
- If on `example.com:80` → `/api` (relative path)
- If on `example.com:443` → `/api` (relative path)

**Nginx Configuration Example:**
```nginx
server {
    listen 80;
    server_name example.com;

    # Frontend
    location / {
        root /var/www/attendance-system/frontend;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Authorization $http_authorization;
    }
}
```

---

### Scenario 2: Frontend & Backend on Different Domains

**Setup:**
```
Frontend: app.example.com (React/Vue/Static Server)
Backend: api.example.com (Node.js API)
```

**Backend (.env):**
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret
WHATSAPP_ENABLED=true
```

**Frontend (automatic detection):**
If frontend is on `app.example.com:8000` and backend on `api.example.com:5000`:
```javascript
// Auto-detects and uses: http://api.example.com:5000/api
```

To hardcode this, edit `frontend/script.js`:
```javascript
const getAPIURL = () => {
  return 'https://api.example.com/api'; // Your API domain
};
```

---

### Scenario 3: Local Development (What You're Using)

**Setup:**
```
Localhost:
├── Frontend → http://localhost:8000
└── Backend → http://localhost:5000
```

**Works automatically** - Dynamic URL detection handles it!

---

## 🔧 How the Dynamic API URL Works

**Frontend Detection Priority:**

```javascript
1. Is hostname localhost/127.0.0.1? 
   → Use http://localhost:5000/api

2. Is frontend on port 8000/3000? 
   → Use http://{hostname}:5000/api

3. Same domain deployment?
   → Use {protocol}://{host}/api
```

**Example:**
- `localhost:8000` → `http://localhost:5000/api` ✅
- `app.example.com:8000` → `http://app.example.com:5000/api` ✅
- `example.com/app` → `https://example.com/api` ✅

---

## 📊 API Endpoints Reference

All endpoints require `Authorization: Bearer {token}` header (except auth endpoints).

### Authentication
```
POST   /api/auth/register    - Create account
POST   /api/auth/login       - Login
GET    /api/auth/me          - Get current user
```

### Attendance
```
POST   /api/attendance/punch-in  - Mark punch in
POST   /api/attendance/punch-out - Mark punch out
GET    /api/attendance/today    - Get today's attendance
GET    /api/attendance/history  - Get all records
```

### System
```
GET    /api/whatsapp-status  - Check WhatsApp connection
GET    /                      - API health check
```

---

## 🛠️ Deployment Steps

### Step 1: Prepare Backend

```bash
cd backend
npm install
npm run build  # If using build script
```

### Step 2: Prepare Frontend

```bash
cd frontend
# No build needed - already optimized HTML/CSS/JS
```

### Step 3: Set Environment Variables

Create/Update `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-very-secret-key-here
NODE_ENV=production
WHATSAPP_ENABLED=true
```

### Step 4: Start Services

**Option A: PM2 (Recommended for Production)**

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name "attendance-api"

# Start frontend (if using separate server)
cd frontend
pm2 start "python -m http.server 8000" --name "attendance-web"

# Save PM2 config
pm2 save
pm2 startup
```

**Option B: Docker (if available)**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend .
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]
```

**Option C: Manual (Development)**

```bash
# Terminal 1: Backend
cd backend && npm start

# Terminal 2: Frontend
cd frontend && python -m http.server 8000
```

---

## 📋 Testing Deployment

### 1. Check API Connection

**In Browser Console:**
```javascript
fetch('http://your-api-domain/api/')
  .then(r => r.json())
  .then(d => console.log('✅ API OK:', d))
  .catch(e => console.error('❌ API Failed:', e))
```

Expected response:
```json
{
  "message": "Student Attendance Tracking System API"
}
```

### 2. Check Punch-In Endpoint

**With Authentication:**
```javascript
fetch('http://your-api-domain/api/attendance/punch-in', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(d => console.log('Punch-In Response:', d))
```

### 3. Check Browser Console

Look for:
```
🔌 Using API URL: http://your-api-domain/api
✅ API Status: Connected
⏰ Punch-In Request - User ID: xxx
✅ Punch-In successful
```

### 4. Complete Test Flow

1. **Register** with valid credentials
2. **Login** with email and password
3. **Punch In** - Should see ✅ success message
4. **Punch Out** - Should send WhatsApp (if enabled)
5. **Check History** - Should show records

---

## 🐛 Troubleshooting Deployment Issues

### ❌ Problem: "Punch In button doesn't work"

**Solution 1: Check Console Logs**
```
Open DevTools (F12) → Console Tab
Look for error messages about API URL
```

**Solution 2: Verify API URL**
```javascript
// Console
console.log(API_URL);
// Should show your correct API endpoint
```

**Solution 3: Check Network Tab**
```
DevTools → Network Tab
Click Punch In button
Look for `/api/attendance/punch-in` request
Check if it's getting 200 or error response
```

### ❌ Problem: "CORS error in console"

**Solution:**
Backend needs CORS headers (already fixed in latest version):
```javascript
// backend/server.js should have:
app.use(cors({
  origin: '*',
  credentials: true
}));
```

### ❌ Problem: "401 Unauthorized error"

**Solution:**
Token not being sent or expired:
1. Clear localStorage: `localStorage.clear()`
2. Login again
3. Check Authorization header in Network tab

### ❌ Problem: "API URL shows localhost:5000 in production"

**Solution:**
Edit `frontend/script.js` and update getAPIURL():
```javascript
const getAPIURL = () => {
  // Override for your domain
  if (window.location.hostname !== 'localhost') {
    return 'https://api.your-domain.com/api';
  }
  return 'http://localhost:5000/api';
};
```

---

## 📊 Monitoring & Logging

### Enable Debug Logging

**Backend Console Shows:**
```
⏰ Punch-In Request - User ID: xxx
👤 User found: John Doe
📅 Checking for punch-in records...
✅ Punch-In successful - Record ID: yyy
```

**Frontend Console Shows:**
```
🔌 Using API URL: http://your-api.com/api
⏳ Loading today's attendance...
✅ Punch-In successful
```

### Check Production Logs

**With PM2:**
```bash
pm2 logs attendance-api  # View backend logs
pm2 logs attendance-web  # View frontend logs
```

**With Docker:**
```bash
docker logs container-name
```

---

## 🔒 Security Checklist for Production

- [ ] MongoDB password protected
- [ ] JWT_SECRET is strong and unique
- [ ] HTTPS enabled (not HTTP)
- [ ] CORS restricted to your domain
- [ ] No `.env` file committed to git
- [ ] WhatsApp session (.wwebjs_auth) not exposed
- [ ] Regular backups of MongoDB
- [ ] Rate limiting enabled (optional)

**Harden CORS:**
```javascript
// Change from '*' to specific domain
const corsOptions = {
  origin: 'https://your-domain.com',
  credentials: true
};
app.use(cors(corsOptions));
```

---

## 📈 Performance Tips

1. **Use nginx/Apache** for static files (faster than Node)
2. **Enable gzip compression**
3. **Use MongoDB Atlas** with proper indexing
4. **Set NODE_ENV=production**
5. **Use PM2** with clustering for multiple CPUs

---

## 🆘 Emergency Troubleshooting

If nothing works:

1. **Restart Everything:**
   ```bash
   # Kill all Node processes
   pkill -f node
   
   # Clear browser cache
   # (Ctrl+Shift+Delete)
   
   # Restart services
   npm start
   ```

2. **Check Logs:**
   ```bash
   # Backend logs
   tail -f backend.log
   
   # Browser console (F12)
   # Look for 404, 500, network errors
   ```

3. **Verify Connectivity:**
   ```bash
   # Check if backend is running
   curl http://localhost:5000/api/
   
   # Check MongoDB connection
   mongosh "your-connection-string"
   ```

4. **Reset Database:**
   ```bash
   # WARNING: Deletes all data!
   db.dropDatabase()
   ```

---

## 📞 Support

For issues:
1. Check the console (F12)
2. Review backend logs
3. Check GitHub issues
4. Enable debug logging above

---

## ✅ Deployment Verification Checklist

- [ ] Backend API running and responding
- [ ] Frontend loads without errors
- [ ] Login/Register works
- [ ] Punch In button functional
- [ ] Punch Out sends WhatsApp (if enabled)
- [ ] Attendance history shows records
- [ ] CORS headers present
- [ ] Console shows no errors
- [ ] API URL auto-detected correctly
- [ ] MongoDB records are saving

---

**You're ready to deploy!** 🚀

