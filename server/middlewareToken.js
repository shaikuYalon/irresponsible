import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    // הוספת אימות נתוני הטוקן
    if (!decoded.user_id || !decoded.role) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    req.userId = decoded.user_id; // מזהה המשתמש
    req.role = decoded.role; // תפקיד המשתמש
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Token is invalid", error: error.message });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  console.log("Admin verified");
  next();
};

export default { verifyToken, verifyAdmin };