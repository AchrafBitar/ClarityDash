# Quick Setup Guide - Fix Dashboard Error

## 🚨 The Problem
Your dashboard shows "Failed to load dashboard data" because:
- **Database is empty** - No transactions exist yet
- **Backend is not running** - API endpoints are unavailable
- **MongoDB is not running** - Database connection fails

## ⚡ Quick Fix (3 Steps)

### 1. Start MongoDB
```bash
# Create data directory (if it doesn't exist)
mkdir C:\data\db

# Start MongoDB
mongod --dbpath C:\data\db --port 27017
```

### 2. Start Backend & Seed Data
```bash
cd server
npm install
npm start

# In a new terminal, seed the database:
node seed-data.js
```

### 3. Start Frontend
```bash
cd client
npm install
npm run dev
```

## 🔑 Login Credentials
- **Email**: john.doe@example.com
- **Password**: password123

## 🎯 What You'll See After Fix
- ✅ Financial summary with real data
- ✅ Spending by category chart
- ✅ Savings projection chart
- ✅ AI expense predictions
- ✅ Sample transactions loaded

## 🚀 Alternative: Use Startup Scripts
- **Windows**: Double-click `start-project.bat`
- **PowerShell**: Right-click `start-project.ps1` → "Run with PowerShell"

## 📍 URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

## 🆘 Still Having Issues?
1. Check if MongoDB is running: `mongod --version`
2. Verify backend is responding: http://localhost:5000/api/health
3. Check browser console for specific errors
4. Ensure all ports are free (27017, 5000, 5173)

---
**Note**: Keep MongoDB terminal open - it needs to keep running for the database to work!
