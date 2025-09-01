# Fix Dashboard Error: "Failed to load dashboard data"

## Problem
The dashboard is showing "Failed to load dashboard data. Please try again." because:
1. MongoDB database is not running
2. Backend server is not running
3. No sample data exists in the database

## Solution Steps

### Step 1: Start MongoDB
1. Open Command Prompt as Administrator
2. Run: `mongod --dbpath C:\data\db --port 27017`
3. Keep this terminal open (MongoDB needs to keep running)

### Step 2: Start Backend Server
1. Open a new Command Prompt
2. Navigate to server directory: `cd "clarity-dash/server"`
3. Install dependencies: `npm install`
4. Start server: `npm start`
5. You should see: "🚀 ClarityDash Server running on port 5000"

### Step 3: Seed Database with Sample Data
1. Open a new Command Prompt
2. Navigate to server directory: `cd "clarity-dash/server"`
3. Run: `node seed-data.js`
4. You should see: "Data seeding completed successfully!"

### Step 4: Start Frontend Client
1. Open a new Command Prompt
2. Navigate to client directory: `cd "clarity-dash/client"`
3. Install dependencies: `npm install`
4. Start client: `npm run dev`
5. Open browser to: http://localhost:5173

### Step 5: Login with Sample Account
- Email: `john.doe@example.com`
- Password: `password123`

## Alternative: Use the Startup Script
1. Double-click `start-project.bat` in the project root
2. This will automatically start all services
3. Wait for all terminals to open and services to start

## Verify Everything is Working
1. **MongoDB**: Should be running on port 27017
2. **Backend**: Should show "ClarityDash Server running on port 5000"
3. **Frontend**: Should open in browser at http://localhost:5173
4. **Dashboard**: Should load with sample financial data

## Troubleshooting

### If MongoDB won't start:
- Create directory: `mkdir C:\data\db`
- Check if MongoDB is installed: `mongod --version`
- Try running as Administrator

### If Backend won't start:
- Check if port 5000 is free: `netstat -an | findstr :5000`
- Kill process using port 5000 if needed
- Check if all dependencies are installed: `npm install`

### If Frontend won't start:
- Check if port 5173 is free
- Ensure all dependencies are installed: `npm install`
- Check for TypeScript compilation errors

### If Dashboard still shows error:
- Check browser console for specific error messages
- Verify backend is responding: http://localhost:5000/api/health
- Check if user is logged in (check localStorage for token)

## Expected Dashboard Data
After successful setup, you should see:
- Total Income: $3,150.00
- Total Expenses: $1,168.74
- Net Savings: $1,981.26
- Spending by Category chart
- Savings Projection chart
- AI Expense Prediction (if ML service is working)

## File Structure
```
clarity-dash/
├── start-project.bat          # Windows startup script
├── server/
│   ├── seed-data.js           # Database seeding script
│   ├── server.js              # Main server file
│   └── routes/
│       ├── analytics.js       # Dashboard data endpoints
│       └── ml.js             # ML prediction endpoints
└── client/
    └── src/
        ├── pages/
        │   └── Dashboard.tsx  # Dashboard component
        └── services/
            └── api.ts         # API service
```

## Support
If you continue to have issues:
1. Check all terminal outputs for error messages
2. Ensure MongoDB is running and accessible
3. Verify backend server is responding to health check
4. Check browser console for frontend errors
