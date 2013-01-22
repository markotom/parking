$(function(){

  if($("#entranceForm")) {

    $("#entranceForm input[name=adscription]").change(function(){
      var value       = $(this).val()
        , category_ac = $('#category_ac')
        , category_ad = $('#category_ad');

      if(value == 'Administrativo') {
        category_ad.show();
        category_ac.hide();
      } else {
        category_ad.hide();
        category_ac.show();
      }
    });

    $("#entranceForm input[name=division]").change(function(){
      var value        = $(this).val()
        , division_pro = $('#division_pro')
        , division_pos = $('#division_pos');

      if(value == 'Posgrado') {
        division_pos.show();
        division_pro.hide();
      } else {
        division_pos.hide();
        division_pro.show();
      }
    });

    $('#entranceForm').validate({
      rules: {
          id_unam: {
              minlength: 5
            , number: true
            , required: true
          }
        , "fullname[name]": {
              minlength: 2
            , required: true
          }
        , "fullname[surname]": {
              minlength: 2
            , required: true
          }
        , email: {
            required: true
          , email: true
          }
        , email2: {
            required: true
          , equalTo: "#email"
          , email: true
          }
        , 'car[model]': {
            minlength: 2
          , required: true
          }
        , 'car[color]': {
            minlength: 2
          , required: true
          }
        , 'car[plates]': {
            minlength: 2
          , required: true
          }
        , 'car[year]': {
            required: true
          , minlength: 4
          , number: true
          }
      }
    , highlight: function(label) {
      $(label).closest('.control-group').addClass('error');
    }
    , success: function(label) {
      label.closest('.control-group').addClass('success');
      }
    });


    $("#entranceForm input[name=adscription]:checked").change();
    $("#entranceForm input[name=division]:checked").change();

  }

  $('body').delegate('.confirm', 'click', function(){
    if(confirm("¿Estás seguro que deseas \"" + $(this).attr('title') + "\"? Quizás sean irreversibles los cambios.")) {
      return true;
    } else {
      return false;
    }
  });

});

jQuery.extend(jQuery.validator.messages, {
    required: "Este campo es requerido.",
    remote: "Por favor corrige este campo.",
    email: "Por favor añade una dirección de correo válida.",
    url: "Por favor añade una URL válida.",
    number: "Por favor añade un número válido.",
    digits: "Por favor añade sólo digitos.",
    equalTo: "Por favor añade el mismo valor otra vez.",
    accept: "Por favor añade un valor con una extensión válida.",
    maxlength: jQuery.validator.format("Por favor añade no más de {0} caracteres."),
    minlength: jQuery.validator.format("Por favor añade al menos {0} caracteres."),
    range: jQuery.validator.format("Por favor añade un valor entre {0} y {1}."),
    max: jQuery.validator.format("Por favor añade un valor menor o igual a {0}."),
    min: jQuery.validator.format("Por favor añade un valor mayor o igual a {0}.")
});