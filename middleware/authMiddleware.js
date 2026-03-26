exports.requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/auth/login?usertype=user");
  }
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.session.userId || req.session.usertype !== "admin") {
    return res.redirect("/auth/login?usertype=admin");
  }
  next();
};