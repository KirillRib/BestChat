exports.get = function(req, res) {
  console.log("chat");
  //res.render('chat', {user: req.user});
  res.redirect('/');
};