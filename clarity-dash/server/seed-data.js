const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

// Sample data with past dates (last 6 months from current date)
const sampleTransactions = [
  // March 2025
  {
    date: new Date('2025-03-15'),
    description: 'Grocery Shopping',
    amount: 125.50,
    type: 'expense',
    category: 'Food & Dining'
  },
  {
    date: new Date('2025-03-16'),
    description: 'Gas Station',
    amount: 45.00,
    type: 'expense',
    category: 'Transportation'
  },
  {
    date: new Date('2025-03-17'),
    description: 'Salary Payment',
    amount: 2500.00,
    type: 'income',
    category: 'Salary'
  },
  // April 2025
  {
    date: new Date('2025-04-18'),
    description: 'Netflix Subscription',
    amount: 15.99,
    type: 'expense',
    category: 'Entertainment'
  },
  {
    date: new Date('2025-04-19'),
    description: 'Restaurant Dinner',
    amount: 85.00,
    type: 'expense',
    category: 'Food & Dining'
  },
  {
    date: new Date('2025-04-20'),
    description: 'Amazon Purchase',
    amount: 67.50,
    type: 'expense',
    category: 'Shopping'
  },
  // May 2025
  {
    date: new Date('2025-05-21'),
    description: 'Freelance Project',
    amount: 500.00,
    type: 'income',
    category: 'Freelance'
  },
  {
    date: new Date('2025-05-22'),
    description: 'Utility Bill',
    amount: 120.00,
    type: 'expense',
    category: 'Utilities'
  },
  {
    date: new Date('2025-05-23'),
    description: 'Gym Membership',
    amount: 50.00,
    type: 'expense',
    category: 'Health & Fitness'
  },
  // June 2025
  {
    date: new Date('2025-06-24'),
    description: 'Coffee Shop',
    amount: 4.50,
    type: 'expense',
    category: 'Food & Dining'
  },
  {
    date: new Date('2025-06-25'),
    description: 'Phone Bill',
    amount: 80.00,
    type: 'expense',
    category: 'Utilities'
  },
  {
    date: new Date('2025-06-26'),
    description: 'Book Purchase',
    amount: 25.00,
    type: 'expense',
    category: 'Education'
  },
  // July 2025
  {
    date: new Date('2025-07-27'),
    description: 'Investment Dividend',
    amount: 150.00,
    type: 'income',
    category: 'Investment'
  },
  {
    date: new Date('2025-07-28'),
    description: 'Car Insurance',
    amount: 200.00,
    type: 'expense',
    category: 'Insurance'
  },
  // August 2025
  {
    date: new Date('2025-08-29'),
    description: 'Home Depot',
    amount: 45.75,
    type: 'expense',
    category: 'Home & Garden'
  },
  {
    date: new Date('2025-08-30'),
    description: 'Online Course',
    amount: 199.00,
    type: 'expense',
    category: 'Education'
  },
  // August 2025 (additional data)
  {
    date: new Date('2025-08-15'),
    description: 'Monthly Salary',
    amount: 2500.00,
    type: 'income',
    category: 'Salary'
  },
  {
    date: new Date('2025-08-20'),
    description: 'Grocery Shopping',
    amount: 140.00,
    type: 'expense',
    category: 'Food & Dining'
  },
  {
    date: new Date('2025-08-25'),
    description: 'Gas Station',
    amount: 48.00,
    type: 'expense',
    category: 'Transportation'
  }
];

// Sample user
const sampleUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'password123'
};

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/clarity-dash');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Transaction.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create sample user (password will be auto-hashed by the User model)
    const user = new User(sampleUser);
    await user.save();
    console.log('Created sample user:', user.email);

    // Create sample transactions
    const transactions = sampleTransactions.map(transaction => ({
      ...transaction,
      user: user._id
    }));

    await Transaction.insertMany(transactions);
    console.log(`Created ${transactions.length} sample transactions`);

    console.log('Data seeding completed successfully!');
    console.log('Sample user credentials:');
    console.log('Email:', sampleUser.email);
    console.log('Password:', sampleUser.password);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedData();
