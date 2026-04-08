/*
middleware checks which role is allowed into which route
1. routes decide where the request wants to go
2. middleware decides whether the user is allowed through
3. controller handles the actual page/data logic

NOTE: Without requireAdmin, a normal logged-in user could manually type an admin URL like:
/auth/admin/dashboard
/home-display/admin/giveups
/home-display/admin/analytics

*/



//if no logged-in session exists, send user to user login otherwise continue to the next controller
exports.requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/auth/login?usertype=user");
  }
  next();
};


/*
no session = blocked
user session = blocked
admin session = allowed
*/
exports.requireAdmin = (req, res, next) => {
  if (!req.session.userId || req.session.usertype !== "admin") {
    return res.redirect("/auth/login?usertype=admin");  //send the person to the admin login page
  }
  next(); //the person is logged in and their usertype is "admin" so continue to the actual route/controller
};


