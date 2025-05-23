require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const app = express();

const PORT = process.env.PORT || 3000;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware to parse JSON requests
app.use(express.json());

// Routing
app.get('/', (req, res) => {
  res.send('Welcome to Expensy!');
});

app.use('/auth', require('./routes/authRoutes')(prisma));
app.use('/budgets', require('./routes/budgetRoutes')(prisma));
app.use('/categories', require('./routes/categoryRoutes')(prisma));
app.use('/expenses', require('./routes/expenseRoutes')(prisma));
app.use('/users', require('./routes/userRoutes')(prisma));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access it at: http://localhost:${PORT}`);
});

// Graceful shutdown for Prisma Client
process.on('SIGINT', async () => {
  await prisma.$disconnect(); // Disconnect Prisma Client
  console.log('Prisma Client disconnected due to app termination');
  process.exit(0);
});
