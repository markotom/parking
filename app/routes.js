define(function(){

  var routes = {
      index: function(req, res) {
        res.render('welcome/index');
      }
    , login: function(req, res) {
        res.render('users/login');
      }
    , logout: function(req, res){
        req.logout();
        res.redirect('/');
      }
  }

  return routes;

});