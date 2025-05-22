require('dotenv').config(); // Load environment variables from .env file

const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

const express = require('express');
const { PrismaClient } = require('@prisma/client'); // Import PrismaClient

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

// POST /users - Create a new user (Sign Up)
app.post('/users', async (req, res) => {
  const { email, password, username } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10); // Generate a salt (cost factor 10)
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        username,
      },
    });

    const { passwordHash, ...userWithoutPassword } = newUser;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);

    res.status(500).json({ error: 'Failed to create user.' });
  }
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
