define(['models/mongo'], function(mongo) {

  var schema = new mongo.Schema({
      id_unam: Number
    , fullname: {
        name: String
      , surname: String
    }
    , phone: String
    , email: String
    , adscription: String
    , category: String
    , division: String
    , college: String
    , graduate: String
    , car: {
        plates: String
      , model: String
      , color: String
      , year: Number
    }
    , status: {
        type: String
      , required: true
      , default: 'Pendiente'
    }
    , approver: Number
    , card: {
        number: Number
      , delivered: {
            type: Boolean
          , default: false
        }
    }
    , created_at: Date
    , updated_at: Date
  });

  var Entrance = mongo.model('Entrance', schema); 
  return Entrance;

});