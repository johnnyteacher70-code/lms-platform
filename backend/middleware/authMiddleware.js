const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'maxfiy_kalit');
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Avtorizatsiyadan o\'tilmagan, token xato' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Avtorizatsiyadan o\'tilmagan, token yo\'q' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Ushbu amalni bajarish uchun admin huquqi kerak' });
  }
};

module.exports = { protect, admin };
