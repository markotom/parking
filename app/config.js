define(function() {
  
  var enviroment
    , development
    , test
    , production;


  development = {
      mongo : {
        user : 'filos',
        pass : 'we3f10s1m',
        host : 'linus.mongohq.com',
        port : 10076,
        db   : 'filos_estacionamiento'
      }
    , mailer : {
        service: "Gmail"
      , auth: {
            user: "epriani@filos.unam.mx"
          , pass: "palindromo11"
        }
      }
  }

  test        = development;
  production  = development;


  switch ( process.env.NODE_ENV ) {

    case 'production':
      enviroment = production;
    break;

    case 'test':
      enviroment = test;
    break;

    default:
      enviroment = development;
  
  }

  return enviroment;

});