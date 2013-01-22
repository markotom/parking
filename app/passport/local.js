define(['passport', 'passport-local'], function(passport, local){


  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    findById(obj.id, function (err, user) {
      done(err, user);
    });
  });

  var users = [
      { id: 1, username: 'admin',         password: 'palindromo11', email: 'mgodinez@filos.unam.mx' }
    , { id: 2, username: 'academica',     password: 'palindromo11', email: 'sacadfyl@gmail.com' }
    , { id: 3, username: 'profesionales', password: 'kMpZOKgs',     email: 'floresfarfanleticia@gmail.com' }
    , { id: 4, username: 'posgrado',      password: '2u5XO1rg',     email: 'eramirez@unam.mx' }
    , { id: 5, username: 'personal',      password: 'K201zwVH',     email: 'gonyuj@hotmail.com' }
    
    , { id: 6,  username: 'biblio',       password: 'TTKeVAH5',     email: 'biblio.ffyl@gmail.com' }
    , { id: 7,  username: 'dgi',          password: '9dkfc49n',     email: 'interculturales.unam@gmail.com' }
    , { id: 8,  username: 'latam',        password: '4kvpvZ5q',     email: 'latinoamericanos@posgrado.unam.mx' }
    , { id: 9,  username: 'filosofia',    password: 'eTNObd7c',     email: 'colefilos@gmail.com' }
    , { id: 10, username: 'geografia',    password: '4H0ysSvz',     email: 'geografiafilos@gmail.com' }
    , { id: 11, username: 'historia',     password: 'eVOv2EGr',     email: 'cliofyl@gmail.com' }
    , { id: 12, username: 'letrasc',      password: '4VxrBVJd',     email: 'patvillase@yahoo.com.mx' }
    , { id: 13, username: 'letrash',      password: 'DDcLEw5W',     email: 'colegiodehispanicas@gmail.com' }
    , { id: 14, username: 'letrasm',      password: 'DeQ3eUF9',     email: 'noemi.novell@gmail.com' }
    , { id: 15, username: 'teatro',       password: 'H4G9UGsk',     email: 'colegio.de.teatro.unam@gmail.com' }
    , { id: 16, username: 'pedagogia',    password: 'UKz7oKy6',     email: 'colegiopedagogia@gmail.com' }
  ];

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