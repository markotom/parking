var requirejs = require('requirejs');

requirejs.config({
    baseUrl: __dirname + '/app'
  , nodeRequire: require
});


requirejs(['express', 'passport', 'passport/local', 'routes'], 
function(express, passport, localStrategy, routes){
  var app     = express()
    , server  = app.listen(process.env.PORT || 3000)
    , flash   = require ('connect-flash');

  // use passport local
  passport.use(localStrategy);

  // configuration
  app.configure(function(){
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat' }));
    app.use(express.session({ cookie: { maxAge: 60000 }}));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(flash());
  });

  // static files
  app.use(express.static(__dirname + '/public'));

  // views, template engine
  app.set("view engine", "jade");
  app.set('views', __dirname + '/app/views');
  app.engine('jade', require('jade').__express);

  // locals no globals
  app.use(function(req, res, next) {
    res.locals.flash  = req.flash.bind(req);
    res.locals.user   = req.user;
    res.locals.filter = req.session.filter;
    res.locals.expire = function(date) {
      var today = new Date;
      if( Date.parse(date) < Date.parse(today) )
        return true;
      else
        return false;
    }('2013-02-08'); // YYYY-MM-DD

    next();
  })

  // controllers 
  var entrance = requirejs('controllers/entrances')(app);

  app.get('/', routes.index);
  app.get('/login', routes.login);
  app.post('/login',
      passport.authenticate('local', {           
          successRedirect: '/accesos'                   
        , failureRedirect: '/'              
        , successFlash: '¡Bienvenido!' 
        , failureFlash: '¡El usuario o la contraseña son incorrectos!'
      })
  );
  app.get('/logout', routes.logout);

});

