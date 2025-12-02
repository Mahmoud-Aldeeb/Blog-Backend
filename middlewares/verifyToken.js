const jwt = require("jsonwebtoken");

// verify token
function verifyToken(req, res, next) {
  const authToken = req.headers.authorization;

  if (authToken) {
    const token = authToken.split(" ")[1].replace(/[\x00-\x1F\x7F\n\r\t]/g, "");

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ message: error.message });
    }
  } else if (!authToken) {
    return res.status(401).json({ message: "no token provided" });
  }
}

// verify token & Admin

function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: "Not allowed, only admin" });
    }
  });
}
// verify token & Only User Himself

function verifyTokenAndOnlyUser(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user._id === req.params.id) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Not allowed, only user himself" });
    }
  });
}

//  Verify Token & Authorization
function verifyTokenAndAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user._id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Not allowed, only user himself or Admin" });
    }
  });
}

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyTokenAndAuthorization,
};
