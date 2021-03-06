const jwt = require('jsonwebtoken');
const User = require('../model/User');

const verifyRole = () => async (req, res, next) => {
  const user = await User.findById(req.userId)
  const { role } = user;

  if (role === 'ADMIN') next();
  else return res.status(401).json({ success: false, message: 'You dont have permission!' })
}

const verifySchema = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  const valid = error === undefined;

  if (valid) next();
  else {
    const { details } = error;
    const message = details.map((i) => i.message).join(',');
    res.status(400).json({ success: false, message });
  }
};

const verifyToken = () => (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Access token not found' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { verifySchema, verifyToken, verifyRole };
