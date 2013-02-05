define(['nodemailer', 'config'], function(nodemailer, config){

	var transport;

	switch( config.mailer.service ) {

		case 'Gmail':
			// smtp gmail
			transport = nodemailer.createTransport("SMTP", config.mailer);
		break;

		default:
			transport = nodemailer.createTransport("Sendmail", config.mailer.sendmail);

	}

	return transport;

});