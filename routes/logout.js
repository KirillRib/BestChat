exports.post = function(req, res) {
  console.log("logout");
  req.session.destroy();
  res.redirect('/');
};