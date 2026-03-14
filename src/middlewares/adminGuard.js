import "dotenv/config";
export const adminGurad = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];
  if (!adminKey || adminKey !== process.env.ADMIN_API_KEY) {
    return res
      .status(401)
      .json({ status: "Forbidden", message: "Unauthorized" });
  }
  next();
};
