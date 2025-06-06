const express = require('express');
const bcrypt = require('bcryptjs'); // Needed for password hashing
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

module.exports = (prisma) => {
  // POST /users - Create a new user (Sign Up)
  router.post('/', async (req, res) => {
    const { email, password, username, userImageUrl } = req.body;

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
          ...(userImageUrl && { userImageUrl }),
        },
      });

      const { passwordHash, ...userWithoutPassword } = newUser;

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user:', error);

      res.status(500).json({ error: 'Failed to create user.' });
    }
  })

  // GET /users/:id - Get a user's profile by ID (e.g., for authenticated user's own profile)
  router.get('/:id', authMiddleware, async (req, res) => {
    const userIdFromParams = req.params.id;
    const userId = req.userId

    if (userIdFromParams !== userId) {
      return res.status(403).json({ message: 'Forbidden: You are not authorized to access this profile.' });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: userIdFromParams },
        select: {
          id: true,
          email: true,
          username: true,
          userImageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Error fetching user profile by ID:', error);

      res.status(500).json({ message: 'Server Error' });
    }
  });
  return router;
}
