define(['nodemailer', 'config'], function(nodemailer, config){

  // smtp gmail
  return nodemailer.createTransport("SMTP", config.mailer);

});