  define(['underscore', 'models/entrance', 'auth', 'mailer', 'models/user', 'json2csv', 'fs'], 
  function(_, Entrance, auth, mailer, users, json2csv, fs){

  function alphabetically(a, b){
    var name  = a.fullname.surname.toLowerCase()
      , name2 = b.fullname.surname.toLowerCase();

    return name > name2 ? 1 : -1;
  }

  var entrances = function(app){

    // retrieve all entrances
    app.get('/accesos', auth, function(req, res){
      
      var conditions = {};

      if(req.session.filter && req.session.filter.conditions)
        conditions = req.session.filter.conditions;

      if (req.user.username != 'admin')
        conditions.approver = req.user.id;

      Entrance.find(conditions)
              .exec(function (err, docs) {
                if(err) {
                  res.send(500);
                } else {
                  docs = _(docs).sort(alphabetically);
                  res.render('entrances/index', { items: docs, users: users });
                }
              });
    });

    app.get('/accesos/filter/:filter', function(req, res){
      var filter = parseInt(req.params.filter) || 1
        , conditions;

      switch(filter){
        case 2:
          filter      = 'Aprobadas';
          conditions  = { status: 'Aprobada' };
        break;
        case 3:
          filter      = 'Confirmar';
          conditions  = { status: 'Confirmar' };
        break;
        case 4:
          filter      = 'Rechazadas';
          conditions  = { status: 'Rechazada' };
        break;
        case 5:
          filter      = 'Pendientes';
          conditions  = { status: 'Pendiente' };
        break;
        case 6:
          filter      = 'Tarjetas entregadas';
          conditions  = { status: 'Aprobada', 'card.number': { $exists: true }, 'card.delivered': true };
        break;
        case 7:
          filter      = 'Tarjetas por entregar';
          conditions  = { status: 'Aprobada', 'card.number': { $exists: true }, 'card.delivered': { $ne: true } };
        break;
        case 8:
          filter      = 'Aprobadas sin tarjeta';
          conditions  = { status: 'Aprobada', 'card.number': { $exists: false } };
        break;
        default:
          filter      = 'Todas';
          conditions  = {};    
      }
      
      req.session.filter = {
          filter:     filter 
        , conditions: conditions
      };
      res.redirect('/accesos');

    });

    app.get('/accesos/print', auth, function(req, res){
      var conditions = { status: 'Aprobada' };
      Entrance.find(conditions)
              .exec(function(err, docs){
                if(err){
                  res.send(500);
                } else {
                  docs = _(docs).sort(alphabetically);
                  res.render('entrances/print-all', { docs: docs })
                }
              });
    });

    app.get('/count', function(req, res){
      var conditions = {};
      Entrance.find(conditions)
              .exec(function (err, docs) {

                var aprobadas = 0
                  , confirmar = 0
                  , rechazadas = 0
                  , pendientes = 0;

                for (var i = docs.length - 1; i >= 0; i--) {

                  switch(docs[i]['status']){
                    case 'Aprobada': aprobadas++; break;
                    case 'Confirmar': confirmar++; break;
                    case 'Rechazada': rechazadas++; break;
                    case 'Pendiente': pendientes++; break;
                  }

                }

                var message = "Aprobadas: " + aprobadas + "<br>" + "Confirmar: " + confirmar + "<br>" + "Rechazadas: " + rechazadas + "<br>" + "Pendientes: " + pendientes; 

                res.header('Content-Type', 'text/html');
                res.send(message);
                
              });
    });

    app.get('/haterene', function(req, res){

      fs.readFile('cards.csv', 'utf-8', function(err, data){

        var lines = data.toString().split(/\r\n|\r|\n/);

        Entrance.find({})
                .exec(function(err, docs) {

                  for (var i = lines.length - 1; i >= 0; i--) {
                    var line = lines[i].split(',');
                    
                    docs.forEach(function(doc){
                      var fullname  = doc.fullname.name.replace(/^\s+|\s+$/g, '') + " " + doc.fullname.surname.replace(/^\s+|\s+$/g, '')
                        , fullname2 = line[2].replace(/^\s+|\s+$/g, '') + " " + line[3].replace(/^\s+|\s+$/g, '')
                        , card      = parseFloat(line[0]);
                      
                      if(fullname.toLowerCase() === fullname2.toLowerCase()) {
                        Entrance.findOne({ _id: doc._id }, function(err, item){
                          if(card) {
                            card = String('00000' + card).slice(-5);
                            item.card.number = card;

                            item.save(function(err, saved){
                              console.log(card, item.fullname.surname);
                              console.log(err);
                            });
                          }
                        });
                      }
                    });
                  };

                });

      });

    });

    app.get('/solicitudes.csv', function(req, res){
      var conditions = {};

      conditions.status = req.query.status || 'Aprobada';


      Entrance.find(conditions)
              .exec(function (err, docs) {
                if(err) {
                  res.send(500);
                } else {

                  var json = [], doc;
                  docs = _(docs).sort(alphabetically);

                  for (var i = docs.length - 1; i >= 0; i--) {

                    doc = docs[i];

                    json.push({
                        "ID UNAM": doc['id_unam'] || ''
                      , "Tipo": doc['adscription'] || ''
                      , "Apellidos": doc['fullname']['surname'] || ''
                      , "Nombre": doc['fullname']['name'] || ''
                      , "Correo": doc['email'] || ''
                      , "Teléfono": doc['phone'] || ''
                      , "Categoría": doc['category'] || ''
                      , "División": doc['division'] || ''
                      , "Colegio": doc['college'] || ''
                      , "Posgrado": doc['graduate'] || ''
                      , "Placas": doc['car']['plates'] || ''
                      , "Modelo": doc['car']['model'] || ''
                      , "Color": doc['car']['color'] || ''
                      , "Año": doc['car']['year'] || ''
                      , "Estado": doc['status'] || ''
                    });
                  };


                  json2csv({ data: json , fields: [ 'ID UNAM', 'Tipo', 'Apellidos', 'Nombre', 'Correo', 'Categoría', 'División', 'Colegio', 'Posgrado', 'Placas', 'Modelo', 'Color', 'Año', 'Estado' ]}, function(csv){
                    res.header("Content-Type", "application/vnd.ms-excel");
                    res.send(csv);
                  });
                  
                }
              });
    });

    // form
    app.get('/accesos/add', function(req, res) {
      res.render('entrances/form', { item: {} });
    });

    app.get('/accesos/:id', auth, function(req, res){

      var id = req.params.id;

      Entrance.findById(id, function (err, doc) {
        if(err) {
          req.flash('error', "No se encontró el registro");
          res.redirect('/');
        }
        
        res.render('entrances/form', { item: doc, users: users });
      });

    });

    // approve (toggle)
    app.get('/accesos/:id/status', auth, function(req, res){
      var id = req.params.id;
      Entrance.findOne({ _id: id }, function (err, doc) {
        if(err) {
          req.flash('error', "No se encontró el registro");
          res.redirect('/accesos');
        }
        doc.status = doc.status == 'Pendiente' ? 'Confirmar' : 'Aprobada';
        doc.save(function (err, saved) {
          if(err) {
            req.flash('error', "No fue posible cambiar el estado");
            res.redirect('/accesos');
          }

          if(saved.status == 'Aprobada') {
            var message = "<p>Estimado(a) " + saved.fullname.name + " " + saved.fullname.surname + ",</p>"
                        + "<p></p><p></p>"
                        + "<p>Sus datos han sido registrados y se le asignó una nueva tarjeta de ingreso al "
                        + "estacionamiento. Debido a la prórroga de los días 6 y 7 de febrero se recorre la fecha de entrega de tarjetas. "
                        + "Le informamos que podrá recoger su tarjeta en la pagaduría únicamente "
                        + "del 13 al 20 de febrero, de 10:00 a 13:00 hrs. y de 17:00 a 19:00 hrs. Para que le sea entregada, es necesario que presente copia o la "
                        + "tarjeta de circulación del automóvil que registró en su solicitud.</p>"
                        + "<p></p><p></p>"
                        + "<p>Por el momento podrá seguir utilizando la tarjeta anterior (blanca), y posteriormente "
                        + "le informaremos a partir de que día el ingreso será únicamente con la nueva tarjeta.</p>"
                        + "<p></p><p></p>"
                        + "<p>Nota: La tarjeta permanente que se le entregará no tiene costo, pero en caso de "
                        + "extravío, deberá reportarla en pagaduría y si requiere una reposición, el costo de la misma "
                        + "será de $500.00 pesos, monto equivalente sólo al costo de recuperación del plástico.</p>"
                        + "<p></p><p></p>"
                        + "<p>Atentamente,"
                        + "<br>Dr. Ernesto Priani Saisó"
                        + "<br>Secretario Académico</p>";

            var mailOptions = {
                from:     "Secretaría Académica <sacadfyl@gmail.com>"
              , to:       saved.email
              , subject:  "Entrega de tarjeta de estacionamiento"
              , html:     message
            }
            
            // send mail with gmail
            mailer.sendMail(mailOptions, function(err, res){
              if(!err)
                console.log("Mensaje enviado: " + res.message);
            });

          }

          req.flash('success', 
              "Se ha actualizado correctamente el estado de la solicitud de "
            + saved.fullname.name + ' ' + saved.fullname.surname + " (" + saved.id_unam + "). ");
          res.redirect('/accesos');

        });

      });
    });

    // revoke
    app.get('/accesos/:id/revoke', auth, function(req, res){
      var id = req.params.id;
      Entrance.findOne({ _id: id }, function (err, doc) {
        if(err) {
          req.flash('error', "No se encontró el registro");
          res.redirect('/accesos');
        }

        doc.status = 'Rechazada';
        doc.save(function (err, saved) {
          if(err) {
            req.flash('error', "No fue posible cambiar el estado");
            res.redirect('/accesos');
          }

          req.flash('success', 
              "Se ha actualizado correctamente el estado de la solicitud de "
            + saved.fullname.name + ' ' + saved.fullname.surname + " (" + saved.id_unam + "). ");
          res.redirect('/accesos');

        });

      });
    });

    // delete
    app.get('/accesos/:id/delete', auth, function(req, res) {
        var id = req.params.id;
        Entrance.remove({ _id: id }, function(err, deleted) {
            if (err) {
              req.flash('error', "No fue posible eliminar la solicitud");
              res.redirect('/accesos');
            }

            req.flash('success', deleted + ' solicitud eliminada');
            res.redirect('/accesos');
            
        });
    });

    app.get('/accesos/:id/print', auth, function(req, res){
      var id = req.params.id;
      Entrance.findOne({ _id: id }, function(err, doc){
        if(err){
          res.send(500);
        } else {
          res.render('entrances/print', { item: doc });
        }
      });
    });

    app.get('/accesos/:id/delivered', auth, function(req, res){
      var id = req.params.id;
      Entrance.findOne({ _id: id }, function(err, doc){
        if(err){
          res.send(500);
        } else {
          doc.card.delivered = true === doc.card.delivered ? false : true;
          doc.save(function(err, saved){
            if(err)
              res.send(500);
            else
              res.send(saved);
          });
        }
      });
    });

    // add or save
    app.post('/accesos', function(req, res){

      var doc = {
          id_unam:      parseFloat(req.body.id_unam)
        , fullname: {
            name:       req.body.fullname.name
          , surname:    req.body.fullname.surname
        }
        , phone:        req.body.phone
        , email:        req.body.email 
        , adscription:  req.body.adscription
        , car: {
            plates:     req.body.car.plates
          , model:      req.body.car.model
          , color:      req.body.car.color
          , year:       parseFloat(req.body.car.year)
        }
      };

      if (doc.adscription == 'Administrativo') {
        doc.category    = req.body.category_ad;
        doc.approver    = 5; // personal
      }

      if (doc.adscription == 'Académico') {
        doc.category    = req.body.category_ac;

        if(req.body.division)
          doc.division = req.body.division;

        switch(doc.division){
          case 'Licenciatura':
            doc.college  = req.body.college;
            doc.approver = 3; // profesionales

            switch(doc.college){
              case 'Bibliotecología':                       doc.approver = 8; break;
              case 'Desarrollo y Gestión Interculturales':  doc.approver = 9; break;
              case 'Estudios Latinoamericanos':             doc.approver = 10; break;
              case 'Filosofía':                             doc.approver = 11; break;
              case 'Geografía':                             doc.approver = 12; break;
              case 'Historia':                              doc.approver = 13; break;
              case 'Letras Clásicas':                       doc.approver = 14; break;
              case 'Letras Hispánicas':                     doc.approver = 15; break;
              case 'Letras Modernas':                       doc.approver = 16; break;
              case 'Literatura Dramática y Teatro':         doc.approver = 17; break;
              case 'Pedagogía':                             doc.approver = 18; break;
              default:
                doc.approver = 3; // profesionales                
            }

          break;
          case 'Posgrado':
            doc.graduate = req.body.graduate;
            doc.approver = 4; // posgrado
          break;
          case 'DELEFyL':
            doc.approver = 6; // delefyl
          break;
          case 'SUAyED':
            doc.approver = 7; // suayed
          break;
          default:
            doc.approver = 2; // academica
        }

        switch(doc.category) {
          case 'Profesor de carrera':
          case 'Profesor de asignatura definitivo':
          case 'Técnico académico':
            doc.approver = 2; // academica
          break;
        }

      }

      if(req.user && req.user.id <= 2) {
        doc.approver = req.body.approver;

        if(req.body.card) {
          doc.card = {
              number:     parseFloat(req.body.card.number) || null
            , delivered:  req.body.card.delivered || null
          }
        }
      }

      if(req.body._id) {
        
        Entrance.findByIdAndUpdate(req.body._id, doc, function (err, item) {
          if(err) {
            req.flash('error', "No se pudo actualizar");
            res.redirect('/');
          }

          req.flash('success', 
            "Se ha actualizado correctamente la solicitud de " + 
            item.fullname.name + ' ' + item.fullname.surname + " (" + item.id_unam + ")");
          res.redirect('/');

        });

      } else {

        var entrance = new Entrance(doc);
        entrance.save(function (err, saved) {
          if (err) {
            req.flash('error', "¡No se pudo guardar el documento!");
            res.redirect('/');
          }

          var message = "<p>Estimado " + doc.fullname.name + " " + doc.fullname.surname + ",</p>"
                      + "<p>Se ha generado la solicitud con el número de identificación "
                      + "<b>"+ saved._id + "</b>, sugerimos conservar este registro hasta "
                      + "terminar el trámite para cualquier aclaración o duda.</p>"
                      + "<p></p> <p></p>";

          switch(saved.category) {
            case 'Profesor de carrera':
            case 'Profesor de asignatura definitivo':
            case 'Técnico académico':
            case 'Funcionario':
              message +="<p>Las nuevas tarjetas se entregarán en la pagaduría únicamente "
                      + "del 9 al 15 de febrero.</p>";
            break;

            default:
              message +="<p>Para obtener información del proceso de asignación de las tarjetas "
                      + "deberás dirigirte a tu coordinación de licenciatura, a la División de "
                      + "Estudios de Posgrado, al DELEFyL o al Departamento de Personal "
                      + "Administrativo. Las nuevas tarjetas se entregarán en la pagaduría "
                      + "únicamente del 9 al 15 de febrero.</p>"
          }

          message    += "<p></p> <p></p>"
                      + "<p>Atentamente,"
                      + "<br><br>Ernesto Priani Saisó"
                      + "<br>Secretario Académico</p>";

          var mailOptions = {
              from:     "Secretaría Académica <sacadfyl@gmail.com>"
            , to:       doc.email
            , subject:  "Solicitud de tarjeta de estacionamiento"
            , html:     message
          }

          // send mail with gmail
          mailer.sendMail(mailOptions, function(err, res){
            if(!err)
              console.log("Mensaje enviado: " + res.message);
          });

          req.flash('success_large', "Gracias por enviar tu solicitud. Recibirás un correo de confirmación.");
          res.redirect('/');

        });

      }
      
    });

  };

  return entrances;

});