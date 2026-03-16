import "../config/env.js";

export const adminGuard = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or missing admin credentials'
    });
  }

  next();
};
