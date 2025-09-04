const jwt = require('jsonwebtoken');

// Mock users for development
const mockUsers = [
  {
    id: 1,
    name: 'Demo User',
    email: 'demo@permitpro.com',
    role: 'User'
  },
  {
    id: 2,
    name: 'Admin User',
    email: 'admin@permitpro.com',
    role: 'Admin'
  }
];

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('Decoded token:', decoded);
    
    // Find user in mock data (handle both string and integer IDs)
    const userId = parseInt(decoded.id);
    const user = mockUsers.find(u => u.id === userId);
    console.log('Found user:', user);

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protect, isAdmin };
