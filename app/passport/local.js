define(['passport', 'passport-local', 'models/user'], function(passport, local, users){


  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    findById(obj.id, function (err, user) {
      done(err, user);
    });
  });

  findById = function(id, fn) {
    var idx = id - 1;
    if (users[idx]) {
      fn(null, users[idx]);
    } else {
      fn(new Error('El usuario ' + id + ' no existe'));
    }
  };

  findByUsername = function(username, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
      var user = users[i];
      if (user.username === username) {
        return fn(null, user);
      }
    }
    return fn(null, null);
  };

  var LocalStrategy = local.Strategy;

  return new LocalStrategy(
    function(username, password, done) {
      process.nextTick(function () {
        
        findByUsername(username, function(err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false, { message: 'No existe el usuario ' + username }); }
          if (user.password != password) { return done(null, false, { message: 'Contraseña inválida' }); }
          return done(null, user);
        })
      });
    }
  );

});