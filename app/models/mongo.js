define(['config', 'mongoose'], function(config, mongo) {

  var auth = {
      user: config.mongo.user
    , pass: config.mongo.pass
  };

  mongo.connect(config.mongo.host, config.mongo.db, config.mongo.port, auth);

  return mongo;

});