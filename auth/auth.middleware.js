import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.SECRET_KEY;

const createToken = (user) => {
  let token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    {
      expiresIn: "1y",
      algorithm: "HS256",
      issuer: "faiz",
    }
  );
  return token;
};

const verifyToken = (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({
        message: "NO TOKEN FOUND.",
      });
    }

    token = token.split(" ")[1];

    const user = jwt.verify(token, secret);

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: "err : invalid token",
    });
  }
};

export { createToken, verifyToken };
