// middleware/auth.js

const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/jwt"); // Store this in an environment variable

// Middleware to verify the token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied, token missing!" });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = decoded; // Attach the decoded user info to the request object
    next();
  });
}

module.exports = authenticateToken;
