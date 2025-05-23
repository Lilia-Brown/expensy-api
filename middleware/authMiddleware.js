const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];


  if (!token) {
    return res.status(401).json({ error: 'Token format is incorrect, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token is not valid, authorization denied' }); // 403 Forbidden
  }
};
