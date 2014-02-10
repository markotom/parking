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
        service: "gmail"
      , sendmail: {
          path: "/usr/sbin/sendmail"
        }
      , gmail: {
          service: "Gmail",
          auth: {
              user: "sacadfyl@gmail.com"
            , pass: "palindromo11"
          }
        }
      , ses : {
          auth: {
              accesskey: "AKIAI2F6B4SB7FBJAXIQ"
            , secretkey: "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"
            , serviceurl: "https://email.us-east-1.amazonaws.com"
          }
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