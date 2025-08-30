# ClarityDash - Personal Finance Dashboard

A full-stack, responsive Personal Finance Dashboard application built with the MERN stack (MongoDB, Express.js, React, Node.js) that empowers young professionals to track their finances, visualize spending habits, and receive predictive insights through a clean and intuitive interface.

## 🚀 Features

### Core Features
- **User Authentication**: Secure JWT-based authentication with password hashing
- **Transaction Management**: Add, view, and delete financial transactions
- **CSV Import**: Bulk import transactions from CSV files with custom mapping
- **Real-time Analytics**: Financial summaries and spending breakdowns
- **Data Visualization**: Interactive charts using Recharts
- **ML Predictions**: AI-powered expense forecasting using linear regression
- **Responsive Design**: Mobile-first, clean UI built with Tailwind CSS

### Analytics & Insights
- **Financial Summary**: Total income, expenses, and net savings
- **Category Analysis**: Spending breakdown by category with pie charts
- **Savings Projection**: Historical savings trends with future predictions
- **AI Insights**: Smart spending recommendations and trend analysis
- **Monthly Trends**: Income and expense tracking over time

### Security Features
- **Password Hashing**: bcrypt.js for secure password storage
- **JWT Authentication**: Stateless token-based authentication
- **Input Validation**: Zod schema validation for all API endpoints
- **CORS Protection**: Configured for secure cross-origin requests
- **Environment Variables**: Secure configuration management

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod schema validation
- **Security**: bcrypt.js for password hashing
- **File Upload**: Multer for CSV processing
- **CSV Parsing**: PapaParse for robust CSV handling

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: Tailwind CSS for utility-first styling
- **Charts**: Recharts for data visualization
- **HTTP Client**: Axios for API communication
- **Routing**: React Router for navigation
- **State Management**: React Context API with Hooks

### Development Tools
- **Package Manager**: npm
- **Code Quality**: TypeScript for type safety
- **Development Server**: Nodemon for backend, Vite for frontend

## 📁 Project Structure

```
clarity-dash/
├── server/                 # Backend application
│   ├── config/            # Database and app configuration
│   ├── middleware/        # JWT authentication middleware
│   ├── models/           # Mongoose schemas (User, Transaction)
│   ├── routes/           # API route handlers
│   │   ├── auth.js       # Authentication routes
│   │   ├── transactions.js # Transaction CRUD operations
│   │   ├── analytics.js  # Financial analytics endpoints
│   │   └── ml.js         # Machine learning predictions
│   ├── server.js         # Main Express server
│   └── package.json      # Backend dependencies
│
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── contexts/     # React Context providers
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── types/        # TypeScript type definitions
│   │   ├── App.tsx       # Main application component
│   │   └── main.tsx      # Application entry point
│   └── package.json      # Frontend dependencies
│
└── README.md             # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd clarity-dash
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

4. **Configure environment variables**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/clarity-dash
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CLIENT_URL=http://localhost:5173
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The API will be available at `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user
- `GET /api/auth/me` - Get current user profile

### Transactions
- `GET /api/transactions` - Get user transactions (with filtering)
- `POST /api/transactions` - Create new transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/upload-csv` - Upload CSV file
- `GET /api/transactions/categories` - Get user categories

### Analytics
- `GET /api/analytics/summary` - Financial summary
- `GET /api/analytics/spending-by-category` - Category breakdown
- `GET /api/analytics/savings-projection` - Savings trends
- `GET /api/analytics/monthly-trends` - Monthly trends

### Machine Learning
- `GET /api/ml/predict-expenses` - Expense prediction
- `GET /api/ml/spending-insights` - AI-powered insights

## 🔧 Development

### Backend Development
```bash
cd server
npm run dev          # Start development server with nodemon
npm start           # Start production server
```

### Frontend Development
```bash
cd client
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
```

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update the `MONGODB_URI` in your `.env` file
3. The application will automatically create the necessary collections

## 🎨 UI Components

### Charts
- **CategorySpendingChart**: Pie chart for spending breakdown
- **SavingsProjectionChart**: Line chart for savings trends
- **Custom Tooltips**: Interactive chart tooltips
- **Responsive Design**: Charts adapt to screen size

### Forms
- **Login/Register**: Clean authentication forms
- **Transaction Entry**: (Coming soon) Add transaction form
- **CSV Upload**: (Coming soon) File upload with mapping

### Layout
- **Navigation**: Clean header with user info
- **Dashboard**: Summary cards and charts
- **Responsive Grid**: Mobile-first layout

## 🔒 Security Considerations

- All passwords are hashed using bcrypt.js
- JWT tokens are used for stateless authentication
- Input validation prevents injection attacks
- CORS is configured for secure cross-origin requests
- Environment variables protect sensitive configuration

## 🚀 Deployment

### Backend Deployment
1. Set up a MongoDB database (Atlas recommended)
2. Configure environment variables
3. Deploy to your preferred platform (Heroku, Vercel, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure the API URL in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- [ ] Advanced transaction filtering and search
- [ ] Budget setting and tracking
- [ ] Export functionality (PDF, Excel)
- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Integration with banking APIs
- [ ] Advanced ML models for better predictions
- [ ] Multi-currency support
- [ ] Collaborative features (shared budgets)

---

Built with ❤️ using the MERN stack
