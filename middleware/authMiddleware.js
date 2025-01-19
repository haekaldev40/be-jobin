const jwt = require("jsonwebtoken");

const authToken = async (req, res, next) => {
  try {
    console.log("All Headers:", req.headers);
    
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "Access Denied! No authorization header"
      });
    }

    // Check if format is correct
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: "Invalid token format. Must start with 'Bearer '"
      });
    }

    const token = authHeader && authHeader.split(" ")[1];
    console.log(token)

    if (!token) {
      return res.status(401).json({
        error: "Access Denied!",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    }
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token." });
  }
};

const checkRole = (role) => {
  return async (req, res, next) => {
    try {
      if (req.user.role !== role) {
        return res
          .status(403)
          .json({ error: "Access denied. Insufficient permissions." });
      }
      next();
    } catch (error) {
      res.status(500).json({ error: "Error checking role." });
    }
  };
};

module.exports = {
  authToken,
  checkRole,
};
