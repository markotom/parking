  define(['models/entrance', 'auth', 'mailer', 'models/user'], function(Entrance, auth, mailer, users){

  var entrances = function(app){

    // retrieve all entrances
    app.get('/accesos', auth, function(req, res){
      
      var conditions = {};

      if (req.user.username != 'admin')
        conditions.approver = req.user.id;

      Entrance.find(conditions)
              .sort({ 'fullname.surname': 1 })
              .exec(function (err, docs) {
                if(err) {
                  res.send(500);
                } else {
                  res.render('entrances/index', { items: docs, users: users });
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
                        + "estacionamiento. Le informamos que podrá recoger su tarjeta en la pagaduría únicamente "
                        + "del 11 al 15 de febrero. Para que le sea entregada, es necesario que presente copia o la "
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

      if(req.user && req.user.id <= 5) {
        doc.approver = req.body.approver;
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