const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = (prisma) => {
  const router = express.Router();

  // POST /auth/login - User Login Endpoint
  router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({
        where: { email: email },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const payload = {
        userId: user.id,
        email: user.email,
      };

      const token = jwt.sign(
        payload,
        process.env.JWT_SECRET_KEY,
        { expiresIn: '1h' }
      );

      const { passwordHash, ...userWithoutPassword } = user;
      res.status(200).json({ token, user: userWithoutPassword });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error during login.' });
    }
  });

  return router;
};
