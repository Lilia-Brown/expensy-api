const express = require('express');
const bcrypt = require('bcryptjs'); // Needed for password hashing

const router = express.Router();

module.exports = (prisma) => {
  // POST /users - Create a new user (Sign Up)
  router.post('/', async (req, res) => {
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
  })
  return router;
}
