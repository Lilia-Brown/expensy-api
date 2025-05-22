const express = require('express');
const { PrismaClient } = require('@prisma/client'); // Import PrismaClient

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// Middleware to parse JSON requests
app.use(express.json());

// Routing
app.get('/', (req, res) => {
  res.send('Welcome to Expensy!');
});

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
