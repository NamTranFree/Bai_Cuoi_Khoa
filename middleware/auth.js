/**
 * Authentication middleware to check if user is logged in
 */
const isAuthenticated = (request, response, next) => {
  if (!request.session.userId) {
    return response.status(401).json({ error: "Unauthorized - Please login first" });
  }
  next();
};

module.exports = { isAuthenticated };
